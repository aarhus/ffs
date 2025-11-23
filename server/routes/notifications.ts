import { Router } from 'itty-router';

interface Request {
  env: { DB: any };
  params?: any;
}

export const notificationRoutes = Router();

notificationRoutes.post('/tokens', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'POST /notifications/tokens' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});

notificationRoutes.get('/tokens', async (request: Request) => {
  return new Response(JSON.stringify({ message: 'GET /notifications/tokens' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
