/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/.*'],
  appDirectory: 'app',
  serverModuleFormat: 'esm',
  tailwind: true,
  postcss: true,
  watchPaths: ['./tailwind.config.ts']
}
