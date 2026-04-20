import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/axios';
import { Button } from './ui/button';
import { Printer, X, Info } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  category?: string;
}

interface Props {
  productId: string | null;
  onClose: () => void;
}

export default function ProductQRModal({ productId, onClose }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/products/${productId}`)
      .then((res: any) => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handlePrint = () => window.print();

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 no-print" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Print-only styles */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
            .print-label {
              width: 50mm !important;
              height: 50mm !important;
              padding: 3mm !important;
              margin: 0 auto !important;
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              page-break-after: always;
            }
            .print-label * { color: black !important; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">Etiqueta de Producto</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-zinc-500 font-medium">Generando código QR...</p>
          </div>
        ) : product ? (
          <>
            <div className="p-8 flex flex-col items-center justify-center bg-zinc-950">
              <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
                <LabelContent product={product} />
              </div>
              
              <div className="w-full space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
                  <Info size={18} className="text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    Etiqueta optimizada para impresión de <b>50×50mm</b>. 
                    Asegúrate de ajustar el tamaño de papel en las opciones de tu impresora.
                  </p>
                </div>
                
                <Button onClick={handlePrint} className="w-full gap-2 py-6 text-lg font-bold">
                  <Printer size={20} /> Imprimir Etiqueta
                </Button>
              </div>
            </div>
            
            {/* Contenido oculto para impresión real */}
            <div className="hidden print:flex print-label">
              <LabelContent product={product} />
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-zinc-500">Error al cargar producto</div>
        )}
      </div>
    </div>
  );
}

function LabelContent({ product }: { product: Product }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <QRCodeSVG
        value={product.sku}
        size={120}
        level="M"
        includeMargin={false}
      />
      <div className="text-center mt-1">
        <p className="text-[11px] font-black text-black leading-none uppercase mb-0.5">
          {product.name}
        </p>
        <p className="text-[10px] font-mono font-bold text-zinc-700 leading-none">
          {product.sku}
        </p>
        {product.brand && (
          <p className="text-[8px] text-zinc-500 leading-none mt-0.5">{product.brand}</p>
        )}
      </div>
    </div>
  );
}
