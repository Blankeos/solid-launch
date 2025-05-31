import { privateConfig } from '@/config.private';
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { appRouter } from './_app';
import { createContext } from './context';

import { apply } from 'vike-server/hono';
import { serve } from 'vike-server/hono/serve';

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
    },
    onError({ error }) {
      throw error;
    },
  })
);

// Vike
apply(app, {
  pageContext: (c) => {
    const pageContextInit = {
      urlOriginal: c.hono.req.url,
      request: c.hono.req,
      response: c.hono.res,
    };

    return pageContextInit;
  },
});

// Returning errors.
app.onError((error, c) => {
  // Sentry.captureException(error); // Add sentry here or any monitoring service.

  console.error({
    cause: error.cause,
    message: error.message,
    stack: error.stack,
  });

  return c.json(
    {
      error: {
        cause: error.cause,
        message: c.error?.message ?? 'Something went wrong.',
        stack: privateConfig.NODE_ENV === 'production' ? undefined : error.stack,
      },
    },
    error.cause ?? 500
  );
});

// No need to export default (especially Bun).
serve(app, { port: privateConfig.PORT });
