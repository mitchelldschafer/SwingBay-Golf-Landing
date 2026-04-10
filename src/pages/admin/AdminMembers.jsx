import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  X,
  Loader2,
  Shield,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';

const MEMBERSHIP_OPTIONS = ['none', 'basic', 'premium', 'vip'];

export default function AdminMembers() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateUser = async (id, updates) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data.user } : u));
        showToast('User updated');
      } else {
        showToast('Failed to update user', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const filteredUsers = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

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
        <h1 style={styles.title}>Members</h1>
        <p style={styles.subtitle}>{users.length} registered users</p>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <Search size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {search && (
          <button onClick={() => setSearch('')} style={styles.clearBtn}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>No members found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Email', 'Membership', 'Bookings', 'Joined', 'Admin', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: '#f0f0f0' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</span>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={user.membership_status}
                      onChange={e => updateUser(user.id, { membership_status: e.target.value })}
                      style={{
                        ...styles.membershipSelect,
                        color: getMembershipColor(user.membership_status),
                        borderColor: `${getMembershipColor(user.membership_status)}33`,
                      }}
                    >
                      {MEMBERSHIP_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.bookingCount}>{user.booking_count || 0}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={styles.td}>
                    {user.is_admin ? (
                      <ShieldCheck size={16} style={{ color: '#34d399' }} />
                    ) : (
                      <Shield size={16} style={{ color: 'rgba(255,255,255,0.15)' }} />
                    )}
                  </td>
                  <td style={styles.td}>
                    {!user.is_admin ? (
                      <button
                        onClick={() => {
                          if (confirm(`Grant admin access to ${user.name}?`)) {
                            updateUser(user.id, { is_admin: true });
                          }
                        }}
                        style={styles.promoteBtn}
                      >
                        Make Admin
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getMembershipColor(status) {
  switch (status) {
    case 'vip': return '#fbbf24';
    case 'premium': return '#a78bfa';
    case 'basic': return '#60a5fa';
    default: return 'rgba(255,255,255,0.3)';
  }
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
    marginBottom: 24,
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
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    maxWidth: 320,
    marginBottom: 20,
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#f0f0f0',
    fontSize: 13,
    outline: 'none',
    flex: 1,
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: 2,
  },
  tableContainer: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 48,
  },
  emptyState: {
    textAlign: 'center',
    padding: 48,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  td: {
    padding: '12px 16px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #34d399, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  membershipSelect: {
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 8px',
    outline: 'none',
    cursor: 'pointer',
  },
  bookingCount: {
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  promoteBtn: {
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    borderRadius: 6,
    color: '#34d399',
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    cursor: 'pointer',
  },
};
