import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, Sparkles, MessageSquare, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/intake', label: 'Identify Waste', icon: Sparkles },
    { to: '/ask', label: 'Ask WasteWise', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AI WasteWise</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 tracking-wider">
                  SDG 12
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">IBM SkillsBuild & AICTE</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Admin link */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              Admin Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
