import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

interface Props {
  assetId: string;
  assetName: string;
  size?: number;
}

export default function QRCodeDisplay({ assetId, assetName, size = 128 }: Props) {
  const qrValue = JSON.stringify({ assetId, name: assetName });

  const handlePrint = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Asset Label - ${assetId}</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif; }
          .label { text-align: center; padding: 20px; border: 2px solid #000; border-radius: 8px; }
          .id { font-size: 14px; font-weight: bold; margin-top: 8px; font-family: monospace; }
          .name { font-size: 12px; color: #555; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="label">
          <svg id="qr"></svg>
          <div class="id">${assetId}</div>
          <div class="name">${assetName}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
        <script>
          var qr = qrcode(0, 'M');
          qr.addData(${JSON.stringify(qrValue)});
          qr.make();
          document.getElementById('qr').outerHTML = qr.createSvgTag(4, 0);
          window.print();
        <\/script>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
      <QRCodeSVG value={qrValue} size={size} level="M" />
      <p className="text-xs font-mono text-gray-500">{assetId}</p>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <Printer className="w-4 h-4" />
        Print Label
      </button>
    </div>
  );
}
