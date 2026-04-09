import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Award, Calendar, Clock, MapPin } from 'lucide-react';

const MEMBERSHIP_LABELS = {
  none: { label: 'No Membership', color: 'text-white/50', bg: 'bg-white/5 border-white/10' },
  active: { label: 'Active Member', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
};

function formatBookingDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

const Account = () => {
  const { user, logout, loading, getToken } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setBookingsLoading(true);
    fetch('/api/bookings/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, [user, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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

          {/* Upcoming Reservations */}
          <div className="border border-[var(--border)] rounded-[24px] p-8 bg-white/3">
            <h3 className="text-[18px] font-bold text-[var(--text-heading)] mb-6">Upcoming Reservations</h3>

            {bookingsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 rounded-[14px] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--text-body)] text-[15px] mb-4">No upcoming reservations yet.</p>
                <Link to="/book" className="btn-primary text-[14px] px-6 py-2.5 inline-block">
                  <span className="bg-slide"></span>
                  <span className="text text-[var(--text-heading)]">Book a Bay</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="border border-[var(--border)] rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={15} className="text-[var(--accent)] shrink-0" />
                        <span className="font-semibold text-[var(--text-heading)] text-[15px]">{b.bay_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-body)] text-[14px]">
                        <Clock size={14} className="text-[var(--text-muted)] shrink-0" />
                        <span>{formatBookingDate(b.booking_date)} &middot; {b.time_slot}</span>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-[var(--accent)] tracking-wider bg-[var(--accent)]/10 px-3 py-1 rounded-full self-start sm:self-center whitespace-nowrap">
                      {b.booking_ref}
                    </span>
                  </div>
                ))}
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
