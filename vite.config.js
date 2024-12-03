import { VitePWA } from 'vite-plugin-pwa'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
    // input https://www.npmjs.com/package/html-minifier-terser options
    ViteMinifyPlugin({
      extensions: ['html'],
      collapseWhitespace: true,
      removeComments: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    }),
    VitePWA({ registerType: 'autoUpdate',
      build: true,
      includeAssets: [],
      manifest: {
        "name": "Pierre Guilbert",
        "short_name": "pierre guilbert",
        "description": "Personal home page",
        "dir": "auto",
        "lang": "en-US",
        "display": "standalone",
        "orientation": "any",
        "start_url": "/",
        "id": "/?v=1.0.0",
        "background_color": "#ffffff",
        "theme_color": "#ffffff",
        "icons": [
          {
            "src": "./favicons/android-chrome-36x36.png",
            "sizes": "36x36",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-48x48.png",
            "sizes": "48x48",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-144x144.webp",
            "sizes": "144x144",
            "type": "image/webp",
            "purpose": "any"
          },
          
          {
            "src": "./favicons/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-256x256.png",
            "sizes": "256x256",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "./favicons/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          }
        ]
      }
     })
  ],
  build: {
    minify: 'esbuild', // Use 'esbuild' for JS and CSS minification
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})