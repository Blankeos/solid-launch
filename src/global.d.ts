declare global {
  declare module 'solid-js' {
    namespace JSX {
      /** Extend directives for `use-*` syntax. */
      interface Directives {
        form: (node: HTMLFormElement) => void;
      }
    }
  }
}

//   declare module "*.png";
