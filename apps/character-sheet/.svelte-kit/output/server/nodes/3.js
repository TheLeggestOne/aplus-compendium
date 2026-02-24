

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/character/_id_/_page.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false,
  "load": null
};
export const universal_id = "src/routes/character/[id]/+page.ts";
export const imports = ["_app/immutable/nodes/3.s_rdzQ2g.js","_app/immutable/chunks/ChQ8qkpi.js","_app/immutable/chunks/DoDi1JM4.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CnjXU54l.js","_app/immutable/chunks/B0okFeBn.js","_app/immutable/chunks/BPXWMPg3.js","_app/immutable/chunks/luoB7HVR.js","_app/immutable/chunks/BxsfWWMi.js","_app/immutable/chunks/BlghU-q-.js"];
export const stylesheets = ["_app/immutable/assets/3.bHHIbcsu.css"];
export const fonts = [];
