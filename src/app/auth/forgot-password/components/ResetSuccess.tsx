import Link from 'next/link';

interface ResetSuccessProps {
  email: string;
}

export function ResetSuccess({ email: _email }: ResetSuccessProps) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height)-var(--nav-height))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Email enviado
          </h2>
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">
            Te hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.
          </p>
          <Link
            href="/auth/login"
            className="text-lf-primary hover:text-lf-primary/80 font-medium text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
