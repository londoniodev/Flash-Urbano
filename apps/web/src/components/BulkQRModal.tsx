import { QRCodeCanvas } from 'qrcode.react';
import { X, FileDown, Grid, Layout, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const printRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    
    try {
      // Configuramos el PDF en A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const container = printRef.current;
      
      // Obtenemos todos los elementos individuales de etiqueta
      const labels = container.querySelectorAll('.bulk-label');
      
      const labelsPerPage = 20; // 4 columnas x 5 filas (aprox)
      const margin = 10;
      const labelSize = 48; // mm
      const gap = 2; // mm

      for (let i = 0; i < labels.length; i++) {
        if (i > 0 && i % labelsPerPage === 0) {
          pdf.addPage();
        }

        const labelElement = labels[i] as HTMLElement;
        const canvas = await html2canvas(labelElement, { 
          scale: 3, // Alta calidad
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calcular posición en la página A4
        const pageIdx = i % labelsPerPage;
        const col = pageIdx % 4;
        const row = Math.floor(pageIdx / 4);
        
        const x = margin + (col * (labelSize + gap));
        const y = margin + (row * (labelSize + gap));
        
        pdf.addImage(imgData, 'PNG', x, y, labelSize, labelSize);
      }

      pdf.save(`etiquetas_${companyName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Error al generar el PDF. Revisa la consola.');
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
              <h2 className="text-lg font-bold text-zinc-100">Generador de PDF Masivo (Mosaico)</h2>
              <p className="text-xs text-zinc-500">Cliente: <span className="text-zinc-300 font-medium">{companyName}</span> • {products.length} productos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-2 rounded-lg flex flex-col items-center justify-center gap-1 shadow-md border border-white/10">
                <QRCodeCanvas value={product.sku} size={60} level="M" />
                <div className="text-center overflow-hidden w-full">
                  <p className="text-[9px] font-black text-black truncate uppercase">{product.name}</p>
                  <p className="text-[8px] font-mono font-bold text-zinc-600">{product.sku}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Container for PDF Rendering */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }} ref={printRef}>
          {products.map((product) => (
            <div key={product.id} className="bulk-label" style={{ width: '200px', height: '200px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
               <QRCodeCanvas value={product.sku} size={140} level="M" />
               <div style={{ textAlign: 'center', marginTop: '8px' }}>
                 <p style={{ fontSize: '12px', fontWeight: '900', color: 'black', margin: 0, textTransform: 'uppercase' }}>
                   {product.name}
                 </p>
                 <p style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', color: '#444', margin: '2px 0 0 0' }}>
                   {product.sku}
                 </p>
               </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-400">
            <Layout size={18} />
            <span className="text-sm">Tamaño A4 • 20 etiquetas por página (50x50mm)</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" disabled={generating}>
              Cancelar
            </Button>
            <Button onClick={generatePDF} className="gap-2 px-8" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generando PDF...
                </>
              ) : (
                <>
                  <FileDown size={18} /> Descargar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
