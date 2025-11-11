// Type definitions for the Electron API
export interface ElectronAPI {
	content: {
		getAll: (type: string) => Promise<any[]>;
		get: (type: string, name: string, source: string) => Promise<any>;
		import: (type: string, items: any[], source: string) => Promise<void>;
		search: (type: string, query: string) => Promise<any[]>;
		delete: (type: string, name: string, source: string) => Promise<void>;
		loadFile: (filePath: string, contentType: string, source: string) => Promise<any>;
		loadDirectory: (dirPath: string, source: string) => Promise<any>;
	};
	character: {
		getAll: () => Promise<any[]>;
		get: (characterId: string) => Promise<any>;
		save: (characterId: string, data: any) => Promise<void>;
		delete: (characterId: string) => Promise<void>;
		duplicate: (sourceId: string, newId: string) => Promise<void>;
		exists: (characterId: string) => Promise<boolean>;
	};
}

// Check if we're running in Electron
export function isElectron(): boolean {
	return typeof window !== 'undefined' && 'electronAPI' in window;
}

// Get the Electron API (with type safety)
export function getElectronAPI(): ElectronAPI | null {
	if (isElectron()) {
		return (window as any).electronAPI as ElectronAPI;
	}
	return null;
}

// Content type mapping - must match backend fileHandler.js
export const CONTENT_TYPES = {
	ACTIONS: 'actions',
	BACKGROUNDS: 'backgrounds',
	CLASSES: 'classes',
	CONDITIONS: 'conditions',
	DECKS: 'decks',
	DEITIES: 'deities',
	FEATS: 'feats',
	ITEMS: 'items',
	LANGUAGES: 'languages',
	MONSTERS: 'monsters',
	OBJECTS: 'objects',
	OPTIONAL_FEATURES: 'optionalfeatures',
	RACES: 'races',
	RULES: 'rules',
	SENSES: 'senses',
	SKILLS: 'skills',
	SPELLS: 'spells',
	TRAPS: 'traps'
} as const;

// Helper to get all content of a specific type
export async function getAllContent(type: string): Promise<any[]> {
	const api = getElectronAPI();
	if (!api) {
		console.warn('Electron API not available');
		return [];
	}
	
	try {
		const data = await api.content.getAll(type);
		
		// Backend returns object with compound keys (name|source)
		// Convert to array of items
		if (data && typeof data === 'object') {
			return Object.entries(data).map(([key, value]) => ({
				...value,
				_key: key // Keep the key for reference
			}));
		}
		
		return [];
	} catch (error) {
		console.error(`Failed to get ${type} content:`, error);
		return [];
	}
}

// Helper to search content
export async function searchContent(type: string, query: string): Promise<any[]> {
	const api = getElectronAPI();
	if (!api) {
		console.warn('Electron API not available');
		return [];
	}
	
	try {
		return await api.content.search(type, query);
	} catch (error) {
		console.error(`Failed to search ${type} content:`, error);
		return [];
	}
}

// Helper to get a specific content item
export async function getContent(type: string, name: string, source: string): Promise<any | null> {
	const api = getElectronAPI();
	if (!api) {
		console.warn('Electron API not available');
		return null;
	}
	
	try {
		return await api.content.get(type, name, source);
	} catch (error) {
		console.error(`Failed to get ${type} ${name}:`, error);
		return null;
	}
}
