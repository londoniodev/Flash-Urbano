import { Zap } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Zap size={28} className="text-accent" />,
      title: "Solicitud y Recogida",
      description: "Generas la guía en la plataforma y recolectamos en menos de 45 minutos.",
      time: "< 45 min"
    },
    {
      icon: <Zap size={28} className="text-accent" />,
      title: "Clasificación y Ruta",
      description: "El paquete ingresa a nuestro Hub urbano cruzado y sale a ruta de inmediato.",
      time: "Inmediato"
    },
    {
      icon: <Zap size={28} className="text-accent" />,
      title: "Entrega Exitosa",
      description: "Tu cliente recibe en menos de 2 horas con notificación SMS y foto de prueba.",
      time: "< 2 hrs"
    }
  ];

  return (
    <section className="landing-section bg-alt">
      <div className="section-content text-center">
        <FadeIn direction="up">
          <h2 className="section-title outfit-font">
            ¿Cómo <span className="text-gradient">Funciona?</span>
          </h2>
          <p className="section-subtitle">
            Un proceso optimizado para romper los límites de velocidad.
          </p>
        </FadeIn>

        <div className="steps-row">
          {steps.map((step, index) => (
            <FadeIn key={index} direction="up" delay={index * 200}>
              <div className="step-item">
                <div className="step-header">
                  <div className="step-number-ring">
                    <span className="step-num outfit-font">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="step-arrow">
                      <div className="arrow-line"></div>
                      <div className="arrow-head"></div>
                    </div>
                  )}
                </div>
                <div className="step-body glass-panel">
                  <div className="step-icon-wrap">{step.icon}</div>
                  <h3 className="step-title outfit-font">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                  <div className="step-time-badge">
                    <span>{step.time}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
