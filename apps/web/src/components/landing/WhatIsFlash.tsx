import { Zap } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './WhatIsFlash.css';

export default function WhatIsFlash() {
  const features = [
    {
      icon: <Zap size={28} className="text-accent"/>,
      number: '01',
      title: 'Red nacional de entregas ultra rápidas.',
      text: 'Cobertura especializada que garantiza tiempos antes impensables en logística urbana e intermunicipal.'
    },
    {
      icon: <Zap size={28} className="text-accent"/>,
      number: '02',
      title: 'Expertos en logística para e-commerce.',
      text: 'Soluciones a la medida de tu tienda en línea para llevar las compras a las manos de tus clientes de inmediato.'
    },
    {
      icon: <Zap size={28} className="text-accent"/>,
      number: '03',
      title: 'Modelo de inventario distribuido inteligente.',
      text: 'Acercamos tu inventario a la zona geográfica de demanda para reducir el tiempo de última milla.'
    }
  ];

  return (
    <section className="landing-section">
      <div className="section-content">
        <FadeIn direction="up" className="text-center">
          <h2 className="section-title outfit-font">
            ¿Qué es <span className="text-gradient">Flash Urbano?</span>
          </h2>
        </FadeIn>
        
        <div className="what-is-grid">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 200} direction="up" className="feature-card">
              <div className="bezel-orange-outer">
                <div className="bezel-orange-inner feature-card-inner">
                  <span className="feature-number outfit-font">{feature.number}</span>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title outfit-font">{feature.title}</h3>
                  <p className="feature-text">{feature.text}</p>
                  <div className="feature-line"></div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
