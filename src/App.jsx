import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Star, Plus, Minus, Menu, X, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import BookingWidget from './components/BookingWidget';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  // GSAP Ref Containers
  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const offeringsRef = useRef(null);
  const statsRef = useRef(null);
  const pricingRef = useRef(null);
  const accordionRef = useRef(null);
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Media query to check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Animation (Preset 2 - 0.6s power2.out)
      const tlHero = gsap.timeline({ defaults: { ease: "power2.out" } });
      tlHero.from(".hero-subtitle", { y: 15, opacity: 0, duration: 0.5 })
            .from(".hero-headline", { y: 30, opacity: 0, duration: 0.6 }, "-=0.3")
            .from(".hero-subtext", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
            .from(".hero-btns > *", { y: 15, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.2")
            .from(".hero-main-img", { scale: 0.95, opacity: 0, duration: 0.7 }, "-=0.5")
            .from(".hero-overlap-card", { y: 30, opacity: 0, duration: 0.6 }, "-=0.3")
            .from(".hero-badge", { y: 15, opacity: 0, duration: 0.5, stagger: 0.15 }, "-=0.2");

      // 2. Section Fade-ups
      const sections = [
        { ref: howItWorksRef, selector: ".hiw-card" },
        { ref: offeringsRef, selector: ".offering-card" },
        { ref: pricingRef, selector: ".pricing-card" },
        { ref: accordionRef, selector: ".accordion-item" },
        { ref: testimonialsRef, selector: ".testimonial-card" },
        { ref: faqRef, selector: ".faq-item" },
        { ref: ctaRef, selector: ".cta-el" }
      ];

      sections.forEach(({ ref, selector }) => {
        if (ref.current) {
          gsap.from(gsap.utils.toArray(selector, ref.current), {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 84%",
              toggleActions: "play none none none"
            }
          });
        }
      });

      // 3. Stats Count-up
      if (statsRef.current) {
        gsap.from(".stat-num", {
          textContent: 0,
          duration: 2,
          ease: "power1.inOut",
          snap: { textContent: 1 },
          stagger: 0.15,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 84%"
          }
        });
      }

    });

    return () => ctx.revert();
  }, []);

  const toggleAccordion = (idx) => {
    setActiveAccordion(activeAccordion === idx ? null : idx);
  };

  const navLinks = [
    { name: "Offerings", href: "#offerings" },
    { name: "Pricing", href: "#pricing" },
    { name: "Book", href: "#book" },
    { name: "About", href: "#about" },
    { name: "FAQ", href: "#faq" }
  ];

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[var(--background)] shadow-sm border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] md:h-[100px] flex items-center justify-between">
          <div className="text-[24px] md:text-[28px] font-bold text-[var(--text-heading)] tracking-tight">
            SwingBay<span className="text-[var(--accent)]">.</span>
          </div>
          
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[16px] font-semibold text-[var(--text-heading)] hover:text-[var(--accent)] transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a href="#book" className="btn-primary">
              <span className="bg-slide"></span>
              <span className="text">Book a Bay</span>
            </a>
          </div>

          <button className="md:hidden text-[var(--text-heading)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[80px] left-0 w-full bg-[var(--background)] border-b border-[var(--border)] p-6 flex flex-col gap-6 shadow-xl">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)]">
                {link.name}
              </a>
            ))}
            <a href="#book" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center mt-4">
              <span className="bg-slide"></span>
              <span className="text">Book a Bay</span>
            </a>
          </div>
        )}
      </nav>

      <main className="pt-[80px] md:pt-[100px]">
        {/* HERO SECTION */}
        <section ref={heroRef} className="max-w-[1280px] mx-auto px-6 py-[60px] md:py-[80px] min-h-[85vh] flex flex-col lg:flex-row items-center gap-[60px]">
          <div className="w-full lg:w-[55%] flex flex-col items-start gap-6">
            <div className="hero-subtitle subtitle text-[var(--text-muted)] tracking-wider">
              Premium Indoor Golf in Denver. Book Instantly.
            </div>
            <h1 className="hero-headline text-[42px] sm:text-[55px] lg:text-[70px] leading-[1.1] font-bold text-[var(--text-heading)]">
              Perfect Your Swing.<br/>Anytime.
            </h1>
            <p className="hero-subtext text-[17px] md:text-[20px] text-[var(--text-body)] leading-relaxed max-w-[540px]">
              A Denver-based indoor golf simulator born out of a passion for guys who want to have a good time, grab some drinks, and get better at golf.
            </p>
            <div className="hero-btns flex flex-wrap items-center gap-4 mt-4">
              <a href="#book" className="btn-primary uppercase tracking-wide text-sm py-4 px-8">
                <span className="bg-slide"></span>
                <span className="text">Book a Bay</span>
              </a>
              <a href="#pricing" className="btn-secondary">
                View Pricing
              </a>
            </div>
            <div className="hero-badge mt-6 flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-[99px] border border-[var(--border)] shadow-sm">
              <Star className="text-[var(--accent)]" size={16} fill="currentColor" />
              <span className="text-[14px] font-medium text-[var(--text-muted)]">4.9 · 128 Reviews</span>
            </div>
          </div>

          <div className="w-full lg:w-[45%] relative h-[500px] sm:h-[600px] mt-10 lg:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=1200&auto=format&fit=crop" 
              alt="Indoor Golf Simulator" 
              className="hero-main-img w-[85%] h-[80%] object-cover rounded-[20px] absolute top-0 right-0 shadow-2xl"
            />
            <img 
              src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=800&auto=format&fit=crop" 
              alt="Group having fun" 
              className="hero-overlap-card w-[60%] h-[40%] object-cover rounded-[16px] absolute bottom-0 left-0 border-[6px] border-[var(--background)] shadow-xl"
            />
            <div className="hero-badge bg-[var(--surface)] border border-[var(--border)] p-4 rounded-[12px] absolute top-10 -left-6 shadow-lg flex items-center gap-3">
              <div className="bg-[#E8F4EC] p-2 rounded-full hidden sm:block">🏌️‍♂️</div>
              <p className="font-semibold text-[14px] text-[var(--text-heading)]">Trackman Powered</p>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="bg-[var(--primary)] py-[40px] overflow-hidden -skew-y-2 my-10 relative">
          <div className="marquee-track flex whitespace-nowrap">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="marquee-text">
                TRACKMAN TECHNOLOGY &nbsp;&bull;&nbsp; COLD DRINKS &nbsp;&bull;&nbsp; GOOD TIMES &nbsp;&bull;&nbsp; 
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section ref={howItWorksRef} id="about" className="max-w-[1280px] mx-auto px-6 py-[80px]">
          <div className="text-center mb-16">
            <p className="subtitle text-[var(--text-muted)] mb-2">How it works</p>
            <h2 className="text-[38px] md:text-[48px] font-bold text-[var(--text-heading)]">Book your bay in 60 seconds</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Select a Time", desc: "Choose an open bay from our real-time availability calendar. We're open 7 days a week, 11 AM to 11 PM." },
              { num: "02", title: "Bring Your Crew", desc: "Up to 4 players per bay. Bring your own clubs or rent our premium sets on-site." },
              { num: "03", title: "Swing & Sip", desc: "Enjoy our Trackman simulators and grab a cold drink from the bar while you play Pebble Beach." }
            ].map((step, i) => (
              <div key={i} className="hiw-card bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[16px] hover-card">
                <div className="text-[48px] font-bold text-[var(--accent)] mb-4">{step.num}</div>
                <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-3">{step.title}</h5>
                <p className="text-[17px] text-[var(--text-body)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* OFFERINGS */}
        <section ref={offeringsRef} id="offerings" className="max-w-[1280px] mx-auto px-6 py-[80px]">
          <div className="text-center mb-16">
            <p className="subtitle text-[var(--text-muted)] mb-2">Our Offerings</p>
            <h2 className="text-[38px] md:text-[48px] font-bold text-[var(--text-heading)]">Premium Experiences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: "https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=800&auto=format&fit=crop", title: "Trackman Simulators", desc: "Play 100+ world-class courses with hyper-accurate shot tracking." },
              { img: "https://images.unsplash.com/photo-1535136125442-5f67a68e8073?q=80&w=800&auto=format&fit=crop", title: "PGA Instruction", desc: "Book 1-on-1 lessons with our certified pros to drop your handicap." },
              { img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop", title: "Corporate Events", desc: "Rent the full venue. Catering, drinks, and competitive fun." },
              { img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop", title: "League Play", desc: "Join our weekly leagues for prizes, beer specials, and bragging rights." }
            ].map((offering, i) => (
              <div key={i} className="offering-card bg-[var(--surface)] border border-[var(--border)] rounded-[16px] overflow-hidden hover-card group">
                <div className="h-[200px] overflow-hidden">
                  <img src={offering.img} alt={offering.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="subtitle text-[var(--accent)] mb-2">0{i+1}</div>
                  <h5 className="text-[22px] font-bold text-[var(--text-heading)] mb-2">{offering.title}</h5>
                  <p className="text-[16px] text-[var(--text-body)] mb-4">{offering.desc}</p>
                  <a href="#book" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                    Learn more <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section ref={statsRef} className="max-w-[1280px] mx-auto px-6 py-[60px]">
          <div className="bg-[var(--primary)] rounded-[24px] p-8 md:p-14 text-[var(--text-light)] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 shadow-xl">
            {[
              { num: 100, suffix: "+", label: "Virtual Courses", desc: "Play the world's best." },
              { num: 6, suffix: "", label: "Trackman Bays", desc: "Zero wait times." },
              { num: 15, suffix: "k", label: "Rounds Played", desc: "Denver's favorite spot." },
              { num: 4, suffix: ".9", label: "Star Rating", desc: "From 100+ golfers." }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[40px] md:text-[56px] font-bold text-[var(--accent)] mb-1 flex justify-center items-end">
                  <span className="stat-num">{Math.floor((stat.num / 3)*2)}</span>{/* Initial textContent for GSAP */}
                  <span className="text-[30px] mb-2">{stat.suffix}</span>
                </div>
                <div className="text-[20px] font-bold mb-1">{stat.label}</div>
                <div className="text-[14px] text-gray-400">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BOOKING WIDGET */}
        <section id="book" className="px-6 py-[80px] bg-[var(--background)]">
          <BookingWidget />
        </section>

        {/* PRICING */}
        <section ref={pricingRef} id="pricing" className="max-w-[1280px] mx-auto px-6 py-[80px]">
          <div className="text-center mb-16">
            <p className="subtitle text-[var(--text-muted)] mb-2">Pricing</p>
            <h2 className="text-[38px] md:text-[48px] font-bold text-[var(--text-heading)]">Choose your experience</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {/* Tier 1 */}
            <div className="pricing-card bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 md:p-10 hover-card">
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">League Night</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $35<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Competitive leagues", "Weekly prizes & drafts", " discounted drinks", "Guaranteed bay time"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--accent)] shrink-0 mt-1" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-secondary w-full">Join League</a>
            </div>

            {/* Tier 2 (Recommended) */}
            <div className="pricing-card bg-[var(--surface)] border-t-[6px] border-[var(--accent)] shadow-xl rounded-[20px] p-8 md:p-10 relative transform md:-translate-y-4 hover:translate-y-[-8px] transition-transform z-10">
              <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-[13px] font-bold px-4 py-1 rounded-[99px] uppercase tracking-wider">
                Most Popular
              </div>
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">Open Play</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $45<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["State-of-the-art Trackman", "Up to 4 players per bay", "Full bar service to bay", "Club rentals available", "Walk-ins welcome"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--accent)] shrink-0 mt-1" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-primary w-full shadow-lg">
                <span className="bg-slide"></span>
                <span className="text">Book a Bay</span>
              </a>
            </div>

            {/* Tier 3 */}
            <div className="pricing-card bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 md:p-10 hover-card">
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">Private Event</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $200<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Full venue buyout", "Up to 30 guests", "Dedicated bartender", "Custom tournament setup", "Catering options"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--accent)] shrink-0 mt-1" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-secondary w-full">Inquire Now</a>
            </div>
          </div>
        </section>

        {/* ACCORDION */}
        <section ref={accordionRef} className="max-w-[1000px] mx-auto px-6 py-[80px]">
          <div className="border-t border-[var(--border)]">
            {[
              { title: "Club Rentals & Equipment", desc: "Don't want to lug your clubs downtown? No problem. We offer premium left and right-handed sets from Titleist and Callaway for just $15 per session." },
              { title: "Monthly Memberships", desc: "Serious about improving? Our monthly membership includes unlimited off-peak simulator time, a free 1hr lesson a month, and 20% off drinks. Inquire at the front desk." },
              { title: "Corporate Events & Buyouts", desc: "Impress your clients or treat your team. We regularly host full venue buyouts with bespoke catering, dedicated staff, and customized tournament formats on the simulators." }
            ].map((item, idx) => (
              <div key={idx} className="accordion-item border-b border-[var(--border)] py-8 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors" onClick={() => toggleAccordion(idx)}>
                <div className="flex items-center gap-6">
                  <div className={`text-[36px] md:text-[42px] font-bold transition-colors ${activeAccordion === idx ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                    0{idx + 1}
                  </div>
                  <h4 className="text-[24px] md:text-[32px] font-bold flex-grow text-[var(--text-heading)]">{item.title}</h4>
                  <div className="text-[var(--text-muted)]">
                    {activeAccordion === idx ? <Minus size={28} /> : <Plus size={28} />}
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-400 ease-in-out ${activeAccordion === idx ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-[17px] text-[var(--text-body)] max-w-[700px] pl-[60px] md:pl-[85px] pb-4 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section ref={testimonialsRef} className="max-w-[1280px] mx-auto px-6 py-[80px]">
          <div className="text-center mb-16">
            <h2 className="text-[38px] md:text-[48px] font-bold text-[var(--text-heading)]">What Denver Golfers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Best indoor golf facility in Denver. The Trackman tech is insanely accurate, and the vibe is perfect for grabbing beers with the guys after work.", name: "Mike T.", title: "Local Golfer" },
              { text: "My swing has improved so much just from having reliable data on the simulators. High-quality mats, great screens, friendly staff.", name: "Sarah L.", title: "League Member" },
              { text: "We hosted our company retreat here and it was incredible. Half the team had never golfed, but everyone had a blast. Highly recommend buyouts.", name: "James D.", title: "Event Organizer" }
            ].map((t, i) => (
              <div key={i} className="testimonial-card bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[16px] hover-card">
                <div className="flex text-[var(--accent)] mb-4 gap-1">
                  {[1,2,3,4,5].map(star => <Star key={star} size={18} fill="currentColor" />)}
                </div>
                <p className="text-[17px] italic text-[var(--text-body)] mb-6 leading-relaxed">"{t.text}"</p>
                <div className="w-[40px] h-[2px] bg-[var(--accent)] mb-4"></div>
                <div>
                  <h6 className="font-bold text-[16px] text-[var(--text-heading)]">{t.name}</h6>
                  <p className="text-[14px] text-[var(--text-muted)]">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section ref={ctaRef} className="bg-[var(--accent)] py-[100px] px-6 text-center shadow-inner relative overflow-hidden">
          {/* Decorative faint background shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full border-[40px] border-white"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full border-[60px] border-white"></div>
          </div>
          
          <div className="max-w-[800px] mx-auto relative z-10">
            <h2 className="cta-el text-[42px] md:text-[60px] font-bold text-[#1A1A2E] mb-4">Ready to tee off?</h2>
            <p className="cta-el text-[20px] text-[#2D2D5E] font-medium mb-10 max-w-[600px] mx-auto">
              Our 6 Trackman bays book up fast during evenings and weekends. Reserve your spot online instantly.
            </p>
            <a href="#book" className="cta-el inline-block bg-[#1A1A2E] text-white font-bold py-4 px-10 rounded-[99px] text-[18px] hover:scale-105 hover:bg-black transition-all shadow-xl">
              Book Your Bay Now
            </a>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--primary)] text-white py-16 px-6 rounded-t-[3rem] mt-[-2rem] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-gray-700 pb-12">
          
          <div className="col-span-1 lg:col-span-1 border-r-0 lg:border-r border-gray-700 pr-0 lg:pr-8">
            <div className="text-[32px] font-bold text-white mb-4">
              SwingBay<span className="text-[var(--accent)]">.</span>
            </div>
            <p className="text-gray-400 text-[15px] mb-6 leading-relaxed">
              Denver's premier indoor golf simulator experience. Passion for groups who want to have a good time, have drinks, and get better at golf.
            </p>
            <div className="flex gap-4 text-[var(--accent)]">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              {/* Optional TikTok/Twitter usually go here */}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-4 text-[15px] text-gray-400 font-medium">
              <li><a href="#offerings" className="hover:text-[var(--accent)] transition-colors">Offerings</a></li>
              <li><a href="#pricing" className="hover:text-[var(--accent)] transition-colors">Pricing & Leagues</a></li>
              <li><a href="#book" className="hover:text-[var(--accent)] transition-colors">Book a Bay</a></li>
              <li><a href="#about" className="hover:text-[var(--accent)] transition-colors">Our Story</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Hours</h5>
            <ul className="space-y-4 text-[15px] text-gray-400">
              <li className="flex items-start gap-3">
                <Clock className="mt-1 text-[var(--accent)] shrink-0" size={18} />
                <div>
                  <span className="block text-white font-medium mb-1">Monday - Sunday</span>
                  <span>11:00 AM – 11:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Location</h5>
            <ul className="space-y-4 text-[15px] text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 text-[var(--accent)] shrink-0" size={18} />
                <span>1234 Swing Avenue<br/>Denver, CO 80202</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--accent)] shrink-0" size={18} />
                <span>(303) 555-0199</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--accent)] shrink-0" size={18} />
                <span>info@swingbaygolf.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between text-gray-500 text-[14px]">
          <p>&copy; 2025 SwingBay Golf. All rights reserved.</p>
          <p className="mt-2 md:mt-0 font-medium text-gray-400">Book online 24/7</p>
        </div>
      </footer>

    </div>
  );
};

export default App;
