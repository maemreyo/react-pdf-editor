// Filepath: /PDFViewer/strategies/QRCodeStrategies.ts
import QRCode, { QRCodeToDataURLOptions } from "qrcode";
import { QRCodeGenerator, QRCodePosition } from "../types";

// Chiến lược tạo QR Code tĩnh từ hình ảnh (như hiện tại)
export class StaticQRCodeGenerator implements QRCodeGenerator {
  constructor(private qrCodeImage: string) {}

  async generate(_link: string, _position: QRCodePosition): Promise<string> {
    return this.qrCodeImage;
  }
}

// Chiến lược tạo QR Code động từ liên kết
export class DynamicQRCodeGenerator implements QRCodeGenerator {
  constructor(
    private options?: QRCodeToDataURLOptions & {
      width?: number;
      margin?: number;
    },
  ) {}

  async generate(link: string, position: QRCodePosition): Promise<string> {
    const defaultOptions: QRCodeToDataURLOptions & {
      width?: number;
      margin?: number;
    } = {
      type: "image/png",
      width: Math.max((position.size * position.dpi) / 96, 5),
      margin: 0,
    };

    const opts = { ...defaultOptions, ...this.options };

    try {
      const qrCodeBase64 = await QRCode.toDataURL(link, opts);
      return qrCodeBase64;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }
}
