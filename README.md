## 💙 Solid Launch

![Image](https://assets.solidjs.com/banner?type=Starter%20Kit&background=tiles&project=Solid%20Launch)

[Carlo](https://carlo.vercel.app/)'s starter for making a Vike + Solid app with batteries included on stuff I like
after experimenting.

This is handcrafted from my own research. This might not work for you, but it works for me. :D

### Benefits

- [x] 🐭 **Handcrafted and minimal** - picked and chose "do one thing, do it well" libraries that are just enough to get the job done. Just looks a bit bloated at a glance. (I kinda made my own NextJS from scatch here)
- [x] ⚡️ **Super-fast dev server** - way faster than NextJS thanks to Vite. You need to feel it to believe it!

- [x] 💨 **Fast, efficient, fine-grained Reactivity** - thanks to Solid, it's possibly the most enjoyable framework I used that uses JSX. Has state management primitives out-of-the-box and keeps the experience a breeze.
- [x] 🐍 **Extremely flexible** - Not locked into paradigms set by big frameworks. Swap with your preferred JS backend framework/runtime if you want. Vike is just a middleware.
- [x] ☁️ **Selfhost-ready** - Crafted with simple hosting in mind that'll still scale to millions. Just spin up Docker container on a good'ol VPS without locking into serverless. DHH and Shayan influenced me on this. You can still host it on serverless tho. I think? lol

### Tech Stack

- **SolidJS** - Frontend framework that I like. Pretty underrated, but awesome!
- **Vike** - Like NextJS, but just a middleware. SSR library on-top of Vite. Use on any JS backend. Flexible, Simple, and Fast!
- **Hono** - 2nd fastest Bun framework(?), run anywhere, uses easy-to-understand web-standard paradigms.
- **tRPC** - E2E typesafety without context switching. Just amazing DevX.
- **Tailwind** - Styling the web has been pretty pleasant with it. I even use it on React Native for work. It's amazing.
- **Prisma** - Simple ORM (TBD)
- **Database**
  - **Kysely** - SQL-like queries without perf drawbacks. (TBD)
  - **SQLite (Turso)** - easy to dev database. (TBD)
  - **CockroachDB** - serverless database. (TBD)
  - **MongoDB** - cheap easy to use database. (TBD)
- **Lucia** - Makes self-rolling auth easy.
- **Emails** - SES or MimePost.

<!-- ## Usage

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

Learn more about deploying your application with the [documentations](https://vitejs.dev/guide/static-deploy.html) -->
