import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import Replace from 'unplugin-replace/vite';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import { cloudflare } from "@cloudflare/vite-plugin";
var pwaOptions = {
    mode: process.env.NODE_ENV == "production" ? 'production' : 'development',
    base: '/',
    includeAssets: ['favicon.svg'],
    manifest: {
        name: 'Sense Services',
        short_name: 'Sense Services',
        theme_color: '#ffffff',
        icons: [
            {
                src: 'pwa-192x192.png', // <== don't add slash, for testing
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/pwa-512x512.png', // <== don't remove slash, for testing
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: 'pwa-512x512.png', // <== don't add slash, for testing
                sizes: '512x512',
                type: 'image/png',
                purpose: ['any', 'maskable'], // testing new type declaration
            },
        ],
    },
    // showMaximumFileSizeToCacheInBytesWarning: true,
    workbox: {
        navigateFallbackDenylist: [/^\/api\//],
    },
    devOptions: process.env.NODE_ENV == "production" ? undefined : {
        enabled: true,
        /* when using generateSW the PWA plugin will switch to classic */
        type: 'module',
        navigateFallback: 'index.html',
        filename: "sw.js",
        suppressWarnings: true,
    },
    srcDir: 'src',
    registerType: "autoUpdate",
    injectRegister: null,
    strategies: 'injectManifest',
    filename: "sw.js",
    injectManifest: {
        minify: false,
        enableWorkboxModulesLogs: true,
        buildPlugins: {
            vite: [virtualMessagePlugin()],
        },
        // maximumFileSizeToCacheInBytes: 1000,
    },
    /*  pwaAssets: {
        preset: 'minimal-2023',
        overrideManifestIcons: true,
      } */
};
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [
            vue(),
            tailwindcss(),
            vueDevTools(),
            cloudflare(),
            Replace({
                values: [
                    { find: "__DATE__", replacement: new Date().toISOString() },
                    { find: "__RELOAD_SW__", replacement: process.env.RELOAD_SW === 'true' ? 'true' : 'false', }
                ]
            }),
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '~': fileURLToPath(new URL('./server', import.meta.url))
            }
        }
    };
});
//import process from 'node:process'
var selfDestroying = process.env.SW_DESTROY === 'true';
function virtualMessagePlugin() {
    var virtual = 'virtual:message';
    var resolvedVirtual = "\0".concat(virtual);
    return {
        name: 'vite-plugin-test',
        resolveId: function (id) {
            return id === virtual ? resolvedVirtual : null;
        },
        load: function (id) {
            if (id === resolvedVirtual)
                return "export const message = 'Message from Virtual Module Plugin'";
        },
    };
}
var jsToBottomNoModule = function () {
    return {
        name: "no-attribute",
        transformIndexHtml: function (html) {
            html = html.replace("type=\"module\" crossorigin", "");
            var scriptTag = html.match(/<script[^>]*>(.*?)<\/script[^>]*>/)[0];
            console.log("\n SCRIPT TAG", scriptTag, "\n");
            html = html.replace(scriptTag, "");
            html = html.replace("<!-- # INSERT SCRIPT HERE -->", scriptTag);
            return html;
        }
    };
};
