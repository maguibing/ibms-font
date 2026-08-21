import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import { setupVitePlugins } from './build/plugins';
import { createViteProxy, getBuildTime } from './build/config';

/** 生成带场景和环境的构建目录，如 dist/cp-dev。 */
function getBuildOutDir(mode: string, viteEnv: Env.ImportMeta) {
  const [modeScene, modeEnv] = mode.split('.');
  const scene = viteEnv.VITE_APP_SCENE || modeScene;

  return scene && modeEnv ? `dist/${scene}-${modeEnv}` : 'dist';
}

/** 将构建时间转成文件名可用格式，如 20260821-171603。 */
function formatBuildFileTime(buildTime: string) {
  return buildTime.replace(/-/g, '').replace(/:/g, '').replace(' ', '-');
}

/** 构建完成后压缩输出目录，压缩包名包含场景、环境和时间。 */
function setupBuildZipPlugin(outDir: string, buildTime: string): PluginOption {
  let resolvedOutDir = outDir;

  return {
    name: 'build-zip',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      resolvedOutDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const zipFile = `${resolvedOutDir}-${formatBuildFileTime(buildTime)}.zip`;

      rmSync(zipFile, { force: true });
      execFileSync('zip', ['-qr', zipFile, path.basename(resolvedOutDir)], {
        cwd: path.dirname(resolvedOutDir)
      });
      console.log(`Zip created: ${zipFile}`);
    }
  };
}

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta;

  const buildTime = getBuildTime();

  const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview;
  const buildOutDir = getBuildOutDir(configEnv.mode, viteEnv);

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: [setupVitePlugins(viteEnv, buildTime), setupBuildZipPlugin(buildOutDir, buildTime)],
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    server: {
      host: '0.0.0.0',
      port: 9527,
      open: true,
      proxy: createViteProxy(viteEnv, enableProxy)
    },
    preview: {
      port: 9725
    },
    build: {
      outDir: buildOutDir,
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      commonjsOptions: {
        ignoreTryCatch: false
      }
    }
  };
});
