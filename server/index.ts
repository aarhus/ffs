import { AutoRouter } from 'itty-router';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { avatarRoutes } from './routes/avatar';
import { goalRoutes } from './routes/goals';
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
  console.log(`Z Auth Route: ${request.method} ${request.url}`);
  console.log("User: ", request.user);
  return authRoutes.fetch(request, env, ctx)
});
router.all('/avatar/*', async (request, env, ctx) => {
  return avatarRoutes.fetch(request, env, ctx)
});
router.all('/users/*', userRoutes.handle);
router.all('/workouts/*', workoutRoutes.handle);
router.all('/goals/*', goalRoutes.handle);
router.all('/nutrition/*', nutritionRoutes.handle);
router.all('/notifications/*', notificationRoutes.handle);

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request: WorkerRequest, env: WorkerEnv, ctx: ExecutionContext) => {
    console.log(`X Incoming request: ${request.method} ${request.url}`);

    return router.fetch(request, env, ctx).catch(errorHandler);
  },
};
