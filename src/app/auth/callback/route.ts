import { NextResponse } from 'next/server';
import { handleAuthCallback } from '@/services/authService';

/**
 * Auth Callback Route Handler
 *
 * Maneja el callback de autenticación OAuth de Supabase.
 * Esta ruta NO accede directamente a Supabase, sino que usa el servicio
 * de autenticación que encapsula la lógica de negocio.
 *
 * Arquitectura: Route -> Service -> Repository -> Supabase
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/tree';

  // Usar el servicio de autenticación en lugar de acceder directamente a Supabase
  const result = await handleAuthCallback({ code: code ?? '', redirectTo });

  return NextResponse.redirect(new URL(result.redirectTo, request.url));
}
