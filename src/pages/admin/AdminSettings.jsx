import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>{title}</h2>
    <div style={s.sectionBody}>{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div style={s.field}>
    <label style={s.label}>{label}{hint && <span style={s.hint}>{hint}</span>}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    style={s.input}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || ''}
    onFocus={e => e.target.style.borderColor = '#34d399'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    style={{ ...s.input, minHeight: rows * 36 + 'px', resize: 'vertical' }}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || ''}
    onFocus={e => e.target.style.borderColor = '#34d399'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
  />
);

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const token = user ? localStorage.getItem('mhf_token') : null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSettings(data.settings || {});
      } catch {
        showToast('error', 'Failed to load settings');
      }
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const set = (key) => (val) => setSettings(prev => ({ ...prev, [key]: val }));
  const get = (key, fallback = '') => settings[key] ?? fallback;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('success', 'Settings saved! Changes will reflect on the site immediately.');
    } catch {
      showToast('error', 'Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Site Settings</h1>
          <p style={s.subtitle}>Edit pricing, hours, contact info and more. Changes go live instantly.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', borderColor: toast.type === 'success' ? '#34d399' : '#ef4444' }}>
          {toast.type === 'success' ? <CheckCircle size={16} color="#34d399" /> : <AlertCircle size={16} color="#ef4444" />}
          <span style={{ color: toast.type === 'success' ? '#34d399' : '#ef4444', fontSize: 14 }}>{toast.msg}</span>
        </div>
      )}

      <div style={s.grid}>
        {/* Business Info */}
        <Section title="Business Info">
          <Field label="Business Name">
            <Input value={get('business_name')} onChange={set('business_name')} placeholder="Mile High Fairway" />
          </Field>
          <Field label="Tagline" hint="Shows on the membership page">
            <Textarea value={get('tagline')} onChange={set('tagline')} rows={2} placeholder="Denver's premier indoor golf simulator experience." />
          </Field>
          <Field label="Phone Number">
            <Input value={get('phone')} onChange={set('phone')} placeholder="(303) 555-0199" />
          </Field>
          <Field label="Street Address">
            <Input value={get('address')} onChange={set('address')} placeholder="1234 Swing Avenue" />
          </Field>
          <Field label="City, State, ZIP">
            <Input value={get('city_state_zip')} onChange={set('city_state_zip')} placeholder="Denver, CO 80202" />
          </Field>
        </Section>

        {/* Hours */}
        <Section title="Business Hours">
          <Field label="Days Label" hint='e.g. "Mon - Sun" or "Mon - Sat"'>
            <Input value={get('hours_label')} onChange={set('hours_label')} placeholder="Mon - Sun" />
          </Field>
          <Field label="Hours" hint='e.g. "11:00 AM – 11:00 PM"'>
            <Input value={get('hours_time')} onChange={set('hours_time')} placeholder="11:00 AM – 11:00 PM" />
          </Field>
        </Section>

        {/* Membership Pricing */}
        <Section title="Membership Pricing">
          <Field label="Monthly Price" hint='e.g. "$259"'>
            <Input value={get('membership_price')} onChange={set('membership_price')} placeholder="$259" />
          </Field>
          <Field label="Period Label" hint='e.g. "/ MONTH"'>
            <Input value={get('membership_period')} onChange={set('membership_period')} placeholder="/ MONTH" />
          </Field>
          <Field label="Membership Features" hint="One feature per line, separate with | pipe character">
            <Textarea
              value={get('membership_features').split('|').join('\n')}
              onChange={(val) => set('membership_features')(val.split('\n').join('|'))}
              rows={5}
              placeholder={"8 hours of simulator time per month\n15% discount on merchandise"}
            />
          </Field>
        </Section>

        {/* Open Play */}
        <Section title="Open Play Pricing">
          <Field label="Hourly Rate" hint='e.g. "$50 per hour"'>
            <Input value={get('hourly_rate')} onChange={set('hourly_rate')} placeholder="$50 per hour" />
          </Field>
          <Field label="Available Days" hint='e.g. "Monday – Sunday"'>
            <Input value={get('hourly_days')} onChange={set('hourly_days')} placeholder="Monday – Sunday" />
          </Field>
          <Field label="League Schedule Info" hint="Shown in the pricing overview box">
            <Input value={get('league_schedule_info')} onChange={set('league_schedule_info')} placeholder="Monday & Wednesday Night 7pm – 10pm" />
          </Field>
        </Section>

        {/* Weekly Leagues */}
        <Section title="Weekly Leagues">
          <Field label="League Day(s)">
            <Input value={get('league_days')} onChange={set('league_days')} placeholder="Wednesdays" />
          </Field>
          <Field label="Time Slot">
            <Input value={get('league_time')} onChange={set('league_time')} placeholder="7PM – 10PM" />
          </Field>
          <Field label="Warm-up Time">
            <Input value={get('league_warmup')} onChange={set('league_warmup')} placeholder="7PM – 7:30PM Warm Ups" />
          </Field>
          <Field label="League Price">
            <Input value={get('league_price')} onChange={set('league_price')} placeholder="$259 per month per person" />
          </Field>
          <Field label="Commitment">
            <Input value={get('league_commitment')} onChange={set('league_commitment')} placeholder="2 month commitment" />
          </Field>
          <Field label="Format">
            <Input value={get('league_format')} onChange={set('league_format')} placeholder="4v4" />
          </Field>
          <Field label="Holes per Evening">
            <Input value={get('league_holes')} onChange={set('league_holes')} placeholder="18 holes played each evening!" />
          </Field>
          <Field label="Scoring System">
            <Input value={get('league_scoring')} onChange={set('league_scoring')} placeholder="Leagues based on GHIN index" />
          </Field>
        </Section>
      </div>

      {/* Bottom Save Button */}
      <div style={s.bottomBar}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    maxWidth: 900,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f0f0f0',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    marginBottom: 0,
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #34d399, #059669)',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid',
    marginBottom: 24,
    backdropFilter: 'blur(8px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '20px 24px',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#34d399',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 16,
    marginTop: 0,
  },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  hint: {
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 14,
    color: '#f0f0f0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#34d399',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  bottomBar: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
};
