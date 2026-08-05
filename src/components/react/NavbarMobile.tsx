import { useState, useEffect } from 'react';
import { es } from '../../i18n/dictionaries/es';
import { en } from '../../i18n/dictionaries/en';
import type { Lang } from '../../i18n/config';

interface NavLink {
  name: string;
  href: string;
}

interface NavbarMobileProps {
  navLinks: NavLink[];
  currentPath: string;
  lang?: Lang;
}

export default function NavbarMobile({ navLinks, currentPath, lang = 'es' }: NavbarMobileProps) {
  const dict = lang === 'en' ? en : es;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'Facebook', href: 'https://facebook.com' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative w-10 h-10 flex items-center justify-center text-deepest hover:bg-mid/10 rounded-lg transition-colors"
        aria-label={isOpen ? dict.nav.closeMenu : dict.nav.openMenu}
        aria-expanded={isOpen}
        type="button"
      >
        <div className="w-6 flex flex-col items-center justify-center gap-1.5">
          <span
            className={`w-full h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`w-full h-0.5 bg-current transition-all duration-200 ${
              isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          <span
            className={`w-full h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu */}
      {mounted && (
        <div
          className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.menuLabel}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-400 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={`relative h-full bg-gradient-to-b from-deepest via-dark to-deepest text-light transition-all duration-500 ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-light/10">
              <a href="/" onClick={closeMenu} className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dxrzwnjee/image/upload/v1771884590/uvefdfzsi4qau4np6gx5.avif"
                  alt="Roca Business Logo"
                  className="h-12 w-auto"
                />
              </a>

              <button
                onClick={closeMenu}
                className="p-2 rounded-lg text-light hover:bg-light/10 transition-colors"
                aria-label={dict.nav.closeMenu}
                type="button"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-5rem)] flex flex-col justify-between px-8 py-10">
              {/* Navigation Links */}
              <div className="flex-1 flex items-center justify-center">
                <nav className="w-full max-w-xs space-y-6 text-center">
                  {navLinks.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`block font-heading text-4xl leading-tight transition-all duration-300 menu-link ${
                        isOpen
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4 pointer-events-none'
                      } ${
                        isActive(link.href) ? 'text-white' : 'text-light/80 hover:text-white'
                      }`}
                      style={{
                        transitionDelay: isOpen ? `${0.2 + index * 0.1}s` : '0s',
                      }}
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div
                className={`space-y-5 pb-4 transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{
                  transitionDelay: isOpen ? '0.6s' : '0s',
                }}
              >
                <a
                  href="/solicitudes"
                  onClick={closeMenu}
                  className="block w-full px-4 py-3 bg-primary text-white text-center font-heading rounded-lg transition-all duration-300 hover:bg-light hover:text-deepest"
                >
                  {dict.nav.cta}
                </a>

                <div className="flex items-center justify-center gap-2 font-heading text-sm" role="group" aria-label="Language / Idioma">
                  <a
                    href="?lang=es"
                    className={`px-1 transition-colors ${lang === 'es' ? 'font-bold text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    ES
                  </a>
                  <span className="text-white/30" aria-hidden="true">|</span>
                  <a
                    href="?lang=en"
                    className={`px-1 transition-colors ${lang === 'en' ? 'font-bold text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    EN
                  </a>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.name}
                      className="h-10 w-10 rounded-full border border-light/25 text-light/85 flex items-center justify-center hover:text-white hover:border-light/60 hover:bg-light/10 transition-all duration-300"
                    >
                      {social.name === 'Instagram' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" strokeWidth="2"></rect>
                          <path d="M16 11.37a4 4 0 11-7.9 1.18 4 4 0 017.9-1.18z" strokeWidth="2"></path>
                          <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeWidth="2" strokeLinecap="round"></line>
                        </svg>
                      )}
                      {social.name === 'Facebook' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z"></path>
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .menu-link {
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.22, 0.03, 0.26, 1);
          transition-duration: 0.5s;
        }
      `}</style>
    </>
  );
}
