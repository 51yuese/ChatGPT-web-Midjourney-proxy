import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import dayjs from 'dayjs'
import pkg from './package.json'
import createVitePlugins from './vite/plugins'
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  // 全局 scss 资源
  const scssResources = []
  fs.readdirSync('src/assets/styles/resources').forEach((dirname) => {
    if (fs.statSync(`src/assets/styles/resources/${dirname}`).isFile()) { scssResources.push(`@use "src/assets/styles/resources/${dirname}" as *;`) }
  })
  // css 精灵图相关
  fs.readdirSync('src/assets/sprites').forEach((dirname) => {
    if (fs.statSync(`src/assets/sprites/${dirname}`).isDirectory()) {
      // css 精灵图生成的 scss 文件也需要放入全局 scss 资源
      scssResources.push(`@use "src/assets/sprites/_${dirname}.scss" as *;`)
    }
  })
  return defineConfig({
    base: env.VITE_BASE_PATH,
    // 开发服务器选项 https://cn.vitejs.dev/config/#server-options
    server: {
      open: true,
      port: 9000,
      proxy: {
        '/proxy': {
          target: env.VITE_APP_API_BASEURL,
          changeOrigin: command === 'serve' && env.VITE_OPEN_PROXY === 'true',
          rewrite: path => path.replace(/\/proxy/, ''),
        },
      },
    },
    // 构建选项 https://cn.vitejs.dev/config/#server-fsserve-root
    build: {
      outDir: mode === 'production' ? 'dist' : `dist-${mode}`,
      reportCompressedSize: true,
      assetsDir: 'static', // 指定生成静态资源的存放路径（相对于 build.outDir）。
      assetsInlineLimit: 4096, // 小于此阈值的导入或引用资源将内联为 base64 编码
      cssCodeSplit: true, // 启用/禁用 CSS 代码拆分。当启用时，在异步 chunk 中导入的 CSS 将内联到异步 chunk 本身，并在其被加载时插入。
      sourcemap: false, // 构建后是否生成 source map 文件。
      manifest: false, // 当设置为 true，构建后将会生成 manifest.json 文件，映射没有被 hash 的资源文件名和它们的 hash 版本。可以为一些服务器框架渲染时提供正确的资源引入链接。
      minify: 'terser',
      // brotliSize: false, // 启用/禁用 brotli 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。
      emptyOutDir: true, // 若 outDir 在 root 目录下，则为 true
      chunkSizeWarningLimit: 500, // chunk 大小警告的限制（以 kbs 为单位）。
      terserOptions: {
        compress: {
          module: true,
          comparisons: true,
          // keep_infinity: true,
          // Used to delete console in production environment
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        treeshake: true, // 开启 Tree Shaking，消除未使用的代码，减小最终的包大小
        output: {
          chunkFileNames: (chunkInfo: any) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []
            const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'
            return `static/js/${fileName}/[name].[hash].js`
          },
          entryFileNames: 'static/js/main-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.toString().split('node_modules/.pnpm/')[1]) {
								return id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString();
							}
            }
          },
          // commonjsOptions: {
          //   requireReturnsDefault: 'namespace', // 要求ES模块返回其名称空
          // }
        }
      },

    },
    define: {
      __SYSTEM_INFO__: JSON.stringify({
        pkg: {
          version: pkg.version,
          dependencies: pkg.dependencies,
          devDependencies: pkg.devDependencies,
        },
        lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }),
    },
    plugins: [
      ...createVitePlugins(env, command === 'build'),
      // viteCompression({
      //   filter: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 需要压缩的文件
      //   threshold: 1024, // 文件容量大于这个值进行压缩
      //   algorithm: 'gzip', // 压缩方式
      //   ext: 'gz', // 后缀名
      //   deleteOriginFile: false, // 压缩后是否删除压缩源文件
      // })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '#': path.resolve(__dirname, 'src/types'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: scssResources.join(''),
        },
      },
    },
  })
}
