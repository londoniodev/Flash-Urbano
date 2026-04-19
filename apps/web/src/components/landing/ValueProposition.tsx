import { Zap, Clock, PackageCheck, Camera } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './ValueProposition.css';

export default function ValueProposition() {
  const values = [
    {
      icon: <Zap size={24} className="text-accent" />,
      title: "Agilidad Competitiva",
      description: "Tus clientes reciben el mismo día. La velocidad se convierte en tu mayor argumento de cierre de ventas."
    },
    {
      icon: <Zap size={24} className="text-accent" />,
      title: "Promesa Cumplida",
      description: "Seguimiento en tiempo real y pruebas fotográficas. Construye confianza con entregas garantizadas al 100%."
    },
    {
      icon: <Zap size={24} className="text-accent" />,
      title: "Escalabilidad",
      description: "Ya sea 10 o 1000 envíos al día, nuestra malla logística responde a los picos de demanda sin fricción."
    }
  ];

  return (
    <section className="landing-section">
      <div className="section-content">
        <div className="value-prop-layout">
          {/* Left: Benefits list */}
          <div className="value-prop-left">
            <FadeIn direction="up">
              <h2 className="section-title outfit-font" style={{ textAlign: 'left' }}>
                El Valor para tu <span className="text-gradient">Negocio</span>
              </h2>
              <p className="value-prop-subtitle">
                No solo entregamos paquetes, potenciamos el crecimiento de tu marca en las principales ciudades.
              </p>
            </FadeIn>

            <div className="value-list">
              {values.map((v, i) => (
                <FadeIn key={i} delay={i * 150} direction="left">
                  <div className="value-item">
                    <div className="value-item-icon">{v.icon}</div>
                    <div className="value-item-content">
                      <h3 className="value-item-title outfit-font">{v.title}</h3>
                      <p className="value-item-desc">{v.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right: Animated delivery card */}
          <FadeIn direction="right" delay={300} className="value-prop-right">
            <div className="delivery-card glass-panel">
              <div className="delivery-card-header">
                <span className="delivery-status-dot"></span>
                <span>Entrega en curso</span>
              </div>
              
              <div className="delivery-timeline">
                <div className="timeline-step completed">
                  <div className="timeline-dot"></div>
                  <div className="timeline-info">
                    <Clock size={14} />
                    <span>Recogido — 10:03 AM</span>
                  </div>
                </div>
                <div className="timeline-line active"></div>
                <div className="timeline-step completed">
                  <div className="timeline-dot"></div>
                  <div className="timeline-info">
                    <PackageCheck size={14} />
                    <span>En Hub — 10:18 AM</span>
                  </div>
                </div>
                <div className="timeline-line active"></div>
                <div className="timeline-step current">
                  <div className="timeline-dot pulse"></div>
                  <div className="timeline-info">
                    <Camera size={14} />
                    <span className="text-accent">En ruta — 10:32 AM</span>
                  </div>
                </div>
                <div className="timeline-line"></div>
                <div className="timeline-step">
                  <div className="timeline-dot"></div>
                  <div className="timeline-info">
                    <Zap size={14} />
                    <span>Entregado — ??</span>
                  </div>
                </div>
              </div>

              <div className="delivery-card-eta">
                <span className="eta-label">Tiempo estimado</span>
                <span className="eta-value outfit-font">1h 47min</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
