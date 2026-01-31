import { useLocalStorage } from "bagon-hooks"
import {
  type Accessor,
  createEffect,
  createSignal,
  type FlowComponent,
  type Setter,
} from "solid-js"
import { createStrictContext } from "@/utils/create-strict-context"

/**
 * Blocking Theme Script (for `<head>`)
 *
 * This script must be inlined in `<head>` and should be blocking to prevent
 * flash of incorrect theme (FOUT). It runs synchronously before the page renders.
 */
export const themeInitScript = `
(function() {
  const themes = ["light", "dark"]
  const themeKey = "app-theme"
  let savedTheme = null
  try {
    savedTheme = JSON.parse(localStorage.getItem(themeKey) || 'null')
  } catch (e) {
    savedTheme = null
  }
  const theme = savedTheme && themes.includes(savedTheme) ? savedTheme :
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  themes.forEach(function(t) {
    if (t === theme) {
      document.documentElement.classList.add(t)
    } else {
      document.documentElement.classList.remove(t)
    }
  })
})()
`
// ===========================================================================
// Context & Hook
// ===========================================================================

export const themes = ["light", "dark", "system"] as const

export type Theme = (typeof themes)[number]

export type ThemeContextValue = {
  theme: Accessor<Theme>
  setTheme: Setter<Theme>
  inferredTheme: Accessor<Exclude<Theme, "system">>
  toggleTheme: () => void
}

const [useThemeContext, Provider] = createStrictContext<ThemeContextValue>("ThemeContext")

export { useThemeContext }

// ===========================================================================
// Provider
// ===========================================================================
export const ThemeContextProvider: FlowComponent = (props) => {
  const [theme, setTheme] = useLocalStorage<Theme>({
    key: "app-theme",
    defaultValue: "system",
  })

  /** For logic that relies on literally just `light` or `dark` themes (i.e. CodeMirror). Also infers system. */
  const [inferredTheme, setInferredTheme] =
    createSignal<ReturnType<ThemeContextValue["inferredTheme"]>>("light")

  createEffect(() => {
    let themeValue = theme()

    if (themeValue === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      themeValue = prefersDark ? "dark" : "light"
    }

    themes.forEach((themeName) => {
      if (themeValue === themeName) {
        document.documentElement.classList.add(themeName)
      } else {
        document.documentElement.classList.remove(themeName)
      }
    })

    setInferredTheme(themeValue)
  })

  function toggleTheme() {
    if (theme() === "light") {
      setTheme("dark")
    } else if (theme() === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Provider
      value={{
        theme,
        setTheme,
        inferredTheme,
        toggleTheme,
      }}
    >
      {props.children}
    </Provider>
  )
}
