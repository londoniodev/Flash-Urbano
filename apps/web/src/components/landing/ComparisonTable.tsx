import { CheckCircle2, XCircle } from 'lucide-react';
import { FadeIn } from './FadeIn';
import './ComparisonTable.css';

export default function ComparisonTable() {
  return (
    <section className="landing-section">
      <div className="section-content">
        
        <FadeIn direction="up" className="comparison-header">
          <div className="comp-title-flash outfit-font">¿Por qué Flash Urbano?</div>
          <div>
            <span className="vs-badge">NO SOMOS UNA TRANSPORTADORA TRADICIONAL</span>
          </div>
        </FadeIn>

        <div className="comparison-wrapper">
          {/* Traditional Column */}
          <FadeIn direction="right" delay={100} className="comp-column traditional">
            <h3 className="comp-col-header outfit-font">Transportadora Tradicional</h3>
            
            <div className="comp-cell">
              <XCircle size={24} className="comp-icon" /> 
              <span>Tiempos de entrega entre 48 a 72 horas.</span>
            </div>
            <div className="comp-cell">
              <XCircle size={24} className="comp-icon" /> 
              <span>Envíos interciudades lentos y con altos tiempos de procesamiento en bodegas centrales.</span>
            </div>
            <div className="comp-cell">
              <XCircle size={24} className="comp-icon" /> 
              <span>Costos fijos altos por paquete (aprox. $25.000 COP) sin importar el volumen local.</span>
            </div>
            <div className="comp-cell">
              <XCircle size={24} className="comp-icon" /> 
              <span>Un solo punto de origen, dificultando la logística de última milla local.</span>
            </div>
          </FadeIn>

          {/* Flash Urbano Column */}
          <FadeIn direction="left" delay={200} className="comp-column flash">
            <h3 className="comp-col-header outfit-font">Flash Urbano</h3>
            
            <div className="comp-cell">
              <CheckCircle2 size={24} className="comp-icon" /> 
              <span>Entregas ultra rápidas en <strong>menos de 2 horas</strong> garantizadas.</span>
            </div>
            <div className="comp-cell">
              <CheckCircle2 size={24} className="comp-icon" /> 
              <span>Inventario distribuido y optimizado localmente para respuestas inmediatas.</span>
            </div>
            <div className="comp-cell">
              <CheckCircle2 size={24} className="comp-icon" /> 
              <span>Optimización de costos drástica por volumen (aprox. <strong>$18.300 COP</strong>).</span>
            </div>
            <div className="comp-cell">
              <CheckCircle2 size={24} className="comp-icon" /> 
              <span>Malla logística hiper-local con flexibilidad operativa total y red de aliados.</span>
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
