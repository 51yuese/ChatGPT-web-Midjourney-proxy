import path from 'path'
import type { PluginOption } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from "vite-plugin-compression";
import * as fs from "fs";
import {createSvgIconsPlugin } from 'vite-plugin-svg-icons'
function setupPlugins(env: ImportMetaEnv): PluginOption[] {
  return [
    vue(),
		createSvgIconsPlugin({
		  iconDirs: [path.resolve(__dirname, './src/assets/svg')],
		  symbolId: 'icon-[name]'
	  }),
    env.VITE_GLOB_APP_PWA === 'true' && VitePWA({
      injectRegister: 'auto',
      manifest: {
				name: 'GoMaxAI',
				short_name: 'GoMaxAI',
				icons: [
					{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
				],
      },
    }),
  ]
}

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    baseUrl: './',
    minify: true,
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
		plugins: [
			...setupPlugins(viteEnv),
			viteCompression({
				filter: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, // 需要压缩的文件
				threshold: 1024, // 文件容量大于这个值进行压缩
				algorithm: 'gzip', // 压缩方式
				ext: 'gz', // 后缀名
				deleteOriginFile: false, // 压缩后是否删除压缩源文件
			})
		],
    server: {
      host: '0.0.0.0',
      port: 9100,
	  // https: {
		// 	key: fs.readFileSync("keys/localhost+2-key.pem"),  // 读取我们上面生成的公钥
		// 	cert: fs.readFileSync("keys/localhost+2.pem"),	// 读取我们上面生成的证书
		// },
      open: true,
      proxy: {
        '/api': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace('/api/', '/api/'),
        },
      },
    },
    build: {
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
			// polyfillDynamicImport: true,
			outDir: 'dist/', // 指定输出路径（相对于 项目根目录).
			assetsDir: 'static', // 指定生成静态资源的存放路径（相对于 build.outDir）。
			assetsInlineLimit: '4096', // 小于此阈值的导入或引用资源将内联为 base64 编码
			cssCodeSplit: true, // 启用/禁用 CSS 代码拆分。当启用时，在异步 chunk 中导入的 CSS 将内联到异步 chunk 本身，并在其被加载时插入。
			manifest: false, // 当设置为 true，构建后将会生成 manifest.json 文件，映射没有被 hash 的资源文件名和它们的 hash 版本。可以为一些服务器框架渲染时提供正确的资源引入链接。
			minify: 'terser',
			brotliSize: false, // 启用/禁用 brotli 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能。
			emptyOutDir: true, // 若 outDir 在 root 目录下，则为 true
			chunkSizeWarningLimit: 500, // chunk 大小警告的限制（以 kbs 为单位）。
			terserOptions: {
				compress: {
					module: true,
					comparisons: true,
					// keep_infinity: true,
					// Used to delete console in production environment
					drop_console: false,
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

				}
			},

    },
  }
})
