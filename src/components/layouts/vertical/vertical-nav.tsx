import { PageRoutes } from '@/constants/page-routes';
import { For, VoidProps } from 'solid-js';

type VerticalNavProps = {};

const navLinks = [
  {
    name: 'Home',
    href: PageRoutes.Home
  },
  {
    name: 'About',
    href: PageRoutes.About
  },
  {
    name: 'Sign Up',
    href: PageRoutes.SignUp
  },
  {
    name: 'Sign In',
    href: PageRoutes.SignIn
  }
];

export default function VerticalNav(props: VoidProps<VerticalNavProps>) {
  return (
    <nav class="flex h-20 items-center justify-between gap-x-5 px-8">
      <a class="flex items-center gap-x-2" href={PageRoutes.Home}>
        <img class="h-16 w-16" src="/icon-logo.svg" />
        <span>Solid Launch</span>
      </a>

      <ul class="flex items-center gap-x-5">
        <For each={navLinks}>
          {({ name, href }) => (
            <li>
              <a href={href}>{name}</a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
