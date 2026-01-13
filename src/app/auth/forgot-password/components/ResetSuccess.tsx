import Link from 'next/link';

interface ResetSuccessProps {
  email: string;
}

export function ResetSuccess({ email: _email }: ResetSuccessProps) {
  return (
    <div className="min-h-[calc(100dvh-var(--header-height)-var(--nav-height))] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="p-6 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
          <h2 className="text-xl font-semibold text-accent-800 dark:text-accent-200 mb-2">
            Email enviado
          </h2>
          <p className="text-sm text-accent-600 dark:text-accent-400 mb-4">
            Te hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.
          </p>
          <Link
            href="/auth/login"
            className="text-calm-text-primary hover:text-calm-text-primary/80 font-medium text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
