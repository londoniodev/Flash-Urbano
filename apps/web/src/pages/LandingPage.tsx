import { Link } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import ValueProposition from '../components/landing/ValueProposition';
import WhatIsFlash from '../components/landing/WhatIsFlash';
import HowItWorks from '../components/landing/HowItWorks';
import ComparisonTable from '../components/landing/ComparisonTable';
import Portfolio from '../components/landing/Portfolio';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-layout relative">
      {/* FONDO ANIMADO Y PATRON DRY */}
      <div className="fixed inset-0 z-[0] bg-grid-pattern opacity-30 mix-blend-overlay pointer-events-none"></div>
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="blob-shape blob-1"></div>
        <div className="blob-shape blob-2"></div>
      </div>

      {/* HEADER NAV FLOTANTE */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo.avif" alt="Flash Urbano" className="nav-logo-img" style={{ height: '32px', borderRadius: '4px' }} />
            <span>Flash Urbano</span>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn-portal">
              Portal B2B
            </Link>
          </div>
        </div>
      </nav>

      {/* SECCIONES */}
      <main>
        <HeroSection />
        <WhatIsFlash />
        <ValueProposition />
        <ComparisonTable />
        <HowItWorks />
        <Portfolio />
      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-col">
            <img src="/logo.avif" alt="Flash Urbano" className="footer-logo" />
            <h3 className="footer-title">Flash Urbano</h3>
            <p className="footer-text">Entregas en 2 horas o menos.</p>
            <p className="footer-text">Revolucionando la logística en Colombia.</p>
          </div>
          <div className="footer-col">
            <h3 className="footer-title">Contacto</h3>
            <p className="footer-text">Celular: 3187828932</p>
            <p className="footer-text">Soporte B2B y E-Commerce</p>
          </div>
          <div className="footer-col">
            <h3 className="footer-title">Cobertura</h3>
            <p className="footer-text">Cobertura en crecimiento.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
