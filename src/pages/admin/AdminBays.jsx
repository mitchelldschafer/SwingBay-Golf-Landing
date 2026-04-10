import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Loader2,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminBays() {
  const { getToken } = useAuth();
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchBays = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/bays', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBays(data.bays);
      }
    } catch (err) {
      console.error('Fetch bays error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBays(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleBay = async (id, currentActive) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/admin/bays/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setBays(prev => prev.map(b => b.id === id ? data.bay : b));
        showToast(`Bay ${!currentActive ? 'activated' : 'set to maintenance'}`);
      }
    } catch {
      showToast('Failed to update bay', 'error');
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'error' ? '#dc2626' : '#059669',
        }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.message}
        </div>
      )}

      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Bay Management</h1>
        <p style={styles.subtitle}>Toggle bays active or into maintenance mode</p>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={styles.bayGrid}>
          {bays.map(bay => (
            <div
              key={bay.id}
              style={{
                ...styles.bayCard,
                borderColor: bay.is_active ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              }}
            >
              <div style={styles.bayCardTop}>
                <div style={{
                  ...styles.statusDot,
                  background: bay.is_active ? '#34d399' : '#ef4444',
                  boxShadow: bay.is_active
                    ? '0 0 8px rgba(52,211,153,0.4)'
                    : '0 0 8px rgba(239,68,68,0.4)',
                }} />
                <h3 style={styles.bayName}>{bay.name}</h3>
              </div>

              <div style={styles.bayCardBottom}>
                <span style={{
                  ...styles.bayStatus,
                  color: bay.is_active ? '#34d399' : '#ef4444',
                }}>
                  {bay.is_active ? 'Active' : 'Maintenance'}
                </span>

                <button
                  onClick={() => toggleBay(bay.id, bay.is_active)}
                  style={styles.toggleBtn}
                  title={bay.is_active ? 'Set to maintenance' : 'Activate'}
                >
                  {bay.is_active ? (
                    <ToggleRight size={28} style={{ color: '#34d399' }} />
                  ) : (
                    <ToggleLeft size={28} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed',
    top: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    zIndex: 1000,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 48,
  },
  bayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  bayCard: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    transition: 'border-color 0.3s',
  },
  bayCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  bayName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f0f0f0',
    margin: 0,
  },
  bayCardBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bayStatus: {
    fontSize: 13,
    fontWeight: 500,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
};
