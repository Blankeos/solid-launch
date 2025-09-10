import { useLocalStorage } from 'bagon-hooks';
import {
  createContext,
  createEffect,
  createSignal,
  FlowComponent,
  Setter,
  useContext,
  type Accessor,
} from 'solid-js';

// ===========================================================================
// Context
// ===========================================================================

export const themes = ['light', 'dark', 'system'] as const;

export type Theme = (typeof themes)[number];

export type ThemeContextValue = {
  theme: Accessor<Theme>;
  setTheme: Setter<Theme>;
  inferredTheme: Accessor<Exclude<Theme, 'system'>>;
  toggleTheme: () => void;
};

const ThemeContext = createContext({
  theme: () => 'light',
  setTheme: () => {},
  inferredTheme: () => 'light',
  toggleTheme: () => {},
} as ThemeContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useThemeContext = () => useContext(ThemeContext);

// ===========================================================================
// Provider
// ===========================================================================
export const ThemeContextProvider: FlowComponent = (props) => {
  const [theme, setTheme] = useLocalStorage<Theme>({
    key: 'app-theme',
    defaultValue: 'system',
  });

  /** For logic that relies on literally just `light` or `dark` themes (i.e. CodeMirror). Also infers system. */
  const [inferredTheme, setInferredTheme] =
    createSignal<ReturnType<ThemeContextValue['inferredTheme']>>('light');

  createEffect(() => {
    let themeValue = theme();

    if (themeValue === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeValue = prefersDark ? 'dark' : 'light';
    }

    themes.forEach((themeName) => {
      if (themeValue === themeName) {
        document.documentElement.classList.add(themeName);
      } else {
        document.documentElement.classList.remove(themeName);
      }
    });

    setInferredTheme(themeValue);
  });

  function toggleTheme() {
    if (theme() === 'light') {
      setTheme('dark');
    } else if (theme() === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        inferredTheme,
        toggleTheme,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};
