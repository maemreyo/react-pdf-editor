import { ContentElement, ContentData } from "../../types/_content";
import {
  StaticQRCodeGenerator,
  DynamicQRCodeGenerator,
} from "../../strategies";
import { DEFAULT_VIEWER_CONFIG } from "../../constants";

export class QRCodeElement implements ContentElement {
  readonly id: string;
  readonly type: ContentData["type"] = "qrcode";
  private data: ContentData;
  private qrCodeImage: string | null = null;
  private loading: boolean = false;
  private error: string | null = null;

  constructor(data: ContentData) {
    this.id = data.id;
    this.data = data;
    this.generateQRCode();
  }

  private async generateQRCode() {
    if (!this.data.link) {
      this.error = "QR Code link is required";
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const strategy = this.data.src
        ? new StaticQRCodeGenerator(this.data.src)
        : new DynamicQRCodeGenerator();
      this.qrCodeImage = await strategy.generate(this.data.link, {
        x: this.data.x,
        y: this.data.y,
        size: this.data.size || DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
        dpi: this.data.dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI,
      });
    } catch (error) {
      this.error = "Error generating QR Code";
    } finally {
      this.loading = false;
    }
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    if (!this.qrCodeImage) {
      if (this.loading) {
        // Handle loading state
        ctx.save();
        ctx.fillStyle = "lightgray";
        ctx.fillRect(this.data.x, this.data.y, 50, 50); // Placeholder size
        ctx.restore();
      }
      if (this.error) {
        // Handle error state
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillRect(this.data.x, this.data.y, 50, 50); // Placeholder size
        ctx.restore();
      }
      return; // Cannot render without QR code image
    }

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = this.qrCodeImage!;

      img.onload = () => {
        const size = this.data.size || DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE;
        const dpi = this.data.dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI;
        const displaySize = Math.max((size * dpi) / 96, 5);
        ctx.drawImage(img, this.data.x, this.data.y, displaySize, displaySize);
        resolve();
      };

      img.onerror = () => {
        this.error = "Error loading QR Code image";
        reject(new Error(this.error));
      };
    });
  }

  update(data: Partial<ContentData>): void {
    this.data = { ...this.data, ...data };
    if (
      (data.link && data.link !== this.data.link) ||
      (data.src && data.src !== this.data.src)
    ) {
      this.generateQRCode();
    }
  }

  getData(): ContentData {
    return this.data;
  }
}
