import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  if (!isOpen) return null;

  const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL || 'https://lahoitrbgahvzgozgmow.supabase.co/functions/v1/download-apk';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative flex flex-col w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 p-1 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6 mt-2 relative z-10">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 border border-primary/20 relative">
             <div className="absolute inset-0 rounded-2xl animate-ping border border-primary/40 opacity-50"></div>
             <Smartphone size={32} className="text-primary z-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 italic">Instalar <span className="text-primary font-black">Flash</span> Urbano</h2>
          <p className="text-zinc-400 mt-2 text-sm max-w-[250px]">Lleva el control logístico 100% en la palma de tu mano.</p>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white rounded-xl shadow-lg ring-4 ring-primary/20">
              <QRCodeCanvas 
                value={downloadUrl} 
                size={160}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/vite.svg",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs text-zinc-400 text-center max-w-[200px]">
              Escanea con la cámara de tu <strong className="text-zinc-200">Android</strong> para descargar directamente.
            </p>
          </div>

          <div className="w-full flex items-center gap-3 text-zinc-600">
            <div className="h-px w-full bg-zinc-800"></div>
            <span className="text-xs font-medium uppercase tracking-widest">Ó</span>
            <div className="h-px w-full bg-zinc-800"></div>
          </div>

          <div className="flex flex-col w-full gap-2 text-center">
            <Button 
              asChild 
              className="w-full h-12 text-base font-bold bg-zinc-100 text-zinc-900 hover:bg-zinc-300"
            >
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download size={18} className="mr-2" />
                Descargar APK Directa
              </a>
            </Button>
            <p className="text-[10px] text-zinc-500 font-medium">Compatible exclusivamente con Android 8.0+</p>
          </div>
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      </div>
    </div>
  );
}
