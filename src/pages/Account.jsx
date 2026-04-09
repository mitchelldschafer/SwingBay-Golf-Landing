import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Award, Calendar } from 'lucide-react';

const MEMBERSHIP_LABELS = {
  none: { label: 'No Membership', color: 'text-white/50', bg: 'bg-white/5 border-white/10' },
  active: { label: 'Active Member', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
};

const Account = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const membership = MEMBERSHIP_LABELS[user.membership_status] || MEMBERSHIP_LABELS.none;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--background)] py-24 px-6">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-[36px] md:text-[42px] font-bold text-[var(--text-heading)] tracking-tight">
            My Account
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[var(--text-body)] hover:text-[var(--accent)] transition-colors text-[14px] font-semibold"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="border border-[var(--border)] rounded-[24px] p-8 bg-white/3">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <User size={28} className="text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-[var(--text-heading)]">{user.name}</h2>
                <p className="text-[var(--text-body)] text-[15px]">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-body)] text-[14px]">
              <Calendar size={15} />
              <span>Member since {joinDate}</span>
            </div>
          </div>

          {/* Membership Status Card */}
          <div className={`border rounded-[24px] p-8 ${membership.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <Award size={22} className={membership.color} />
              <h3 className="text-[18px] font-bold text-[var(--text-heading)]">Membership Status</h3>
            </div>
            <p className={`text-[22px] font-black uppercase tracking-wider ${membership.color}`}>
              {membership.label}
            </p>
            {user.membership_status === 'none' && (
              <div className="mt-6">
                <p className="text-[var(--text-body)] text-[15px] mb-4">
                  Unlock 8 hours/month, drink discounts, and more for $259/month.
                </p>
                <Link to="/pricing" className="btn-primary text-[14px] px-6 py-2.5 inline-block">
                  <span className="bg-slide"></span>
                  <span className="text text-[var(--text-heading)]">View Membership Plans</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border border-[var(--border)] rounded-[24px] p-8 bg-white/3">
            <h3 className="text-[18px] font-bold text-[var(--text-heading)] mb-6">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link to="/book" className="btn-primary text-[14px] px-6 py-2.5 inline-block">
                <span className="bg-slide"></span>
                <span className="text text-[var(--text-heading)]">Book a Bay</span>
              </Link>
              <Link
                to="/pricing"
                className="border border-[var(--border)] rounded-xl px-6 py-2.5 text-[14px] font-semibold text-[var(--text-heading)] hover:border-[var(--accent)] transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
