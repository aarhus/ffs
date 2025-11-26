import { AutoRouter, IRequest } from 'itty-router';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { avatarRoutes } from './routes/avatar';
import { goalRoutes } from './routes/goals';
import { habitRoutes } from './routes/habits';
import { injuryRoutes } from './routes/injuries';
import { measurementRoutes } from './routes/measurements';
import { notificationRoutes } from './routes/notifications';
import { nutritionRoutes } from './routes/nutrition';
import { userRoutes } from './routes/users';
import { workoutRoutes } from './routes/workouts';



const router = AutoRouter({ base: "/api" })

// Middleware
router.all('*', async (request, env) => {
  console.log(`Y Request: ${request.method} ${request.url}`);
});

// Health check
router.get('/health', () => new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));




router.all("*", authMiddleware);


// Routes
router.all('/auth/*', async (request, env, ctx) => {
  return authRoutes.fetch(request, env, ctx);
});
router.all('/avatar/*', async (request, env, ctx) => {
  return avatarRoutes.fetch(request, env, ctx);
});
router.all('/users/*', async (request, env, ctx) => {
  return userRoutes.fetch(request, env, ctx);
});
router.all('/workouts/*', async (request, env, ctx) => {
  return workoutRoutes.fetch(request, env, ctx);
});
router.all('/goals/*', async (request, env, ctx) => {
  return goalRoutes.fetch(request, env, ctx);
});
router.all('/nutrition/*', async (request, env, ctx) => {
  return nutritionRoutes.fetch(request, env, ctx);
});
router.all('/measurements/*', async (request, env, ctx) => {
  return measurementRoutes.fetch(request, env, ctx);
});
router.all('/habits/*', async (request, env, ctx) => {
  return habitRoutes.fetch(request, env, ctx);
});
router.all('/injuries/*', async (request, env, ctx) => {
  return injuryRoutes.fetch(request, env, ctx);
});
router.all('/notifications/*', async (request, env, ctx) => {
  return notificationRoutes.fetch(request, env, ctx);
});

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request: IRequest, env: Env, ctx: ExecutionContext) => {
    console.log(`X Incoming request: ${request.method} ${request.url}`);

    return router.fetch(request, env, ctx).catch(errorHandler);
  },
};
