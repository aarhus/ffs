export const corsHandler = (request: Request) => {
  const origin = request.headers.get('origin') || '*';
  
  // Allow localhost for development
  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL || '',
  ];
  
  const isOriginAllowed = allowedOrigins.includes(origin);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isOriginAllowed ? origin : 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
};
