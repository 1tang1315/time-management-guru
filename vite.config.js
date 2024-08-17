import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.pdf'],
  plugins: [
    vue(),
    ["import", { "libraryName": "echarts", "libraryDirectory": "lib", "style": "css" }]
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  server: {
    proxy: {
      // 代理目标网址
      '/boardmix': {
        target: 'https://boardmix.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/boardmix/, ''), // 去掉路径前缀
        secure: false,
      },
    },
    middleware: [
      {
        name: 'fix-mjs-mime',
        handle: (req, res, next) => {
          if (req.url.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
          }
          next();
        }
      }
    ]
  }
})
