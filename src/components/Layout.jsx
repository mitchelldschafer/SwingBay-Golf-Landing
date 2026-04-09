import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Clock } from 'lucide-react';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: "Offerings", href: isHome ? "#offerings" : "/#offerings" },
    { name: "Pricing", href: isHome ? "#pricing" : "/#pricing" },
    { name: "Book", href: "/book" },
    { name: "Blog", href: "/blog" }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-[var(--background)]">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/" className="text-[24px] font-bold text-[var(--text-heading)] tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--accent)] rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            </div>
            SwingBay<span className="text-[var(--accent)]">.</span>
          </Link>
          
          <div className="hidden md:flex gap-8 items-center flex-1 justify-center">
            {navLinks.map((link) => (
              link.href.startsWith('#') || link.href.startsWith('/#') ? (
                <a key={link.name} href={link.href} className="text-[15px] font-semibold text-[var(--text-heading)] hover:text-[var(--primary-light)] transition-colors">
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} to={link.href} className="text-[15px] font-semibold text-[var(--text-heading)] hover:text-[var(--primary-light)] transition-colors">
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/book" className="btn-primary text-[14px] px-6 py-2.5">
              <span className="bg-slide"></span>
              <span className="text text-[var(--text-heading)]">Book a Bay</span>
            </Link>
          </div>

          <button className="md:hidden text-[var(--text-heading)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[80px] left-0 w-full bg-[var(--background)] border-b border-[var(--border)] p-6 flex flex-col gap-6 shadow-xl">
            {navLinks.map((link) => (
              link.href.startsWith('#') || link.href.startsWith('/#') ? (
                <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)]">
                  {link.name}
                </a>
              ) : (
                <Link key={link.name} to={link.href} onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)]">
                  {link.name}
                </Link>
              )
            ))}
            <Link to="/book" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center mt-4">
              <span className="bg-slide"></span>
              <span className="text text-[var(--text-heading)]">Book a Bay</span>
            </Link>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-[80px]">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--primary)] text-white py-16 px-6 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] mt-auto">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          
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
              <li><Link to="/#offerings" className="hover:text-[var(--accent)] transition-colors">Offerings</Link></li>
              <li><Link to="/#pricing" className="hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
              <li><Link to="/book" className="hover:text-[var(--accent)] transition-colors">Book a Bay</Link></li>
              <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">Blog</Link></li>
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

export default Layout;
