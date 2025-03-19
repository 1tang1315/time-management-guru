import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.pdf'],
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      // 代理目标网址
      '/constellationApi': {
        target: 'http://web.juhe.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/constellationApi/, ''), // 去掉路径前缀
        secure: false,
      },
      '/carletApi': {
        target: 'https://apis.juhe.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/carletApi/, ''), // 去掉路径前缀
        secure: false,
      },
      '/jianguoyunApi': {
        target: 'https://dav.jianguoyun.com/dav/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jianguoyunApi/, ''), // 去掉路径前缀
        secure: false,
      }
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
