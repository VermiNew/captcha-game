declare module 'vite-plugin-obfuscator' {
  import type { Plugin } from 'vite'
  import type { ObfuscatorOptions } from 'javascript-obfuscator'

  interface ObfuscatorPluginOptions {
    include?: string[]
    exclude?: string[]
    options?: Partial<ObfuscatorOptions>
  }

  function obfuscatorPlugin(options: ObfuscatorPluginOptions): Plugin

  export default obfuscatorPlugin
}
