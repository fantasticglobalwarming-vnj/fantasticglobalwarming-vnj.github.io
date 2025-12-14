import { defineConfig } from "vite";

import { globSync } from "glob";
import { resolve } from "node:path";

export default defineConfig({
    base: "./",
    build: {
        rolldownOptions: {
            input: Object.fromEntries(
                globSync('www/**/*.{html,htm,css,js}').map(file => [
                  // The name of the entry point (e.g., 'main', 'utils/helper')
                  // This removes the 'src/' part of the path and the file extension
                  file.slice(4, file.length - 3),
                  // The absolute path to the file
                  resolve(process.cwd(), file)
                ])
            ),
            output: {
              entryFileNames: '[name].[hash].js', // default
              chunkFileNames: '[name].[hash].js', // default
              assetFileNames: '[name].[hash].[ext]'
            }
        }
    }
});
