const {defineConfig} = require('vite')
const vue = require('@vitejs/plugin-vue')
const path = require('path')

// https://vitejs.dev/config/
module.exports = defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    baseUrl: '/',
    publicPath: '../../',
    assetsDir: 'static',
    parallel: false,
    plugins: [vue()],
    publicDir: 'public',
    server: {
        host: 'localhost',
        port: 8000,
        open: true,
        strictPort: false,
        https: false,
        proxy: {
            '/disk/api':{
                target: 'http://127.0.0.1:9001',
                changeOrigin: true,
                secure: false
            }
        }
    },
    optimizeDeps: {
    },
    build: {
        outDir: 'dist',
    }
})
