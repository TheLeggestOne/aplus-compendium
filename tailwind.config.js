/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{svelte,ts,js}',
    './src/**/*.stories.{svelte,ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
        // ...add more as needed for your shadcn components
      }
    }
  },
  plugins: [],
};
