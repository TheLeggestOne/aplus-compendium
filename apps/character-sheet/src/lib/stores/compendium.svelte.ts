import type {
  CompendiumContentType,
  CompendiumEntry,
  CompendiumSearchFilters,
  CompendiumSearchResult,
  CompendiumStatus,
  ImportProgress,
} from '@aplus-compendium/types';

const CONTENT_TYPES: CompendiumContentType[] = [
  'spell',
  'item',
  'feat',
  'background',
  'race',
  'class',
  'subclass',
  'optional-feature',
  'condition',
];

function createCompendiumStore() {
  // Panel visibility & navigation
  let panelOpen = $state(false);
  let activeType = $state<CompendiumContentType>('spell');

  // Search state
  let query = $state('');
  let filters = $state<CompendiumSearchFilters>({});
  let results = $state<CompendiumSearchResult[]>([]);
  let isSearching = $state(false);
  let hasMore = $state(false);
  let isLoadingMore = $state(false);
  const PAGE_SIZE = 50;

  // Selected entry detail
  let selectedId = $state<string | null>(null);
  let selectedEntry = $state<CompendiumEntry | null>(null);
  let isLoadingEntry = $state(false);

  // Compendium status & import
  let status = $state<CompendiumStatus | null>(null);
  let isImporting = $state(false);
  let importProgress = $state<ImportProgress | null>(null);

  // Available sources for the active content type (for filter UI)
  let availableSources = $state<string[]>([]);

  // Debounced search — stale token prevents older results overwriting newer ones
  let _searchTimer: ReturnType<typeof setTimeout> | null = null;
  let _searchToken = 0;

  async function _executeSearch() {
    const api = window.electronAPI;
    if (!api) return;

    const token = ++_searchToken;
    isSearching = true;

    try {
      const plainFilters = JSON.parse(JSON.stringify(filters)) as typeof filters;
      const result = await api.compendium.search(query.trim(), activeType, plainFilters, PAGE_SIZE, 0);
      if (token !== _searchToken) return; // stale
      if (result.ok) {
        results = result.data;
        hasMore = result.data.length >= PAGE_SIZE;
      } else {
        console.error('[compendium] search failed:', result.error);
      }
    } catch (e) {
      console.error('[compendium] search IPC error:', e);
    } finally {
      if (token === _searchToken) isSearching = false;
    }
  }

  async function _loadMore() {
    const api = window.electronAPI;
    if (!api || isLoadingMore || !hasMore) return;

    const token = _searchToken; // don't increment — not a new search
    isLoadingMore = true;

    try {
      const plainFilters = JSON.parse(JSON.stringify(filters)) as typeof filters;
      const result = await api.compendium.search(query.trim(), activeType, plainFilters, PAGE_SIZE, results.length);
      if (token !== _searchToken) return; // search changed while loading
      if (result.ok) {
        results = [...results, ...result.data];
        hasMore = result.data.length >= PAGE_SIZE;
      }
    } catch (e) {
      console.error('[compendium] loadMore IPC error:', e);
    } finally {
      isLoadingMore = false;
    }
  }

  function queueSearch() {
    if (_searchTimer) clearTimeout(_searchTimer);
    _searchTimer = setTimeout(_executeSearch, 300);
  }

  async function _loadSources() {
    const api = window.electronAPI;
    if (!api) return;
    const result = await api.compendium.listSources(activeType);
    if (result.ok) availableSources = result.data;
  }

  return {
    // --- Getters ---
    get panelOpen() { return panelOpen; },
    get activeType() { return activeType; },
    get query() { return query; },
    get filters() { return filters; },
    get results() { return results; },
    get isSearching() { return isSearching; },
    get hasMore() { return hasMore; },
    get isLoadingMore() { return isLoadingMore; },
    get selectedId() { return selectedId; },
    get selectedEntry() { return selectedEntry; },
    get isLoadingEntry() { return isLoadingEntry; },
    get status() { return status; },
    get isImporting() { return isImporting; },
    get importProgress() { return importProgress; },
    get availableSources() { return availableSources; },
    get contentTypes() { return CONTENT_TYPES; },

    // --- Lifecycle ---
    async initialize(): Promise<void> {
      const api = window.electronAPI;
      if (!api) return;
      try {
        const result = await api.compendium.status();
        if (result.ok) status = result.data;
      } catch (e) {
        console.error('[compendium] status IPC error:', e);
      }
    },

    // --- Panel control ---
    openPanel(type?: CompendiumContentType): void {
      if (type) activeType = type;
      panelOpen = true;
      void _loadSources();
      queueSearch();
    },

    closePanel(): void {
      panelOpen = false;
    },

    togglePanel(): void {
      if (panelOpen) {
        panelOpen = false;
      } else {
        panelOpen = true;
        void _loadSources();
        queueSearch();
      }
    },

    // --- Navigation ---
    setType(type: CompendiumContentType): void {
      if (activeType === type) return;
      activeType = type;
      query = '';
      filters = {};
      results = [];
      selectedId = null;
      selectedEntry = null;
      void _loadSources();
      queueSearch();
    },

    // --- Search ---
    setQuery(q: string): void {
      query = q;
      queueSearch();
    },

    setFilters(f: CompendiumSearchFilters): void {
      filters = f;
      queueSearch();
    },

    clearFilters(): void {
      filters = {};
      queueSearch();
    },

    loadMore(): void {
      void _loadMore();
    },

    // --- Entry selection ---
    async selectEntry(id: string | null): Promise<void> {
      if (id === null) {
        selectedId = null;
        selectedEntry = null;
        return;
      }

      if (id === selectedId) {
        // Toggle collapse
        selectedId = null;
        selectedEntry = null;
        return;
      }

      const api = window.electronAPI;
      if (!api) return;

      selectedId = id;
      selectedEntry = null;
      isLoadingEntry = true;

      try {
        const result = await api.compendium.get(id, activeType);
        if (result.ok && result.data) {
          selectedEntry = result.data;
        }
      } catch (e) {
        console.error('[compendium] get IPC error:', e);
      } finally {
        isLoadingEntry = false;
      }
    },

    // --- Clear ---
    async clearData(): Promise<void> {
      const api = window.electronAPI;
      if (!api) return;
      try {
        const result = await api.compendium.clear();
        if (result.ok) {
          status = null;
          results = [];
          selectedId = null;
          selectedEntry = null;
          availableSources = [];
        } else {
          console.error('[compendium] clear failed:', result.error);
        }
      } catch (e) {
        console.error('[compendium] clear IPC error:', e);
      }
    },

    // --- Import ---
    async triggerImport(): Promise<void> {
      const api = window.electronAPI;
      if (!api) return;

      try {
        const dirResult = await api.compendium.selectDir();
        if (!dirResult.ok || !dirResult.data) return;

        isImporting = true;
        importProgress = null;

        api.compendium.onProgress((progress: ImportProgress) => {
          importProgress = progress;
          if (progress.done) {
            isImporting = false;
            api.compendium.offProgress();
            void api.compendium.status().then(r => { if (r.ok) status = r.data; }).catch(() => {});
            queueSearch();
          }
        });

        await api.compendium.import(dirResult.data);
      } catch (e) {
        console.error('[compendium] import error:', e);
        isImporting = false;
      }
    },
  };
}

export const compendiumStore = createCompendiumStore();
