import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';

const BAYS = ['Driving Range 1', 'Driving Range 2', 'VIP Simulator Bay'];
const STATUSES = ['confirmed', 'cancelled'];

export default function AdminBookings() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bayFilter, setBayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);

  const LIMIT = 25;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (bayFilter) params.set('bay', bayFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);

    try {
      const res = await fetch(`/api/admin/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, page, bayFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    const token = getToken();
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Booking cancelled');
        fetchBookings();
      }
    } catch (err) {
      showToast('Failed to cancel booking', 'error');
    }
  };

  const filteredBookings = search
    ? bookings.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase()) ||
        b.booking_ref.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  const totalPages = Math.ceil(total / LIMIT);

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
        <h1 style={styles.title}>Bookings</h1>
        <p style={styles.subtitle}>{total} total bookings</p>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <div style={styles.searchBox}>
          <Search size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Search name, email, or ref..."
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

        <div style={styles.filterGroup}>
          <select
            value={bayFilter}
            onChange={e => { setBayFilter(e.target.value); setPage(1); }}
            style={styles.select}
          >
            <option value="">All Bays</option>
            {BAYS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={styles.select}
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            style={styles.dateInput}
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            style={styles.dateInput}
            placeholder="To"
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>No bookings found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Ref', 'Bay', 'Date', 'Time', 'Name', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} style={styles.tr}>
                  <td style={styles.td}>
                    <code style={styles.refCode}>{booking.booking_ref}</code>
                  </td>
                  <td style={styles.td}>{booking.bay_name}</td>
                  <td style={styles.td}>
                    {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td style={styles.td}>{booking.time_slot}</td>
                  <td style={styles.td}><span style={styles.nameCell}>{booking.name}</span></td>
                  <td style={styles.td}>
                    <span style={styles.emailCell}>{booking.email}</span>
                  </td>
                  <td style={styles.td}>{booking.phone}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled),
                    }}>
                      {booking.status || 'confirmed'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {(booking.status || 'confirmed') === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        style={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
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
    animation: 'fadeIn 0.3s ease',
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
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 12px',
    flex: 1,
    minWidth: 220,
    maxWidth: 320,
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
  filterGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  select: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f0f0f0',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    cursor: 'pointer',
  },
  dateInput: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#f0f0f0',
    fontSize: 13,
    padding: '8px 12px',
    outline: 'none',
    colorScheme: 'dark',
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
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
  },
  refCode: {
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#60a5fa',
  },
  nameCell: {
    fontWeight: 500,
    color: '#f0f0f0',
  },
  emailCell: {
    color: 'rgba(255,255,255,0.4)',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '3px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statusConfirmed: {
    background: 'rgba(52, 211, 153, 0.12)',
    color: '#34d399',
  },
  statusCancelled: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
  },
  cancelBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.6)',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  pageInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
};
