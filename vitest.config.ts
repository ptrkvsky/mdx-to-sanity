import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		// Masque les logs de console dans les tests pour une sortie plus propre
		silent: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/__tests__/**",
			],
		},
	},
});

