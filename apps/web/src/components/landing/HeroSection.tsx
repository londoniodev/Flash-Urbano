import { ArrowRight } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './HeroSection.css';

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function HeroSection() {
  return (
    <section className="hero-section">
      {/* Background effects */}
      <div className="hero-ambient-glow"></div>
      <div className="hero-grid-pattern"></div>
      
      <div className="hero-content">
        {/* Left column: Text */}
        <div className="hero-text-column">
          <FadeIn delay={100} direction="up">
            <div className="hero-badge glass-panel">
              <span className="badge-dot"></span> RED NACIONAL LOGÍSTICA
            </div>
          </FadeIn>
          
          <FadeIn delay={250} direction="up">
            <h1 className="hero-title outfit-font">
              ENTREGAS EN <br/>
              <span className="text-gradient">MENOS DE 2 HORAS</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={400} direction="up">
            <p className="hero-description">
              En <strong>FLASH URBANO</strong> revolucionamos la logística en Colombia. 
              Nuestra red de aliados permite entregas ultra rápidas entre ciudades 
              con una agilidad que redefine el e-commerce.
            </p>
          </FadeIn>

          <FadeIn delay={550} direction="up">
            <div className="hero-actions">
              <a href="#contacto" className="btn-primary hero-btn">
                ¡Cotiza ahora y acelera tus entregas!
                <ArrowRight size={20} />
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Right column: Character */}
        <FadeIn delay={300} direction="right" className="hero-character-column">
          <div className="hero-character-wrapper">
            <div className="character-glow"></div>
            <div className="character-ring"></div>
            <img 
              src="/hero-character.png" 
              alt="Flash Urbano - Héroe de las entregas rápidas" 
              className="hero-character-img"
            />
          </div>
        </FadeIn>
      </div>

      {/* WhatsApp locations bar - inside hero */}
      <FadeIn delay={700} direction="up" className="hero-locations-wrap">
        <div className="hero-locations glass-panel" id="contacto">
          <a href="https://wa.me/573187828932" target="_blank" rel="noreferrer" className="location-pill" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
            <WhatsAppIcon size={20} />
            <span>CONTACTO <strong className="font-mono">3187828932</strong></span>
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
