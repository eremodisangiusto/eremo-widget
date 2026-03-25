// middleware.js — root del repo
// Vercel Edge Middleware: aggiunge CORS headers a tutte le route /api/*
// prima che la richiesta arrivi alla Serverless Function

import { NextResponse } from 'next/server';

export function middleware(request) {
  // Gestisci la preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age':       '86400',
      },
    });
  }

  // Per tutte le altre richieste, lascia passare e aggiungi headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin',  '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Applica solo alle route /api/*
export const config = {
  matcher: '/api/:path*',
};
