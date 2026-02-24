declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Window {
    electronAPI?: {
      platform: string;
    };
  }
}

export {};
