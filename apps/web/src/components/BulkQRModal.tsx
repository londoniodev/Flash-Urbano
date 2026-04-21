import { QRCodeCanvas } from 'qrcode.react';
import { X, FileDown, Grid, Layout, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
}

interface Props {
  products: Product[];
  companyName: string;
  onClose: () => void;
}

export default function BulkQRModal({ products, companyName, onClose }: Props) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Configuramos el PDF en tamaño CARTA
      const pdf = new jsPDF('p', 'mm', 'letter');
      
      const labelsPerPage = 20; 
      const marginX = 10;
      const marginY = 15;
      const labelWidth = 48;
      const labelHeight = 48;
      const gap = 2;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Nueva página si es necesario
        if (i > 0 && i % labelsPerPage === 0) {
          pdf.addPage();
        }

        // Obtener el canvas del QR generado en el DOM
        const canvas = document.getElementById(`qr-canvas-${product.id}`) as HTMLCanvasElement;
        if (!canvas) continue;
        
        const qrData = canvas.toDataURL('image/png');
        
        // Calcular posición
        const pageIdx = i % labelsPerPage;
        const col = pageIdx % 4;
        const row = Math.floor(pageIdx / 4);
        
        const x = marginX + (col * (labelWidth + gap));
        const y = marginY + (row * (labelHeight + gap));
        
        // Dibujar borde de la etiqueta (opcional, ayuda al corte)
        pdf.setDrawColor(230, 230, 230);
        pdf.rect(x, y, labelWidth, labelHeight);
        
        // Dibujar el QR
        // Lo centramos un poco arriba (label es 48x48, QR de 32x32)
        const qrSize = 34;
        const qrX = x + (labelWidth - qrSize) / 2;
        const qrY = y + 2;
        pdf.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);
        
        // Escribir Texto (Nombre y SKU)
        pdf.setTextColor(0, 0, 0);
        
        // Nombre (Trunado si es muy largo)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const splitName = pdf.splitTextToSize(product.name.toUpperCase(), labelWidth - 4);
        pdf.text(splitName.slice(0, 2), x + labelWidth / 2, y + 38, { align: 'center' });
        
        // SKU
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text(product.sku, x + labelWidth / 2, y + 45, { align: 'center' });
      }

      pdf.save(`etiquetas_carta_${companyName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Error al generar PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <Grid className="text-primary" size={20} />
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Generador de PDF Directo (Sin Errores)</h2>
              <p className="text-xs text-zinc-500">Cliente: <span className="text-zinc-300 font-medium">{companyName}</span> • {products.length} productos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-2 rounded-lg flex flex-col items-center justify-center gap-1 shadow-md border border-white/10">
                {/* Renderizamos el canvas con un ID único para capturarlo luego */}
                <QRCodeCanvas 
                  id={`qr-canvas-${product.id}`}
                  value={product.sku} 
                  size={80} 
                  level="M" 
                  includeMargin={false}
                />
                <div className="text-center overflow-hidden w-full">
                  <p className="text-[9px] font-black text-black truncate uppercase">{product.name}</p>
                  <p className="text-[8px] font-mono font-bold text-zinc-600">{product.sku}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-400">
            <Layout size={18} />
            <span className="text-sm">Método de Dibujo Directo • Tamaño Carta</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" disabled={generating}>
              Cancelar
            </Button>
            <Button onClick={generatePDF} className="gap-2 px-8" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generando...
                </>
              ) : (
                <>
                  <FileDown size={18} /> Descargar PDF Carta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
