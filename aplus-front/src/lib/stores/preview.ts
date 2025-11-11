import { writable } from 'svelte/store';

export const previewItem = writable<any>(null);
export const previewOpen = writable(false);
