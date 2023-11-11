import { defineConfig } from 'astro/config';

import solidJs from "@astrojs/solid-js";
import devtools from 'solid-devtools/vite';

// https://astro.build/config
export default defineConfig({
  base: '/hippostats',
  integrations: [solidJs()],
  vite: {
    plugins: [
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
    ],
  }
});