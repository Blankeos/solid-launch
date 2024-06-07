//
// How to serve Vike (SSR middleware) via a Hono server.
// https://github.com/phonzammi/vike-hono-example/blob/main/server/index.ts
import { privateConfig } from '@/config.private';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { renderPage } from 'vike/server';
import { appRouter } from './_app';
import { createContext } from './context';

const app = new Hono();

// Health checks
app.get('/up', async (c) => {
  return c.newResponse('🟢 UP', { status: 200 });
});

// For the Backend APIs
app.use(
  '/api/*',
  trpcServer({
    router: appRouter,
    createContext(opts, c) {
      return createContext(c);
    }
  })
);

if (privateConfig.NODE_ENV === 'production') {
  app.use(
    '/*',
    serveStatic({
      root: `./dist/client/`
    })
  );
}

// For the Frontend + SSR
app.get('*', async (c, next) => {
  const pageContextInit = {
    urlOriginal: c.req.url,
    request: c.req,
    response: c.res
  };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return next();
  } else {
    const { body, statusCode, headers } = httpResponse;
    headers.forEach(([name, value]) => c.header(name, value));
    c.status(statusCode);

    return c.body(body);
  }
});

// Returning errors.
app.onError((_, c) => {
  return c.json(
    {
      error: {
        message: c.error?.message ?? 'Something went wrong.'
      }
    },
    500
  );
});

console.log('Running at http://localhost:' + privateConfig.PORT);

export default {
  port: privateConfig.PORT,
  fetch: app.fetch
};
