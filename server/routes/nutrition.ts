import { Router } from 'itty-router';

interface Request {
  env: { DB: any };
  params?: any;
}

export const nutritionRoutes = Router();

nutritionRoutes.get('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'GET /nutrition' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

nutritionRoutes.post('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'POST /nutrition' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});
