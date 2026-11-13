import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from "node:path";
/** Builds ONLY the static demo entry, not the real financial app. */
export default defineConfig({
 plugins:[react()],base:"/dinaro/",
 build:{outDir:"dist-mobile",emptyOutDir:true,rollupOptions:{input:resolve(process.cwd(),"mobile-preview.html")}}
});
