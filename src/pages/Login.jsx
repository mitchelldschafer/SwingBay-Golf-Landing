import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <h1 className="text-[36px] font-bold text-[var(--text-heading)] tracking-tight mb-2">Welcome back</h1>
          <p className="text-[var(--text-body)] text-[16px]">Sign in to your Mile High Fairway account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-[14px]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-heading)] placeholder-[var(--text-body)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[15px]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-heading)] placeholder-[var(--text-body)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[15px]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-[15px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="bg-slide"></span>
            <span className="text text-[var(--text-heading)]">
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
        </form>

        <p className="text-center text-[var(--text-body)] text-[15px] mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--accent)] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
