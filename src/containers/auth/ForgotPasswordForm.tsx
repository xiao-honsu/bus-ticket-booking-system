'use client';

import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    console.log('Forgot password:', email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-6">We've sent password reset instructions to {email}</p>
        <a href="/auth/login" className="text-blue-600 hover:text-blue-800">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <p className="text-gray-600 mb-6 text-center">
        Enter your email and we'll send you instructions to reset your password
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Send Reset Link
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-blue-600 hover:text-blue-800 text-sm">
          Back to Login
        </a>
      </div>
    </div>
  );
}
