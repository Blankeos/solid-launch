/** An easy constant we can use for hrefs so it's super easy to change later on. */
export enum PageRoutes {
  Home = '/',
  About = '/about',
  NotFound = '/404',
  SignUp = '/sign-up',
  SignIn = '/sign-in',
  Dashboard = '/dashboard',
  Settings = `${PageRoutes.Dashboard}/settings`,
}
