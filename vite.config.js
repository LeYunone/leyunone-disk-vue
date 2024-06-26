import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
    //生产模式打包配置
    build: {
        outDir: 'dist',//Specify the output directory (relative to project root).
    }
})
