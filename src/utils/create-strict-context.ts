import { createContext, useContext } from "solid-js"

/**
 * A BETTER way to create contexts. Use this over `createContext`
 *
 * It does the 2/3 best practices:
 * - [x] 1. Context w/ type (never) null when written well.
 * - [x] 2. Hook - that guards if not used within its provider.
 * - [ ] 3. Provider - this is what you can finish editing.
 */
export function createStrictContext<T>(name: string) {
  const Context = createContext<T>(null as unknown as T)

  function useStrictContext() {
    const ctx = useContext(Context)
    if (!ctx) throw new Error(`${name} must be used within its provider`)
    return ctx
  }

  return [useStrictContext, Context.Provider] as const
}
