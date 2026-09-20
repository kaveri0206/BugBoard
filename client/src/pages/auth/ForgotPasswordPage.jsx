import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      addToast('If an account exists, a reset link was dispatched.', 'success');
    } catch (err) {
      addToast('Dispatched reset link if account exists.', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h2>
      <p className="text-xs text-slate-500 mb-6">Enter your email address to receive reset instructions.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Send Recovery Link
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Remembered password?{' '}
        <Link to="/login" className="text-sky-600 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}