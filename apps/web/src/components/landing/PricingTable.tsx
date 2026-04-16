import { FadeIn } from './FadeIn';
import { Sparkles } from 'lucide-react';
import './PricingTable.css';

export default function PricingTable() {
  const PricingData = [
    { storage: '$0', p0_5: '$14.000', p5_10: '$18.000', recaudo: '$100.000', efectivo: '0*', reposicion: '$30.000', tarifa_redespacho: '$4.000', highlight: true },
    { storage: '$100.000', p0_5: '$12.000', p5_10: '$16.000', recaudo: '$100 a $200', efectivo: '3,00%', reposicion: '', tarifa_redespacho: '', highlight: false },
    { storage: '$150.000', p0_5: '$10.000', p5_10: '$14.000', recaudo: '$200 a $300', efectivo: '3,00%', reposicion: '', tarifa_redespacho: '', highlight: false },
    { storage: '$200.000', p0_5: '$8.000', p5_10: '$12.000', recaudo: '$300 a $500', efectivo: '3,00%', reposicion: '', tarifa_redespacho: '', highlight: false },
  ];

  return (
    <section className="landing-section">
      <div className="section-content">
        <FadeIn direction="up">
          <h2 className="section-title outfit-font text-center">
            Entregamos <span className="text-gradient">Confianza!</span>
          </h2>
          <p className="section-subtitle text-center">
            Tarifas transparentes sin costos ocultos. Escoge el plan que mejor se adapte a tu volumen.
          </p>
        </FadeIn>
        
        <FadeIn direction="up" delay={200} className="pricing-table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Almacenamiento<br/>Storage 1m3</th>
                <th>Paquete de<br/>0 a 5 kilos</th>
                <th>Paquete de<br/>5 a 10 kilos</th>
                <th>Linea de valor<br/>Recaudo</th>
                <th>Manejo de<br/>efectivo</th>
                <th>Reposición de<br/>Inventario-Envío<br/>nacional hasta 30 kilos*</th>
                <th>Tarifa por<br/>redespacho<br/>otras ciudades*</th>
              </tr>
            </thead>
            <tbody>
              {PricingData.map((row, i) => (
                <tr key={i} className={row.highlight ? 'row-highlight' : ''}>
                  <td className="font-mono label-col">
                    {row.highlight && <Sparkles size={14} className="text-accent" style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {row.storage}
                  </td>
                  <td className="font-mono">{row.p0_5}</td>
                  <td className="font-mono">{row.p5_10}</td>
                  <td className="font-mono">{row.recaudo}</td>
                  <td className="font-mono">{row.efectivo}</td>
                  <td className="font-mono">{row.reposicion}</td>
                  <td className="font-mono">{row.tarifa_redespacho}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeIn>

        <FadeIn direction="up" delay={400} className="pricing-footer-badge">
          Más de 10 Empresas de Mensajería a tu servicio!
        </FadeIn>
      </div>
    </section>
  );
}
