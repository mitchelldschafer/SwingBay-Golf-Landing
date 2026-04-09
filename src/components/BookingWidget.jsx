import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const BAYS = ['Driving Range 1', 'Driving Range 2', 'VIP Simulator Bay'];

function toISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateDays() {
  const denverNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(denverNow);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Denver' }),
      date: d.getDate(),
      fullString: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Denver' }),
      isoDate: toISODate(d),
    };
  });
}

function generateTimeSlots() {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = 11 + i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour > 12 ? hour - 12 : hour;
    return `${display}:00 ${ampm}`;
  });
}

const timeSlots = generateTimeSlots();

const BookingWidget = () => {
  const { user, getToken } = useAuth();

  const [days, setDays] = useState(() => generateDays());
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const [takenSlots, setTakenSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const slotsRef = useRef(null);
  const stepContainerRef = useRef(null);
  const abortRef = useRef(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
  }, { scope: containerRef });

  const fetchAvailability = useCallback(async (dateIdx, unitIdx) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isoDate = days[dateIdx].isoDate;
    const bay = BAYS[unitIdx];
    setAvailabilityLoading(true);
    setTakenSlots([]);
    setAvailabilityError(false);
    try {
      const res = await fetch(`/api/bookings/availability?date=${isoDate}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = await res.json();
      setTakenSlots(data.taken[bay] || []);
    } catch (err) {
      if (err.name !== 'AbortError') setAvailabilityError(true);
    } finally {
      if (!controller.signal.aborted) setAvailabilityLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (bookingStep === 1) {
      setSelectedTime(null);
      fetchAvailability(selectedDate, selectedUnit);
    }
  }, [selectedDate, selectedUnit, bookingStep, fetchAvailability]);

  useEffect(() => {
    if (bookingStep === 1 && slotsRef.current && !availabilityLoading) {
      gsap.fromTo(slotsRef.current.children,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.02, ease: 'power2.out' }
      );
    }
  }, [availabilityLoading, bookingStep]);

  useEffect(() => {
    const refreshAtMidnight = () => {
      setDays(generateDays());
      setSelectedDate(0);
    };
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const t = setTimeout(refreshAtMidnight, msUntilMidnight);
    return () => clearTimeout(t);
  }, [days]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setBookingStep(3);

    try {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const effectiveName = formData.name || user?.name || '';
      const effectiveEmail = formData.email || user?.email || '';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bay_name: BAYS[selectedUnit],
          booking_date: days[selectedDate].isoDate,
          time_slot: selectedTime,
          name: effectiveName,
          email: effectiveEmail,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Booking failed. Please try again.');
        setBookingStep(2);
        if (res.status === 409) {
          setSelectedTime(null);
          fetchAvailability(selectedDate, selectedUnit);
        }
        return;
      }

      setConfirmedBooking(data.booking);
      setBookingStep(4);
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      setBookingStep(2);
    }
  };

  const resetBooking = () => {
    setBookingStep(1);
    setSelectedTime(null);
    setFormData({ name: '', email: '', phone: '' });
    setConfirmedBooking(null);
    setSubmitError('');
  };

  const slots = timeSlots.map(time => ({
    time,
    available: !takenSlots.includes(time),
  }));

  return (
    <div ref={containerRef} className="max-w-[1000px] mx-auto w-full">
      <div ref={widgetRef}>
        <div className="text-center mb-10 bw-el">
          <h2 className="text-[34px] sm:text-[48px] font-semibold mb-4 text-[var(--text-heading)]">Book Your Bay</h2>
          <p className="text-[17px] text-[var(--text-body)]">Select a bay, pick your time, and you're in. No calls needed.</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 sm:p-10 relative overflow-hidden bw-el shadow-xl min-h-[550px] flex flex-col">

          <div ref={stepContainerRef} className="flex-grow w-full">

            {/* STEP 1: DATE, BAY, TIME SELECTION */}
            {bookingStep === 1 && (
              <div className="w-full pb-20">
                {/* Date Selector */}
                <div className="mb-8">
                  <p className="subtitle text-[var(--text-muted)] mb-3">Select Date</p>
                  <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {days.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(i)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] py-3 rounded-[12px] border transition-all ${
                          selectedDate === i
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-heading)] shadow-md transform scale-105'
                            : 'bg-transparent border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--primary-light)]'
                        }`}
                      >
                        <span className={`text-[13px] uppercase font-medium mb-1 ${selectedDate === i ? 'text-[var(--text-heading)]' : 'text-[var(--text-muted)]'}`}>{d.label}</span>
                        <span className="text-[22px] font-semibold">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bay Selector */}
                <div className="mb-10">
                  <p className="subtitle text-[var(--text-muted)] mb-3">Select Bay</p>
                  <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {BAYS.map((u, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedUnit(i)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-[99px] border transition-all font-semibold ${
                          selectedUnit === i
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--text-light)] shadow-md'
                            : 'bg-transparent border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--primary-light)]'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selector */}
                <div className="mb-4">
                  <p className="subtitle text-[var(--text-muted)] mb-3">
                    Available Times
                    {availabilityLoading && <span className="ml-2 text-[13px] text-[var(--text-muted)] animate-pulse">Loading availability…</span>}
                  </p>
                  <div ref={slotsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availabilityLoading
                      ? timeSlots.map((_, i) => (
                          <div key={i} className="py-3.5 px-4 rounded-[12px] border border-[var(--border)] bg-[var(--background)] animate-pulse h-[52px]" />
                        ))
                      : availabilityError
                      ? (
                          <div className="col-span-full py-4 text-center text-sm text-red-500">
                            Unable to load availability. Please refresh to try again.
                          </div>
                        )
                      : slots.map((s, i) => (
                          <button
                            key={i}
                            disabled={!s.available}
                            onClick={() => setSelectedTime(s.time)}
                            className={`py-3.5 px-4 rounded-[12px] border transition-all font-semibold text-center ${
                              !s.available
                                ? 'bg-[var(--background)] border-transparent text-[var(--text-muted)] opacity-50 line-through cursor-not-allowed'
                                : selectedTime === s.time
                                  ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-heading)] shadow-md transform scale-[1.02]'
                                  : 'bg-transparent border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--accent)] hover:text-[var(--text-heading)]'
                            }`}
                          >
                            {s.time}
                          </button>
                        ))
                    }
                  </div>
                </div>

                {/* Continue Bar */}
                <div className={`absolute bottom-0 left-0 right-0 bg-[var(--primary)] border-t border-[var(--border)] p-4 sm:p-6 transition-transform duration-500 ease-in-out flex flex-col sm:flex-row items-center justify-between gap-4 z-10 ${
                  selectedTime ? 'translate-y-0' : 'translate-y-full'
                }`}>
                  <div className="text-white">
                    <p className="text-[14px] text-[var(--accent)] font-semibold uppercase tracking-wider mb-1">Booking Selection Review</p>
                    <p className="text-[17px] font-semibold">{BAYS[selectedUnit]} &middot; {days[selectedDate].fullString} &middot; {selectedTime}</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        name: prev.name || user?.name || '',
                        email: prev.email || user?.email || '',
                        phone: prev.phone || '',
                      }));
                      setBookingStep(2);
                    }}
                    className="bg-[var(--accent)] text-[var(--text-heading)] font-bold py-3 px-8 rounded-[99px] w-full sm:w-auto hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LEAD CAPTURE FORM */}
            {bookingStep === 2 && (
              <div className="w-full flex-grow flex flex-col h-full bg-[var(--surface)]">
                <div className="mb-8">
                  <button onClick={() => setBookingStep(1)} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-6 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to time selection
                  </button>
                  <h3 className="text-[28px] font-bold text-[var(--text-heading)] mb-2">Almost there!</h3>
                  <p className="text-[16px] text-[var(--text-body)]">
                    We just need a few details to confirm your reservation for <strong>{BAYS[selectedUnit]}</strong> on <strong>{days[selectedDate].fullString}</strong> at <strong>{selectedTime}</strong>.
                  </p>
                </div>

                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-[14px] mb-5">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-5 flex-grow mb-10">
                  <div>
                    <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[var(--text-heading)] mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[12px] px-4 py-3 text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>

                  <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-[12px] p-4 mt-8 flex items-start gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    <p className="text-[13px] text-[var(--text-body)] leading-relaxed">
                      Payment will be collected at the venue. Your booking is held until check-in. Cancellations within 24 hours may be subject to a fee.
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-[var(--primary)] border-t border-[var(--border)] p-4 sm:p-6 flex items-center justify-between z-10 w-full rounded-b-[24px]">
                    <div className="text-white hidden sm:block">
                      <p className="text-[14px] text-[var(--accent)] font-semibold uppercase tracking-wider mb-1">Final Step</p>
                    </div>
                    <button type="submit" className="bg-[var(--accent)] text-[var(--text-heading)] font-bold py-3 px-8 rounded-[99px] w-full sm:w-auto hover:bg-[var(--accent-hover)] transition-colors shadow-lg">
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: LOADING */}
            {bookingStep === 3 && (
              <div className="w-full h-full flex flex-col items-center justify-center py-20">
                <svg className="animate-spin text-[var(--primary)] mb-6" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <h3 className="text-[28px] font-bold text-[var(--text-heading)] mb-2">Securing your bay...</h3>
                <p className="text-[16px] text-[var(--text-muted)]">Please do not close this window.</p>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {bookingStep === 4 && confirmedBooking && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-24 h-24 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <h3 className="text-[36px] font-bold text-[var(--text-heading)] mb-4">You're All Set!</h3>
                <p className="text-[17px] text-[var(--text-body)] max-w-[400px] mb-8">
                  Your bay has been reserved for <strong>{days[selectedDate].fullString}</strong> at <strong>{selectedTime}</strong>. See you on the green!
                </p>
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-[16px] p-6 max-w-[340px] w-full mb-10 text-left">
                  <p className="text-[13px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-3">Booking Confirmation</p>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border)]">
                    <span className="text-[13px] text-[var(--text-muted)]">Reference</span>
                    <span className="text-[16px] font-bold text-[var(--accent)] tracking-wider">{confirmedBooking.booking_ref}</span>
                  </div>
                  <p className="text-[15px] text-[var(--text-heading)] font-semibold mb-1">{confirmedBooking.name}</p>
                  <p className="text-[15px] text-[var(--text-heading)] mb-1">{confirmedBooking.bay_name}</p>
                  <p className="text-[15px] text-[var(--text-heading)]">{days[selectedDate].fullString} at {selectedTime}</p>
                </div>
                <button
                  onClick={resetBooking}
                  className="bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] font-bold py-3 px-8 rounded-[99px] hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  Book Another Bay
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;
