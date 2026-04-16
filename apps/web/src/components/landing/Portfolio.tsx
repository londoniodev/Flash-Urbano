import { Package2, Truck, Warehouse } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './Portfolio.css';

export default function Portfolio() {
  const portfolios = [
    {
      icon: <Package2 size={36} className="text-accent" />,
      title: 'Última Milla',
      desc: 'Entregas urbanas hiper-rápidas con rastreo GPS en tiempo real.'
    },
    {
      icon: <Truck size={36} className="text-accent" />,
      title: 'Envíos Interciudades Express',
      desc: 'Consolidación y redespacho optimizado entre ciudades principales.'
    },
    {
      icon: <Warehouse size={36} className="text-accent" />,
      title: 'Logística E-commerce',
      desc: 'Bodegaje y picking inteligente distribuido en cada ciudad.'
    }
  ];

  return (
    <section className="landing-section bg-alt">
      <div className="section-content">
        <FadeIn direction="up" className="text-center">
          <h2 className="section-title outfit-font">
            Nuestro <span className="text-gradient">Portafolio</span>
          </h2>
          <p className="section-subtitle">
            Soluciones logísticas adaptadas a cada necesidad de tu negocio.
          </p>
        </FadeIn>

        <div className="portfolio-grid">
          {portfolios.map((item, i) => (
            <FadeIn key={i} delay={i * 150} direction="up" className="portfolio-card glass-panel">
              <div className="portfolio-icon-wrap">
                {item.icon}
              </div>
              <h3 className="portfolio-card-title outfit-font">{item.title}</h3>
              <p className="portfolio-card-desc">{item.desc}</p>
            </FadeIn>
          ))}
        </div>

        {/* Thunder visual element */}
        <FadeIn direction="up" delay={500}>
          <div className="thunder-box">
            <div className="thunder-glow"></div>
            <Package2 size={100} color="var(--accent)" strokeWidth={1} className="box-icon" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
