import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const TIME_SLOTS = [
  '11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM',
  '5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM',
];

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [statsRes, scheduleRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/schedule', { headers }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          setSchedule(data.bookings || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Bookings Today', value: stats?.todayBookings || 0, icon: Clock, color: '#34d399' },
    { label: 'This Week', value: stats?.weekBookings || 0, icon: CalendarDays, color: '#60a5fa' },
    { label: 'Total Members', value: stats?.totalUsers || 0, icon: Users, color: '#a78bfa' },
    { label: 'Active Members', value: stats?.activeMembers || 0, icon: TrendingUp, color: '#fbbf24' },
  ];

  // Build schedule grid
  const bays = [...new Set(schedule.map(b => b.bay_name))].sort();
  const scheduleMap = {};
  schedule.forEach(b => {
    const key = `${b.bay_name}__${b.time_slot}`;
    scheduleMap[key] = b;
  });

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div style={{ ...styles.statIcon, background: `${color}15`, color }}>
                <Icon size={18} />
              </div>
              <span style={styles.statLabel}>{label}</span>
            </div>
            <div style={{ ...styles.statValue, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Today's Schedule</h2>
          <Link to="/admin/bookings" style={styles.viewAllLink}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {bays.length === 0 ? (
          <div style={styles.emptyState}>
            <CalendarDays size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>No bookings today</p>
          </div>
        ) : (
          <div style={styles.scheduleGrid}>
            {/* Header Row */}
            <div style={styles.scheduleHeaderCell}></div>
            {TIME_SLOTS.map(slot => (
              <div key={slot} style={styles.scheduleHeaderCell}>
                {slot.replace(':00', '').replace(' ', '')}
              </div>
            ))}

            {/* Bay Rows */}
            {bays.map(bay => (
              <React.Fragment key={bay}>
                <div style={styles.bayLabel}>{bay}</div>
                {TIME_SLOTS.map(slot => {
                  const booking = scheduleMap[`${bay}__${slot}`];
                  const isCancelled = booking?.status === 'cancelled';
                  return (
                    <div
                      key={slot}
                      style={{
                        ...styles.scheduleCell,
                        ...(booking && !isCancelled ? styles.scheduleCellBooked : {}),
                        ...(isCancelled ? styles.scheduleCellCancelled : {}),
                      }}
                      title={booking ? `${booking.name} — ${booking.booking_ref}` : 'Available'}
                    >
                      {booking && !isCancelled && (
                        <span style={styles.bookedName}>{booking.name.split(' ')[0]}</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={styles.quickLinks}>
        <Link to="/admin/bookings" style={styles.quickLinkCard}>
          <CalendarDays size={20} />
          <span>Manage Bookings</span>
          <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </Link>
        <Link to="/admin/members" style={styles.quickLinkCard}>
          <Users size={20} />
          <span>Manage Members</span>
          <ArrowRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </Link>
      </div>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  pageHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f0f0f0',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    margin: '4px 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '20px 24px',
  },
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 500,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#f0f0f0',
    margin: 0,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#34d399',
    textDecoration: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
  },
  scheduleGrid: {
    display: 'grid',
    gridTemplateColumns: '140px repeat(12, 1fr)',
    gap: 2,
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    overflowX: 'auto',
  },
  scheduleHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    padding: '6px 4px',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
  bayLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    padding: '8px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  scheduleCell: {
    minHeight: 40,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  scheduleCellBooked: {
    background: 'rgba(52, 211, 153, 0.12)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
  },
  scheduleCellCancelled: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  bookedName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#34d399',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    padding: '0 4px',
  },
  quickLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 12,
  },
  quickLinkCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#f0f0f0',
    fontSize: 14,
    fontWeight: 500,
    transition: 'border-color 0.2s',
  },
};
