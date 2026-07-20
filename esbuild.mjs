import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  drop: production ? ['console'] : [],
  minify: production,
  outfile: 'dist/extension.js',
  platform: 'node',
  sourcemap: true,
  target: 'node24',
};

const prefix = '[esbuild]';

async function run() {
  if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
    console.log(`${prefix} Watching for file changes.`);
  } else {
    const mode = production ? 'production' : 'development';
    console.log(`${prefix} Starting build in ${mode} mode.`);
    const startTime = Date.now();
    await esbuild.build(options);
    console.log(`${prefix} Build completed in ${Date.now() - startTime}ms.`);
  }
}

run().catch((error) => {
  console.error(`${prefix} Build failed:`, error);
  process.exit(1);
});
