

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Bv7NE4kf.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/DoDi1JM4.js","_app/immutable/chunks/B0okFeBn.js","_app/immutable/chunks/BxsfWWMi.js","_app/immutable/chunks/luoB7HVR.js"];
export const stylesheets = ["_app/immutable/assets/0.B45G38qa.css"];
export const fonts = [];
