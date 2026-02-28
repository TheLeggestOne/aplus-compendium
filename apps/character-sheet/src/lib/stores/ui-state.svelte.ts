export type CharacterSheetTab =
  | 'core-stats'
  | 'combat'
  | 'spellcasting'
  | 'features-equipment'
  | 'progression'
  | 'details';

const ACTIVE_CHAR_KEY = 'aplus:activeCharacterId';

function createUiStore() {
  let activeTab = $state<CharacterSheetTab>('core-stats');
  let isEditMode = $state(false);
  let hpDialogOpen = $state(false);
  let activeCharacterId = $state<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_CHAR_KEY) : null,
  );

  return {
    get activeTab() { return activeTab; },
    get isEditMode() { return isEditMode; },
    get hpDialogOpen() { return hpDialogOpen; },
    get activeCharacterId() { return activeCharacterId; },

    setActiveTab(tab: CharacterSheetTab): void {
      activeTab = tab;
    },
    toggleEditMode(): void {
      isEditMode = !isEditMode;
    },
    setHpDialogOpen(open: boolean): void {
      hpDialogOpen = open;
    },
    setActiveCharacter(id: string): void {
      activeCharacterId = id;
      localStorage.setItem(ACTIVE_CHAR_KEY, id);
    },
    clearActiveCharacter(): void {
      activeCharacterId = null;
      localStorage.removeItem(ACTIVE_CHAR_KEY);
    },
  };
}

export const uiStore = createUiStore();
