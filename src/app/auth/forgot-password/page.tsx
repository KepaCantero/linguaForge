'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ResetSuccess } from './components/ResetSuccess';
import { ResetForm } from './components/ResetForm';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return <ResetSuccess email={email} />;
  }

  return (
    <ResetForm
      email={email}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
    />
  );
}
