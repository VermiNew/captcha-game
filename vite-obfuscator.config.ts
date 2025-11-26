import type { Plugin, BuildOptions } from 'vite'
import obfuscatorPlugin from 'vite-plugin-obfuscator'
import type { ObfuscatorOptions } from 'javascript-obfuscator'

/**
 * Obfuscation protection levels
 */
export type ObfuscationLevel = 'light' | 'balanced' | 'strong' | 'custom'

/**
 * Obfuscator configuration
 */
export interface ObfuscatorConfig {
  /** Obfuscation level */
  level?: ObfuscationLevel
  /** Custom obfuscator options (override preset) */
  customOptions?: Partial<ObfuscatorOptions>
  /** Files to obfuscate */
  include?: string[]
  /** Files to exclude */
  exclude?: string[]
  /** Enable only in production */
  productionOnly?: boolean
  /** Additional reserved names */
  additionalReservedNames?: string[]
}

/**
 * Obfuscator configuration presets
 */
const presets: Record<Exclude<ObfuscationLevel, 'custom'>, Partial<ObfuscatorOptions>> = {
  // Light protection - fast compilation, minimal size increase
  light: {
    compact: true,
    simplify: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    stringArray: true,
    stringArrayThreshold: 0.5,
    rotateStringArray: true,
    shuffleStringArray: true,
    stringArrayEncoding: [],
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  },

  // Balanced protection - good compromise
  balanced: {
    compact: true,
    simplify: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    debugProtection: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    stringArray: true,
    stringArrayThreshold: 0.75,
    rotateStringArray: true,
    shuffleStringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  },

  // Strong protection - best security, slower compilation
  strong: {
    compact: true,
    simplify: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    identifierNamesGenerator: 'hexadecimal',
    identifiersPrefix: '',
    renameGlobals: false,
    selfDefending: true,
    stringArray: true,
    stringArrayThreshold: 0.9,
    rotateStringArray: true,
    shuffleStringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayWrappersCount: 3,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  },
}

/**
 * Default reserved names for React and popular libraries
 */
const defaultReservedNames = [
  '^React',
  '^use[A-Z]', // React hooks
  '^_',
  'require',
  'exports',
  'module',
  '__webpack',
  '__vite',
]

/**
 * Creates obfuscator plugin for Vite
 * 
 * @example
 * ```ts
 * // vite.config.ts
 * import { createObfuscatorPlugin } from './vite-obfuscator.config'
 * 
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     createObfuscatorPlugin({ level: 'balanced' })
 *   ]
 * })
 * ```
 */
export function createObfuscatorPlugin(config: ObfuscatorConfig = {}): Plugin | Plugin[] {
  const {
    level = 'balanced',
    customOptions = {},
    include = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
    exclude = ['node_modules/**', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    productionOnly = true,
    additionalReservedNames = [],
  } = config

  // If production only and not in production, return empty array
  if (productionOnly && process.env.NODE_ENV !== 'production') {
    return []
  }

  // Get preset or use empty object for 'custom'
  const presetOptions = level === 'custom' ? {} : presets[level]

  // Combine reserved names
  const reservedNames = [
    ...defaultReservedNames,
    ...additionalReservedNames,
  ]

  // Combine all options (preset + custom)
  const finalOptions: Partial<ObfuscatorOptions> = {
    ...presetOptions,
    ...customOptions,
    reservedNames,
    target: 'browser',
  }

  return obfuscatorPlugin({
    include,
    exclude,
    options: finalOptions,
  })
}

/**
 * Helper to add Terser optimization
 */
export function getTerserOptions(dropConsole = true) {
  return {
    compress: {
      drop_console: dropConsole,
      drop_debugger: true,
      passes: 2,
    },
    mangle: {
      safari10: true,
    },
  }
}

/**
 * Example complete build configuration
 */
export function getOptimizedBuildConfig(dropConsole = true): BuildOptions {
  return {
    minify: 'terser',
    terserOptions: getTerserOptions(dropConsole) as any,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  }
}