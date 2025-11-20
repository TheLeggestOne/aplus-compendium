import { writable } from 'svelte/store';

export const previewItem = writable<any>(null);
export const previewContentType = writable<string>('');
export const previewOpen = writable(false);

// Helper to set preview with content type
export function setPreview(item: any, contentType: string) {
	previewItem.set(item);
	previewContentType.set(contentType);
	previewOpen.set(true);
}

export function clearPreview() {
	previewItem.set(null);
	previewContentType.set('');
	previewOpen.set(false);
}
