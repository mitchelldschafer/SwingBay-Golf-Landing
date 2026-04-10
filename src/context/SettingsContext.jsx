import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const DEFAULTS = {
  business_name: 'Mile High Fairway',
  tagline: "Denver's premier indoor golf simulator experience.",
  phone: '(303) 555-0199',
  address: '1234 Swing Avenue',
  city_state_zip: 'Denver, CO 80202',
  hours_label: 'Mon - Sun',
  hours_time: '11:00 AM – 11:00 PM',
  membership_price: '$259',
  membership_period: '/ MONTH',
  membership_features: '8 hours of simulator time per month|15% discount on merchandise|15% discount on alcoholic beverages|$10 for rental clubs',
  hourly_rate: '$50 per hour',
  hourly_days: 'Monday – Sunday',
  league_days: 'Wednesdays',
  league_time: '7PM – 10PM',
  league_warmup: '7PM – 7:30PM Warm Ups',
  league_price: '$259 per month per person',
  league_commitment: '2 month commitment',
  league_format: '4v4',
  league_holes: '18 holes played each evening!',
  league_scoring: 'Leagues based on GHIN index',
  league_schedule_info: 'Monday & Wednesday Night 7pm – 10pm',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
        }
      } catch (err) {
        // silently fall back to defaults
      }
      setLoaded(true);
    };
    fetchSettings();
  }, []);

  const s = (key) => settings[key] || DEFAULTS[key] || '';

  return (
    <SettingsContext.Provider value={{ settings, s, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
