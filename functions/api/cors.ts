// CORS headers for API responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// JSON response headers with CORS
export const jsonCorsHeaders = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

// Helper to create JSON response with CORS
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonCorsHeaders,
  });
}

// Helper for error responses with CORS
export function errorResponse(error: string, status = 400, details?: string): Response {
  return jsonResponse({ error, ...(details && { details }) }, status);
}
