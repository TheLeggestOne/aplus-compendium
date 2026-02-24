export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.-V4HZMEb.js",app:"_app/immutable/entry/app.D-3uJfsu.js",imports:["_app/immutable/entry/start.-V4HZMEb.js","_app/immutable/chunks/BhNu_S1Y.js","_app/immutable/chunks/DoDi1JM4.js","_app/immutable/chunks/ChQ8qkpi.js","_app/immutable/entry/app.D-3uJfsu.js","_app/immutable/chunks/DoDi1JM4.js","_app/immutable/chunks/CnjXU54l.js","_app/immutable/chunks/B0okFeBn.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/BPXWMPg3.js","_app/immutable/chunks/luoB7HVR.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/character/[id]",
				pattern: /^\/character\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
