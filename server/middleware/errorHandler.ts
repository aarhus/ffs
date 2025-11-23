export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (error: ApiError) => {
  console.error('Error:', error);
  
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'An internal server error occurred';
  
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        status,
      },
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const createError = (status: number, message: string, code: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
};
