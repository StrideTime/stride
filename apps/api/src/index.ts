import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', c =>
  c.json({
    name: 'stride-api',
    status: 'stubbed',
  }),
);

const port = Number(process.env.PORT ?? 4000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  info => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
