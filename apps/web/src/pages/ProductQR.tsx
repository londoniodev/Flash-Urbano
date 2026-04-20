import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  category?: string;
}

export default function ProductQR() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) return;
    api.get(`/products/${productId}`).then((res) => setProduct(res.data)).catch(console.error);
  }, [productId]);

  const handlePrint = () => window.print();

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400">
        Cargando producto...
      </div>
    );
  }

  return (
    <>
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
            page-break-after: always;
          }
          .print-label * { color: black !important; }
        }
      `}</style>

      {/* Screen toolbar */}
      <div className="no-print flex items-center gap-3 p-4 bg-zinc-950 border-b border-zinc-800">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800">
          <ArrowLeft size={16} /> Volver
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Printer size={16} /> Imprimir Etiqueta (5×5cm)
        </Button>
        <span className="text-sm text-zinc-500 ml-2">
          Asegúrate de configurar el tamaño del papel a 50×50mm en las opciones de impresión.
        </span>
      </div>

      {/* Label preview */}
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] bg-zinc-950 no-print">
        <div className="bg-white rounded-xl shadow-2xl border border-zinc-700" style={{ width: '200px', height: '200px', padding: '12px' }}>
          <LabelContent product={product} />
        </div>
      </div>

      {/* Actual print label (hidden on screen) */}
      <div className="print-label hidden print:block">
        <LabelContent product={product} />
      </div>
    </>
  );
}

function LabelContent({ product }: { product: Product }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
      <QRCodeSVG
        value={product.sku}
        size={110}
        level="M"
        includeMargin={false}
      />
      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', textAlign: 'center', lineHeight: 1.2, margin: 0 }}>
        {product.name}
      </p>
      <p style={{ fontSize: '9px', fontFamily: 'monospace', color: '#333', margin: 0 }}>
        {product.sku}
      </p>
      {product.brand && (
        <p style={{ fontSize: '8px', color: '#666', margin: 0 }}>{product.brand}</p>
      )}
    </div>
  );
}
