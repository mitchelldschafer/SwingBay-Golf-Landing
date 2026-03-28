import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Star, Plus, Minus, Menu, X, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import BookingWidget from './components/BookingWidget';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(2); // "Course maintenance" active by default like screenshot
  
  const container = useRef();

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Helper to safely trigger sections
    const setupSectionAnimation = (selector, delay = 0) => {
      const elements = gsap.utils.toArray(selector);
      elements.forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: delay
        });
      });
    };

    // Hero timeline
    const tlHero = gsap.timeline({ defaults: { ease: "power2.out" } });
    tlHero.from(".hero-el", { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 })
          .from(".hero-img-el", { scale: 0.95, opacity: 0, duration: 0.8 }, "-=0.4")
          .from(".hero-badge-el", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.3");

    // General section setup
    setupSectionAnimation(".fade-up-el");
    setupSectionAnimation(".fade-up-card-el", 0.1);

    // Stats Count-up
    gsap.utils.toArray(".stat-num").forEach((stat) => {
      gsap.from(stat, {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%"
        },
        textContent: 0,
        duration: 2,
        ease: "power1.inOut",
        snap: { textContent: 1 }
      });
    });

  }, { scope: container });

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
    <div ref={container} className="min-h-screen relative font-sans overflow-x-hidden bg-[var(--background)]">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <div className="text-[24px] font-bold text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--accent)] rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            </div>
            SwingBay<span className="text-[var(--accent)]">.</span>
          </div>
          
          <div className="hidden md:flex gap-8 items-center flex-1 justify-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[15px] font-semibold text-[var(--text-heading)] hover:text-[var(--primary-light)] transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="#book" className="btn-primary text-[14px] px-6 py-2.5">
              <span className="bg-slide"></span>
              <span className="text text-[var(--text-heading)]">Book a Bay</span>
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
              <span className="text text-[var(--text-heading)]">Book a Bay</span>
            </a>
          </div>
        )}
      </nav>

      <main className="pt-[80px]">
        {/* HERO SECTION - Split Layout matching screenshot */}
        <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row">
          {/* Left Text Side */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 lg:pl-[8vw] lg:pr-10 py-16 lg:py-0 z-10 relative bg-[var(--background)]">
            <div className="hero-el inline-block bg-[#E8E8E8] text-[var(--text-heading)] px-4 py-1.5 rounded-[99px] text-[13px] font-bold uppercase tracking-wide mb-6">
              Premium Indoor Golf
            </div>
            <h1 className="hero-el text-[50px] md:text-[65px] lg:text-[75px] leading-[1.05] font-bold text-[var(--text-heading)] mb-6">
              Perfect Your Swing.<br/>Anytime.
            </h1>
            <p className="hero-el text-[17px] md:text-[19px] text-[var(--text-body)] leading-relaxed max-w-[480px] mb-10">
              A Denver-based indoor golf simulator born out of a passion for guys who want to have a good time, grab some drinks, and get better at golf.
            </p>
            <div className="hero-el flex flex-wrap items-center gap-4">
              <a href="#book" className="btn-primary uppercase tracking-wide text-[14px] px-8 py-3.5">
                <span className="bg-slide"></span>
                <span className="text text-[var(--text-heading)]">Book a Bay</span>
              </a>
            </div>
          </div>

          {/* Right Image Side */}
          <div className="w-full lg:w-[55%] relative min-h-[500px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=1600&auto=format&fit=crop" 
              alt="Golfer swinging" 
              className="hero-img-el absolute inset-0 w-full h-full object-cover rounded-tl-none lg:rounded-bl-[80px]"
            />
            {/* Overlay Gradient for readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:rounded-bl-[80px]"></div>
            
            {/* Floating Overlap Cards */}
            <div className="hero-badge-el absolute bottom-10 left-[-40px] lg:left-[-100px] bg-[var(--surface)] p-3 rounded-[16px] shadow-2xl flex items-center gap-4 w-[280px]">
              <img src="https://images.unsplash.com/photo-1535136125442-5f67a68e8073?q=80&w=200&auto=format&fit=crop" className="w-16 h-16 rounded-[10px] object-cover" alt="Golf instructor" />
              <div>
                <div className="bg-[var(--accent)] text-[var(--text-heading)] text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm inline-block mb-1">New</div>
                <h6 className="text-[13px] font-bold text-[var(--text-heading)] leading-tight">Learn & master any type of shot</h6>
              </div>
            </div>

            <div className="hero-badge-el absolute top-20 right-10 bg-white/10 backdrop-blur-md p-4 rounded-[12px] border border-white/20">
              <p className="text-[var(--accent)] text-[24px] font-bold leading-none">6</p>
              <p className="text-white text-[12px] font-semibold tracking-wider uppercase mt-1">Trackman<br/>Bays</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (Replicating screenshot) */}
        <section id="about" className="max-w-[1280px] mx-auto px-6 py-[100px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 fade-up-el">
            <div className="max-w-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                <p className="subtitle text-[var(--text-heading)] mb-0">How it works</p>
              </div>
              <h2 className="text-[40px] md:text-[50px] font-bold text-[var(--text-heading)] leading-[1.1]">Learn how golf club membership works</h2>
            </div>
            <p className="text-[17px] text-[var(--text-body)] max-w-[400px] mt-6 md:mt-0">
              Select your bay, grab your favorite drink, and practice on the absolute best simulators available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left Card */}
            <div className="fade-up-card-el bg-white p-6 rounded-[24px] shadow-sm border border-[var(--border)]">
              <div className="h-[180px] rounded-[16px] overflow-hidden mb-5">
                <img src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Course lists"/>
              </div>
              <h5 className="text-[18px] font-bold text-[var(--text-heading)] leading-tight mb-2">Get custom course lists</h5>
              <p className="text-[14px] text-[var(--text-muted)] mb-5">Play Pebble Beach, St Andrews, and 100+ more worldwide globally recognized courses.</p>
              <a href="#book" className="btn-primary text-[13px] px-5 py-2">
                <span className="bg-slide"></span>
                <span className="text text-[var(--text-heading)]">View all courses</span>
              </a>
            </div>

            {/* Center Stats */}
            <div className="fade-up-card-el flex flex-col items-center justify-center text-center">
              <h3 className="text-[70px] font-bold text-[var(--text-heading)] leading-none mb-2">4.9<span className="text-[var(--accent)] text-[50px]">★</span></h3>
              <p className="text-[16px] font-bold text-[var(--text-heading)] mb-2">Out of 5 ratings</p>
              <p className="text-[14px] text-[var(--text-muted)] max-w-[200px] mb-6">Highest rated indoor simulator facility in downtown Denver.</p>
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-[var(--background)] relative z-[1]" alt="User"/>
                ))}
              </div>
            </div>

            {/* Right Card Image Only */}
            <div className="fade-up-card-el h-[350px] rounded-[24px] overflow-hidden shadow-sm">
              <img src="https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Golfer"/>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="bg-[var(--primary)] py-[40px] overflow-hidden rotate-[-2deg] scale-105 shadow-xl relative z-10">
          <div className="marquee-track flex whitespace-nowrap">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="marquee-text" style={{ WebkitTextStroke: "2px var(--accent)", color: "transparent" }}>
                TRACKMAN TECHNOLOGY &nbsp;&bull;&nbsp; COLD DRINKS &nbsp;&bull;&nbsp; GOOD TIMES &nbsp;&bull;&nbsp; 
              </div>
            ))}
          </div>
        </section>

        {/* OFFERINGS (Join our golf club layout) */}
        <section id="offerings" className="max-w-[1280px] mx-auto px-6 py-[100px]">
          <div className="flex justify-between items-end border-b border-[var(--border)] pb-6 mb-12 fade-up-el">
            <h2 className="text-[38px] md:text-[46px] font-bold text-[var(--text-heading)]">Join our golf club</h2>
            <a href="#pricing" className="hidden md:inline-flex text-[15px] font-bold text-[var(--primary)] hover:text-[var(--accent-hover)] transition-colors items-center gap-2">
              View All <ArrowRight size={16}/>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Champion's golf events", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600&auto=format&fit=crop" },
              { title: "Equipment & course rentals", img: "https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=600&auto=format&fit=crop" },
              { title: "PGA pro lessons on greens", img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=600&auto=format&fit=crop" }
            ].map((offering, i) => (
              <div key={i} className="fade-up-card-el group cursor-pointer bg-white rounded-[24px] overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[14px] font-bold text-[var(--accent-hover)]">0{i+1}</span>
                    <ArrowRight className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors group-hover:translate-x-1 duration-300" />
                  </div>
                  <h5 className="text-[20px] font-bold text-[var(--text-heading)] mb-6 pr-8 h-[50px]">{offering.title}</h5>
                </div>
                <div className="h-[220px] bg-[var(--background)] mx-4 mb-4 rounded-[16px] overflow-hidden flex justify-center items-end relative">
                  <img src={offering.img} alt={offering.title} className="w-[90%] h-[90%] object-cover object-top rounded-t-[16px] group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FULL WIDTH STATS BACKGROUND */}
        <section className="stats-section relative w-full min-h-[500px] flex items-center shadow-2xl z-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1535136125442-5f67a68e8073?q=80&w=2600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Golf background" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)] via-[rgba(9,34,16,0.85)] to-[rgba(9,34,16,0.5)]"></div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 relative z-10 w-full pt-16 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white mb-20 fade-up-el">
              {[
                { num: 50, suffix: "+", label: "Virtual courses", desc: "Available worldwide." },
                { num: 95, suffix: "%", label: "Customer satisfaction", desc: "Top rated facility." },
                { num: 25, suffix: "k", label: "Rounds played", desc: "Local Denver golfers." }
              ].map((stat, i) => (
                <div key={i} className="border-l-2 border-[var(--accent)] pl-6">
                  <div className="text-[65px] font-bold text-[var(--accent)] leading-none mb-2 flex items-start">
                    <span className="stat-num">{stat.num}</span><span className="text-[40px] mt-2 ml-1">{stat.suffix}</span>
                  </div>
                  <div className="text-[20px] font-bold mb-1">{stat.label}</div>
                  <div className="text-[14px] text-gray-400">{stat.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-16 max-w-[600px] fade-up-el">
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full inline-block text-[13px] font-bold uppercase tracking-wider h-fit mt-3">
                Overview
              </div>
              <h2 className="text-[36px] md:text-[48px] font-bold text-white leading-tight">
                Discover our premium golf services
              </h2>
            </div>
          </div>
        </section>

        {/* ACCORDION - Dark Green Section */}
        <section className="bg-[var(--primary)] text-white relative -mt-10 pt-20 pb-24 z-10">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col lg:flex-row gap-16 fade-up-el">
            {/* Left side App Accordion */}
            <div className="w-full lg:w-[50%]">
              {[
                { title: "Membership plans", desc: "Unlimited off-peak hours and discounts on drinks.", img: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=400" },
                { title: "Equipment rental", desc: "Need clubs? We have right and left-handed premium sets.", img: "https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=400" },
                { title: "Course maintenance", desc: "We maintain the absolute highest standards on our simulator pads and screens.", img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400" }
              ].map((item, idx) => (
                <div key={idx} className="border-b border-white/20 py-8 cursor-pointer group" onClick={() => toggleAccordion(idx)}>
                  <div className="flex items-center gap-6">
                    <div className="text-white/40 group-hover:text-white transition-colors">
                      {activeAccordion === idx ? <Star className="text-[var(--accent)]" size={24} fill="currentColor"/> : <Plus size={24} />}
                    </div>
                    <h4 className={`text-[28px] md:text-[36px] font-bold flex-grow transition-colors ${activeAccordion === idx ? 'text-[var(--accent)]' : 'text-white'}`}>
                      {item.title}
                    </h4>
                  </div>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === idx ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[17px] text-white/70 pl-[48px] pb-4">
                      {item.desc}
                    </p>
                    <button className="ml-[48px] bg-white text-[var(--primary)] text-[14px] font-bold py-2 px-6 rounded-full hover:bg-[var(--accent)] transition-colors mt-2">
                       Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side Image (Circle cutout style) */}
            <div className="w-full lg:w-[50%] flex justify-end items-center relative hidden md:flex">
              {activeAccordion !== null && (
                <div className="w-[400px] h-[400px] rounded-full overflow-hidden border-[12px] border-[rgba(255,255,255,0.05)] shadow-2xl relative animate-fade-in">
                  <img 
                    src={[
                      "https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600",
                      "https://images.unsplash.com/photo-1593111774240-d529f12eb4d6?q=80&w=600",
                      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=600"
                    ][activeAccordion]} 
                    alt="Section visual" 
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOOKING WIDGET */}
        <section id="book" className="px-6 py-[100px] bg-[var(--background)]">
          <BookingWidget />
        </section>

        {/* PRICING (From previous build, adjusted for Rethink colorings) */}
        <section id="pricing" className="max-w-[1280px] mx-auto px-6 py-[80px]">
          <div className="text-center mb-16 fade-up-el">
            <h2 className="text-[38px] md:text-[48px] font-bold text-[var(--text-heading)]">Choose your experience</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto fade-up-el">
            {/* Tier 1 */}
            <div className="pricing-card bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-8 md:p-10 hover-card">
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">League Night</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $35<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Competitive leagues", "Weekly prizes & drafts", " discounted drinks", "Guaranteed bay time"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--primary-light)] shrink-0 mt-1" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-secondary w-full">Join League</a>
            </div>

            {/* Tier 2 (Recommended) */}
            <div className="pricing-card bg-[var(--surface)] border-t-[8px] border-[var(--primary)] shadow-2xl rounded-[24px] p-8 md:p-10 relative transform md:-translate-y-4 hover:translate-y-[-8px] transition-transform z-10">
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--text-heading)] text-[13px] font-bold px-5 py-1.5 rounded-[99px] uppercase tracking-wider">
                Most Popular
              </div>
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">Open Play</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $45<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["State-of-the-art Trackman", "Up to 4 players per bay", "Full bar service to bay", "Club rentals available", "Walk-ins welcome"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--primary)] shrink-0 mt-1" size={18} />
                    <span className="font-medium text-[var(--text-heading)]">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-primary w-full shadow-lg h-[50px]">
                <span className="bg-slide"></span>
                <span className="text text-[var(--text-heading)] font-bold">Book a Bay</span>
              </a>
            </div>

            {/* Tier 3 */}
            <div className="pricing-card bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-8 md:p-10 hover-card">
              <h5 className="text-[24px] font-bold text-[var(--text-heading)] mb-2">Private Event</h5>
              <div className="text-[48px] font-bold text-[var(--text-heading)] mb-6">
                $200<span className="text-[16px] text-[var(--text-muted)] font-normal">/hr</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Full venue buyout", "Up to 30 guests", "Dedicated bartender", "Custom tournament setup", "Catering options"].map((f,i) => (
                  <li key={i} className="flex gap-3 text-[16px]">
                    <Check className="text-[var(--primary-light)] shrink-0 mt-1" size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="btn-secondary w-full">Inquire Now</a>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--primary)] text-white py-16 px-6 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12 fade-up-el">
          
          <div className="col-span-1 lg:col-span-1 border-r-0 lg:border-r border-white/10 pr-0 lg:pr-8">
            <div className="text-[32px] font-bold text-white mb-4">
              SwingBay<span className="text-[var(--accent)]">.</span>
            </div>
            <p className="text-white/60 text-[15px] mb-6 leading-relaxed">
              Denver's premier indoor golf simulator experience.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-4 text-[15px] text-white/60 font-medium">
              <li><a href="#offerings" className="hover:text-[var(--accent)] transition-colors">Offerings</a></li>
              <li><a href="#pricing" className="hover:text-[var(--accent)] transition-colors">Pricing</a></li>
              <li><a href="#book" className="hover:text-[var(--accent)] transition-colors">Book a Bay</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Hours</h5>
            <ul className="space-y-4 text-[15px] text-white/60">
              <li className="flex items-start gap-3">
                <Clock className="mt-1 text-[var(--accent)] shrink-0" size={18} />
                <div>
                  <span className="block text-white font-medium mb-1">Mon - Sun</span>
                  <span>11:00 AM – 11:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Location</h5>
            <ul className="space-y-4 text-[15px] text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 text-[var(--accent)] shrink-0" size={18} />
                <span>1234 Swing Avenue<br/>Denver, CO 80202</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--accent)] shrink-0" size={18} />
                <span>(303) 555-0199</span>
              </li>
            </ul>
          </div>

        </div>
        <div className="max-w-[1280px] mx-auto text-white/40 text-[14px] text-center">
          &copy; 2025 SwingBay Golf. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default App;
