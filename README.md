## 💙 Solid Launch

> A sophisticated and opinionated boiler-plate built for **simplicity** and **readiness**.

![Image](https://assets.solidjs.com/banner?type=Starter%20Kit&background=tiles&project=Solid%20Launch)

[Carlo](https://carlo.vercel.app/)'s starter for making a Vike + Solid app with batteries included on stuff I like after experimenting for years.

This is handcrafted from my own research and experience. My goal for this is almost like Rails where **opinions > flexibility**. This might not work for you, but it works for me. 🤓

You can also try my other starters:

- [🐇 Solid Hop](https://github.com/blankeos/solid-hop) - Less-opinionated Vike Solid boilerplate. Like `npx create solid` but simpler.
- [🧡 Svelte Launch](https://github.com/blankeos/svelte-launch) - Svelte, but same robust practices.

### Benefits

- [x] 🐭 **Handcrafted and minimal** - picked and chose "do one thing, do it well" libraries that are just enough to get the job done. Just looks a bit bloated at a glance. (I kinda made my own NextJS from scatch here). But it's a minimal Rails-like experience that won't need you to sign up for 5 different unnecessary third-party services just because you can't waste time building your own. I spent hours handcrafting it so you won't have to.
- [x] ⚡️ **Super-fast dev server** - way faster than NextJS thanks to Vite. You need to feel it to believe it! It can also literally build your app in seconds.
- [x] 🦋 **Type-safe Routing** - Inspired by TanStack Router, I'm the author of [`vike-routegen`](https://github.com/blankeos/vike-routegen) which codegens typesafe page routing for you, and it's a breeze!
- [x] 💨 **Fast, efficient, fine-grained Reactivity** - thanks to Solid, it's possibly the most enjoyable framework I used that uses JSX. Has state management primitives out-of-the-box and keeps the experience a breeze.
- [x] 🐍 **Extremely customizable** - you're not at the mercy of limited APIs and paradigms set by big frameworks or third-party services. Swap with your preferred JS backend framework/runtime if you want. Vike is just a middleware. Most of the tech I use here are open-source and roll-your-own type of thing. Hack it up! You're a dev aren't you?
- [x] ☁️ **Selfhost-ready** - Crafted with simple hosting in mind that'll still probably scale to millions. Just spin up Docker container on a good'ol VPS without locking into serverless. DHH and Shayan influenced me on this. You can still host it on serverless tho. I think? lol
- [x] **🔋 Batteries-included** - took care of the hard stuff for you. A well-thought-out folder structure from years of making projects: a design system, components, utilities, hooks, constants, an adequate backend DDD-inspired sliced architecture that isn't overkill, dockerizing your app, and most importantly---perfectly-crafted those pesky config files.
- [x] **🥊 Robust Error Practices** - I thoughtfully made sure there's a best practice for errors here already. You can throw errors in a consistent manner in the backend and display them consistently in the frontend.
- [x] **📝 Documented** - OpenAPI docs + Scalar. Aside from that, you'll find most my practices well documented here. It's an accumulation of my dev experience.
- [x] **🔑 Authentication-Ready** - One thing devs get stuck on. There's a practical auth implemented from scratch here that doesn't vendor-lock you into any auth provider.
  - [x] Email & Password
  - [x] Transactional Emails (Forgot Password, Email Verification)
  - [x] OAuth (Google, GitHub, extend as you wish) w/ linking
  - [x] Magic Link
  - [x] OTPs
  - [ ] 2FA (🟡 Backlog)
    - [ ] Authenticator App (🟡 Backlog)
    - [ ] Backup Code (🟡 Backlog)
  - [ ] Pass Key (🟡 Backlog)
  - [x] Organization Auth (easily opt-outable)
    - [x] Active Organization and Switching
    - [x] Roles (Owner, Admin, Member)
    - [x] Invitations
  - [ ] User Management Dashboard (I plan to do this as an external tool that only needs a DB URI to work)
  - [x] Rate Limits + Global Rate Limits
  - [x] Frontend Components and practices ready:
    - [x] Flexible and ssr-compatible `useAuthContext()` and `auth.context.tsx`,
    - [x] `<ProtectedRoute>` - w/ UX edge-cases covered (i.e. post-login-redirects)
    - [x] `<AccountManagement>` - like Clerk's <UserProfile />
    - [x] `<OrganizationManagement>` - everything for your org management
- [x] **Multi-Repo & Mono-Repo Ready** - Have a separate mobile app that needs TypeScript types? Just introspect with `bun run apigen` and `curl localhost:3000/api/docs/hono > api.d.ts`. Uses rollup-plugin-dts under the hood.

### Tech Stack

- [x] **Bun** - Runtime and package manager. You can always switch to Node and PNPM if you wish.
- [x] **SolidJS** - Frontend framework that I like. Pretty underrated, but devx is superior than any other framework I tried!
- [x] **Vike** - Like NextJS, but just a middleware. SSR library on-top of Vite. Use on any JS backend. Flexible, Simple, and Fast!
- [x] **Hono** - 2nd fastest Bun framework(?), run anywhere, uses easy-to-understand web-standard paradigms w/ typesafety and a bunch of QoLs built-in.
- [x] **OpenAPI** - A standard doc that other clients can use for your API (i.e. on Flutter, etc.) w/ hono-openapi.
- [x] **Tailwind** - Styling the web has been pretty pleasant with it. I even use it on React Native for work. It's amazing.
- [x] **Tanstack Form & Tanstack Query** - No need to rebuild validation, caching, retries, etc.
- [x] **Prisma** - Great _migrations_ workflow, but I want to maximize perf.
- [x] **Kysely** - Great typesafe _query builder_ for SQL, minimally wraps around db connection.
- [x] **SQLite/LibSQL (Turso)** - Cheapest database, easy to use.
- [x] **Lucia Book + Arctic** - Makes self-rolling auth easy, and not dependent on any third-party. (You may learn a thing or two with this low-level implementation as well). I chose not to use better-auth, everything is custom built, even organizations.
- [x] **Nodemailer (or any email API/SDK)** - Just customize `email-client.ts`. Send emails w/ any API: SMTP or SDK-specific (Amazon SES, Resend, Zeptomail, etc.). Amazon SES is the cheapest. I personally use Zeptomail. Tip: SDK-specific is preferred because SMTP is unreliable for some services because of the handshake requirement.
- [x] **Backblaze (or any S3)** - Cheap blob object storage with an S3-compatible API.
- [x] **Dodo Payments** - Accept payments and pay foreign taxes, cool new payment tech I found. With complete implementations for:
  - [x] Checkout Handler
  - [x] Webhook - handling at least success, fail, cancel
  - [x] Customer Portal - Allow customers to manage subscriptions and details. (I chose the easiest setup, a temporary link to a portal session, but Dodo Payments Billing SDK is there too if you want granular control + in-app experience)

### QuickStart

I'll assume you don't want to change anything with this setup after cloning so let's get to work!

1. Get template

```sh
npx degit https://github.com/blankeos/solid-launch <your-app-name>
cd <your-app-name>
```

2. Copy the environment variables

   ```sh
   cp .env.example .env
   ```

3. Replace the `<absolute_url>` in the local database with:

   ```sh
   pwd # If it outputs: /User/Projects/solid-launch

   # Replace the .env with:
   DATABASE_URL="file:/User/Projects/solid-launch/local.db"
   ```

4. Generate

   ```sh
   bun db:generate # generates Kysely and Prisma client types.
   bun db:migrate # migrates your database.
   ```

5. Install deps and run dev

   ```sh
   bun install
   bun dev
   ```

### Useful Development Tips

I took care of the painstaking parts to help you develop easily on a SPA + SSR + backend paradigm. You can take take these practices to different projects as well.

1.  I added code snippets. They seem useful.
2.  Backend Practices:
    - For GET endpoints that need to utilize c.redirect(), it's extremely recommended to catch all errors and just pass it as `?error=Message here` (i.e. for oAuth Callbacks, Magic Links, Email Verification, Payment Checkout Url Redirect)
3.  Authentication Practices - I have these out-of-the-box for you so you won't have to build it.
    - Getting Current User

      ```ts
      import { useAuthContext } from "@/context/auth.context";

      export default function MyComponent() {
        const { user } = useAuthContext();
      }
      ```

    - Login, Logout, Register

      ```tsx
      import { useAuthContext } from "@/context/auth.context";

      export default function MyComponent() {
        const { login, logout, register } = useAuthContext();
      }
      ```

    - Hydrating Current User

      This will also automatically hydrate in your layouts. Anywhere you use `useAuthStore()`, it's magic. (Thanks to Vike's `useData()`. Fun fact: You actually can't do this in SolidStart because it's architecturally different to Vike).

      ```tsx
      // +data.ts
      import { initHonoClient } from "@/lib/hono-client";
      import { PageContext } from "vike/types";

      export type Data = ReturnType<Awaited<typeof data>>;

      export async function data(pageContext: PageContext) {
        const { urlParsed, request, response } = pageContext;

        const hc = initHonoClient(urlParsed.origin!, {
          requestHeaders: request.header(),
          responseHeaders: response.headers,
        });

        const apiResponse = await hc.auth.$get();
        const result = await apiResponse.json();

        return {
          user: result?.user ?? null,
        };
      }
      ```

    - Protecting Routes (Client-Side)

      ```tsx
      import ProtectedRoute from '@/components/common/protected-route';

      export default MyComponent() {
         return (
            <ProtectedRoute>
              On the server (hydration), this part will not be rendered if unauthenticated.

              On the client, you will be redirected to a public route if unauthenticated.
            </ProtectedRoute>
         )
      }
      ```

    - Protecting Routes (SSR)

      ```ts
      // +guard.ts (If you don't have +data.ts in the same route).
      export async function guard(pageContext: PageContext) {
        const { urlParsed, request, response } = pageContext;

        const hc = initHonoClient(urlParsed.origin!, {
          requestHeaders: request.header(),
          responseHeaders: response.headers,
        });

        const apiResponse = await hc.auth.$get();
        const result = await apiResponse.json();

        if (!result?.user) {
          throw redirect("/"); // Must be a public route.
        }
      }

      // +guard.ts (If you already have a +data.ts that gets the user).
      // ⚠️ I have not tested this. This depends on `+guard` being called after `+data` is resolved.
      export async function guard(pageContext: PageContext) {
        if (!pageContext.data?.user) {
          throw redirect("/"); // Must be a public route.
        }
      }
      ```

4.  Dataloading Practices - Also have these out-of-the-box for most usecases since they're tricky to do if you're clueless:
    - Tanstack Query (Client-only) - Use `honoClient` from `@/lib/hono-client.ts`
    - Hydrated Tanstack Query (SSR) - Use `create-dehydrated-state.ts` + `initHonoClient`

### Backend Architecture

My backend architecture is inspired by DDD where I separate in layers, but I keep it pragmatic by not going too overkill with Entities, Domains, and Aggregates. I personally still like the anemic data-driven architecture for most of my apps since the
apps I make aren't too business-logic-heavy.

```sh
.
└── server/ # - root
    ├── dao/ # - data-access-objects
    │   └── *.dao.ts
    ├── modules/
    │   └── <module>/
    │       ├── <module>.dao.ts # Plain JS classes with functions for purely reading/writing to database. Like db utils.
    │       ├── <module>.dto.ts # Zod objects or pure typescript types.
    │       ├── <module>.service.ts # Plain JS classes with business logic. (Throw api errors, use DAOs, call other services).
    │       └── <module>.controller.ts # In charge of validators, REST (GET, POST, etc.), and setting to headers.
    └── _app.ts # - root TRPC router.
```

- **`dao`** - abstracted away all queries here to interface with them as plain functions. It actually helps me mentally collocate db queries from service logic when I'm using them inside the service.
- **`modules`** - a vertical slice of each module-group. This just depends on how I feel about grouping them. You get better overtime.
- **`<module>.controller.ts`** - pretty much a group of http endpoints. I can put the DTOs/Validations for each endpoint here without context-switching.
- **`services`** - these are even smaller pieces of logic that can be used inside each endpoint. It's not necessary to use if the app isn't too big, but it helps.
- **`_app.ts`** - The root trpc router where the `AppRouter` type is exported.

### Deployment

> [!WARNING]
>
> Still in progress

Here are some guides on how to deploy.

- [ ] Dokku (self-host VPS - I recommend this)
- [ ] Kamal (self-host VPS)
- [ ] Railway
- [ ] Caprover (self-host VPS)
- [ ] Cloudflare (serverless + static)
- [ ] Vercel (serverless + static)
- [ ] Netlify (static)

### Limitations

- Websockets and Bun
  - It works fine in Prod. But activating Vite HMR + Websockets is not possible in Bun.
  - This is because Bun doesn't work with `Connect.Server` middlewares (which Vite uses). [[Source 1]](https://github.com/oven-sh/bun/issues/12212) [[Source 2]](https://github.com/honojs/vite-plugins/issues/140#issuecomment-2200134094)
  - Bun Workaround: Having a separate process to run the Websocket server and your HTTP Server. Just make sure to use the same pubsub across these two processes (You can do this using Redis). Also make sure to combine them in a single process in production.
  - Alternative recommendation: Use Node instead as it's possible to use `Connect.Server` middlewares in their `http` server: [PoC](https://github.com/Blankeos/realtime-user-status-node).

### Supplements: My suggestions for third-party services

- Cron jobs, scheduled tasks, heavy background processing, eventual consistency - [QStash](https://upstash.com/docs/qstash/overall/getstarted) or [Trigger.dev](https://trigger.dev)
- Multiplayer and Realtime - [Rivet.dev](https://www.rivet.dev) or [Convex.dev](https://www.convex.dev)
- Image optimization pipeline - [Sharp](https://sharp.pixelplumbing.com) for resizing, WebP/AVIF conversion, and caching. Pair with a CDN for global delivery.
- Search that scales - [MeiliSearch](https://www.meilisearch.com) (self-host) or [Algolia](https://www.algolia.com) (managed). Both have instant search UIs you can drop in.
- Customer Feedback - [Userjot](https://userjot.com)
- Customer Support - [Chatwoot](https://www.chatwoot.com)
- Analytics - [PostHog](https://posthog.com) or [umami.sh](http://umami.sh)
- Feature flags & A/B tests - [Unleash](https://www.getunleash.io) (self-host) or [PostHog](https://posthog.com) (product analytics + flags). Roll out safely without redeploys.
- Error & uptime monitoring - [Sentry](https://sentry.io) for exceptions, [Uptime Kuma](https://uptime.kuma.pet) for pings. Both can be self-hosted. [Glitchtip](https://glitchtip.com)
- Affiliate Tracker - [Refref](https://github.com/refrefhq/refref)

### Future Plans

> I'll probably make a swapping guide soon. To replace to these:
>
> - Runtime: Bun -> Node
> - Package Manager: Bun -> PNPM
> - ORM: Prisma -> Drizzle
> - Database: SQLite -> PostgreSQL, CockroachDB, MongoDB

### FAQs

- Why not better-auth?
  - I thought long and hard about this, and I'm foreseeing a lot of pushback on this so I'll document it here.
  - I completely understand the extreme strawman argument of "I want to build an app, so here's the entire OAuth spec to implement it". In almost 99% of usecases, you will choose better-auth to save time, it will be better tested, and will give you more flexibility for easier auth flows for 99% of apps. This Lucia implementation is for that extra flexibility for harder auth flows in 1% of apps--which your next SaaS and mine most likely won't be, so why??
  - I initially wrote the template when better-auth wasn't the standard solution, while Lucia was the up and coming one. Lucia actually made me learn about auth more than any resource in my career, so I started to prefer it. Better auth will save you time, but I already spent that time, and this is the flywheel I wrote to save just as much time as using better auth.
  - I genuinely believe simple auth isn't so complicated that you'd need a library to abstract it. And for complex auth, you will almost always need a custom solution eventually.
  - But for flexibility i.e. changing my server framework, database, etc... This approach won't save me time. Better auth wins there.
  - But it will save me time if I want to support an extremely custom auth flow that better auth doesn't support yet. (I have no examples)
  - I also save time if I want to implement auth in other languages other than javascript i.e. Rust because the structure and architecture can be done in other languages too.
