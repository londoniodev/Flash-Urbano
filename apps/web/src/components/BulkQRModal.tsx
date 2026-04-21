import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Grid, Layout } from 'lucide-react';
import { Button } from './ui/button';

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
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 no-print print:static print:bg-white print:p-0" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col print:static print:max-h-none print:w-full print:bg-white print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @media print {
            @page { 
              margin: 10mm; 
              size: auto;
            }
            /* Hide UI components */
            .no-print, header, nav, aside, footer, button, .flex-none { 
              display: none !important; 
            }
            
            /* Reset all containers to allow multi-page flow */
            #app, #app > div, .fixed, .flex, .flex-col {
              display: block !important;
              position: static !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              visibility: visible !important;
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            .print-bulk-container {
              display: grid !important;
              grid-template-columns: repeat(auto-fill, 50mm) !important;
              gap: 2mm !important;
              width: 100% !important;
              background: white !important;
              padding-top: 5mm !important;
            }

            .bulk-label {
              width: 50mm !important;
              height: 50mm !important;
              border: 0.1mm solid #eee !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              padding: 2mm !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              margin-bottom: 2mm !important;
            }

            .page-footer {
              position: fixed !important;
              bottom: 0 !important;
              right: 0 !important;
              font-size: 10px !important;
              color: #888 !important;
              display: block !important;
            }
            .page-footer::after {
              content: "Página " counter(page);
            }
          }
          @media screen {
            .print-bulk-container, .page-footer { display: none !important; }
          }
        `}</style>

        {/* Header (Hidden in print) */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur no-print">
          <div className="flex items-center gap-2">
            <Grid className="text-primary" size={20} />
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Impresión Masiva de QR</h2>
              <p className="text-xs text-zinc-500">Cliente: <span className="text-zinc-300 font-medium">{companyName}</span> • {products.length} productos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 print:bg-white print:p-0 print:overflow-visible">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 print:hidden">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg border border-white/10">
                <QRCodeSVG value={product.sku} size={80} level="M" />
                <div className="text-center overflow-hidden w-full">
                  <p className="text-[10px] font-black text-black truncate uppercase">{product.name}</p>
                  <p className="text-[9px] font-mono font-bold text-zinc-600">{product.sku}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Print Container */}
          <div className="print-bulk-container">
            {products.map((product) => (
              <div key={product.id} className="bulk-label">
                 <QRCodeSVG value={product.sku} size={110} level="M" />
                 <div className="text-center mt-1">
                   <p className="text-[11px] font-black text-black leading-tight uppercase mb-0.5 line-clamp-2">
                     {product.name}
                   </p>
                   <p className="text-[10px] font-mono font-bold text-zinc-700 leading-none">
                     {product.sku}
                   </p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page counter for print */}
        <div className="page-footer"></div>

        {/* Footer (Hidden in print) */}
        <div className="flex-none px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between no-print">
          <div className="flex items-center gap-3 text-zinc-400">
            <Layout size={18} />
            <span className="text-sm">Diseño en mosaico (50x50mm)</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button onClick={handlePrint} className="gap-2 px-8">
              <Printer size={18} /> Imprimir Todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
