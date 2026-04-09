import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/account', { replace: true });
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
          <h1 className="text-[36px] font-bold text-[var(--text-heading)] tracking-tight mb-2">Create account</h1>
          <p className="text-[var(--text-body)] text-[16px]">Join Mile High Fairway today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-[14px]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-heading)] placeholder-[var(--text-body)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[15px]"
              placeholder="John Smith"
            />
          </div>

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
              minLength={8}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-heading)] placeholder-[var(--text-body)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[15px]"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">
              Confirm password
            </label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </span>
          </button>
        </form>

        <p className="text-center text-[var(--text-body)] text-[15px] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
