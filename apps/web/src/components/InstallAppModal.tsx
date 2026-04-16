import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, Download, X } from 'lucide-react';
import './InstallAppModal.css';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  if (!isOpen) return null;

  const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL || 'https://lahoitrbgahvzgozgmow.supabase.co/functions/v1/download-apk';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header-app">
          <div className="app-icon-container">
            <Smartphone size={32} className="icon-pulse" />
          </div>
          <h2>Instalar Flash Urbano</h2>
          <p>Lleva el control logisticos en la palma de tu mano.</p>
        </div>

        <div className="modal-body-app">
          <div className="qr-section">
            <div className="qr-container">
              <QRCodeCanvas 
                value={downloadUrl} 
                size={180}
                level="H"
                includeMargin={true}
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
            <p className="qr-instruction">
              Escanea con la camara de tu <strong>Android</strong> para descargar directamente.
            </p>
          </div>

          <div className="divider">
            <span>o</span>
          </div>

          <div className="download-section">
            <a 
              href={downloadUrl} 
              className="download-button-pro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={18} />
              Descargar APK Directa
            </a>
            <p className="version-tag">Compatible con Android 8.0+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
