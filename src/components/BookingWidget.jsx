import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const BookingWidget = () => {
  const [selectedDate, setSelectedDate] = useState(0); // Index 0-6
  const [selectedUnit, setSelectedUnit] = useState(0); // Index 0-5
  const [selectedTime, setSelectedTime] = useState(null); // String time

  const widgetRef = useRef(null);
  const slotsRef = useRef(null);

  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { 
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      fullString: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    };
  });

  const units = Array.from({ length: 6 }, (_, i) => `Bay ${i + 1}`);

  // Generate time slots (11am to 10pm) - 12 slots assuming 11:00 PM close
  const slots = Array.from({ length: 12 }, (_, i) => {
    const hour = 11 + i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour > 12 ? hour - 12 : hour;
    // Generate deterministic pseudo-random availability based on day + unit + time index
    const seed = selectedDate * 100 + selectedUnit * 10 + i;
    const available = (seed % 3 !== 0); // Roughly 66% available
    return { 
      time: `${display}:00 ${ampm}`, 
      available 
    };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal widget
      gsap.from(widgetRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: widgetRef.current,
          start: "top 84%"
        }
      });
      // Stagger in elements initially
      gsap.from(".bw-el", {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.2
      });
    }, widgetRef);
    return () => ctx.revert();
  }, []);

  // When changing date or unit, animate slots in
  useEffect(() => {
    setSelectedTime(null);
    if (slotsRef.current) {
      gsap.fromTo(slotsRef.current.children, 
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.02, ease: "power2.out" }
      );
    }
  }, [selectedDate, selectedUnit]);

  return (
    <div ref={widgetRef} className="max-w-[1000px] mx-auto w-full">
      <div className="text-center mb-10 bw-el">
        <h2 className="text-[34px] sm:text-[48px] font-semibold mb-4">Book Your Bay</h2>
        <p className="text-[17px] text-[var(--text-body)]">Select a bay, pick your time, and you're in. No calls needed.</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 sm:p-10 relative overflow-hidden bw-el hover-card">
        
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
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-light)] shadow-md transform scale-105' 
                    : 'bg-transparent border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--primary-light)]'
                }`}
              >
                <span className={`text-[13px] uppercase font-medium mb-1 ${selectedDate === i ? 'text-white' : 'text-[var(--text-muted)]'}`}>{d.label}</span>
                <span className="text-[22px] font-semibold">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selector */}
        <div className="mb-10">
          <p className="subtitle text-[var(--text-muted)] mb-3">Select Bay</p>
          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {units.map((u, i) => (
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
        <div className="mb-12">
          <p className="subtitle text-[var(--text-muted)] mb-3">Available Times</p>
          <div ref={slotsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((s, i) => (
              <button 
                key={i}
                disabled={!s.available}
                onClick={() => setSelectedTime(s.time)}
                className={`py-3.5 px-4 rounded-[12px] border transition-all font-semibold text-center ${
                  !s.available 
                    ? 'bg-[var(--background)] border-transparent text-[var(--text-muted)] opacity-50 line-through cursor-not-allowed'
                    : selectedTime === s.time
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--text-light)] shadow-md transform scale-[1.02]'
                      : 'bg-transparent border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation Bar */}
        <div className={`absolute bottom-0 left-0 right-0 bg-[var(--primary)] text-white p-4 sm:p-6 transition-transform duration-500 ease-in-out flex flex-col sm:flex-row items-center justify-between gap-4 ${
          selectedTime ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div>
            <p className="text-[14px] text-gray-300 font-medium mb-1">Your Booking Review</p>
            <p className="text-[17px] font-semibold">{units[selectedUnit]} &middot; {days[selectedDate].fullString} &middot; {selectedTime}</p>
          </div>
          <button className="bg-[var(--accent)] text-white font-semibold py-3 px-8 rounded-[99px] w-full sm:w-auto hover:scale-105 transition-transform">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;
