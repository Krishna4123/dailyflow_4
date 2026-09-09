/// <reference types="vite/client" />

/**
 * CSS Modules type declaration.
 * Tells TypeScript that any *.module.css import is a
 * Record<string, string> — the object Vite's CSS Modules transform produces.
 */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
