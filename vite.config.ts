import { defineConfig } from "vite";


export default defineConfig({
    root: "client",
    assetsInclude: ["**/*.yaml"],
    publicDir: "../static",
    build: {
        target: "esnext",
        outDir: "../dist/client",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
                sourcemapFileNames: "[name].js.map",
            },
        }
    }
});
