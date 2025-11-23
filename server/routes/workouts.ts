import { Router } from 'itty-router';

interface Request {
  env: { DB: any };
  params?: any;
}

export const workoutRoutes = Router();

workoutRoutes.get('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'GET /workouts' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

workoutRoutes.post('/', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'POST /workouts' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});
