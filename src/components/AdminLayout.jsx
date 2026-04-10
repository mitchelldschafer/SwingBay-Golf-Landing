import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Layers,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/members', icon: Users, label: 'Members' },
  { to: '/admin/bays', icon: Layers, label: 'Bays' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!user || !user.is_admin) return null;

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>SB</div>
          <span style={styles.logoText}>Admin</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <NavLink to="/" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Site</span>
          </NavLink>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#f0f0f0',
  },
  sidebar: {
    width: 240,
    background: '#111111',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #34d399, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 14,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '-0.02em',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '16px 12px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'rgba(52, 211, 153, 0.1)',
    color: '#34d399',
  },
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    width: '100%',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    marginLeft: 240,
    padding: '32px 40px',
    minHeight: '100vh',
    overflowY: 'auto',
  },
  loadingScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0a0a0a',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#34d399',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
