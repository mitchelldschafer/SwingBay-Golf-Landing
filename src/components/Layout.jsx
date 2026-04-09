import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: "Offerings", href: isHome ? "#offerings" : "/#offerings" },
    { name: "Membership", href: "/pricing" },
    { name: "Book", href: "/book" },
    { name: "Blog", href: "/blog" }
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-[var(--background)]">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <Link to="/" className="text-[20px] md:text-[24px] font-bold text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <img src="/images/logo.png" alt="Mile High Fairway" className="h-12 w-12 rounded-full object-cover border-2 border-[var(--accent)]" />
            <span className="hidden sm:inline-block">Mile High Fairway</span>
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

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/account"
                  className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-heading)] hover:text-[var(--accent)] transition-colors"
                >
                  <User size={17} />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={logout}
                  className="text-[var(--text-body)] hover:text-[var(--accent)] transition-colors"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[14px] font-semibold text-[var(--text-heading)] hover:text-[var(--accent)] transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary text-[14px] px-5 py-2">
                  <span className="bg-slide"></span>
                  <span className="text text-[var(--text-heading)]">Sign Up</span>
                </Link>
              </>
            )}
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

            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)] flex items-center gap-2">
                  <User size={20} /> My Account
                </Link>
                <button onClick={handleLogout} className="text-[20px] font-semibold text-left text-[var(--text-body)] flex items-center gap-2">
                  <LogOut size={20} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)]">
                  Log In
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-[20px] font-semibold text-[var(--text-heading)]">
                  Sign Up
                </Link>
              </>
            )}

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
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Mile High Fairway" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-[var(--accent)]" />
              <div className="text-[24px] sm:text-[28px] font-bold text-white leading-tight">
                Mile High<br/><span className="text-[18px] sm:text-[20px] text-[var(--accent)]">Fairway</span>
              </div>
            </div>
            <p className="text-white/60 text-[15px] mb-6 leading-relaxed">
              Denver's premier indoor golf simulator experience.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[18px] mb-6 text-white uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-4 text-[15px] text-white/60 font-medium">
              <li><Link to="/#offerings" className="hover:text-[var(--accent)] transition-colors">Offerings</Link></li>
              <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">Membership</Link></li>
              <li><Link to="/book" className="hover:text-[var(--accent)] transition-colors">Book a Bay</Link></li>
              <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">Blog</Link></li>
              {user && (
                <li><Link to="/account" className="hover:text-[var(--accent)] transition-colors">My Account</Link></li>
              )}
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
          &copy; 2025 Mile High Fairway Colorado. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default Layout;
