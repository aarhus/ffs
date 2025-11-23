import { Router } from 'itty-router';

interface Request {
  env: { DB: any };
  params?: any;
}

export const goalRoutes = Router();

goalRoutes.get('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'GET /goals' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

goalRoutes.post('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'POST /goals' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});
