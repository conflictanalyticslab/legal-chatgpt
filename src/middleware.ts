import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the origin from the request headers
  const origin = req.headers.get("origin") || (process.env.NODE_ENV === 'development' ? '*' : 'https://openjustice.ai');
  
  // More explicit logging
  console.log('\n==========================================');
  console.log('🚀 MIDDLEWARE EXECUTING');
  console.log(`📝 Request URL: ${req.url}`);
  console.log(`🔑 Method: ${req.method}`);
  console.log(`🌐 Origin: ${origin}`);
  console.log('==========================================\n');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("🔄 Handling OPTIONS request");
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Add CORS headers to all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  const response = NextResponse.next();
  // Add CORS headers to successful responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  console.log("✅ Middleware completed successfully\n");
  return response;
}

// Simplified matcher configuration
export const config = {
  matcher: ['/api/llm/query'] // Only matches for /api/llm/query route, if there are other routes, they will not be matched
}; 
