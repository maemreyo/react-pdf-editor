// File: src/components/ContentElements/ImageElement.ts
import { ContentElement, ContentData } from "../../types/_content";
import { getBase64FromImageUrl } from "../../utils";

export class ImageElement implements ContentElement {
  readonly id: string;
  readonly type: ContentData["type"] = "image";
  private data: ContentData;
  private image: HTMLImageElement | null = null;
  private loading: boolean = false;
  private error: string | null = null;

  constructor(data: ContentData) {
    this.id = data.id;
    this.data = data;
    this.loadImage();
  }

  private async loadImage() {
    if (!this.data.src) {
      this.error = "Image source is required";
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Convert the image URL to a base64 string
      const base64Image = await getBase64FromImageUrl(this.data.src);

      // Create a new image element and set its source to the base64 string
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = base64Image;

      img.onload = () => {
        this.image = img;
        this.loading = false;
      };

      img.onerror = () => {
        this.error = "Error loading image";
        this.loading = false;
      };
    } catch (error) {
      this.error = "Error converting image to base64";
      this.loading = false;
    }
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    if (!this.image) {
      if (this.loading) {
        // Handle loading state, e.g., draw a loading indicator
        ctx.save();
        ctx.fillStyle = "lightgray";
        ctx.fillRect(this.data.x, this.data.y, 100, 100); // Placeholder size
        ctx.restore();
      }
      if (this.error) {
        // Handle error state, e.g., draw an error icon
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillRect(this.data.x, this.data.y, 100, 100); // Placeholder size
        ctx.restore();
      }
      return; // Cannot render without image
    }

    ctx.drawImage(this.image, this.data.x, this.data.y);
  }

  update(data: Partial<ContentData>): void {
    this.data = { ...this.data, ...data };
    if (data.src && data.src !== this.data.src) {
      this.loadImage();
    }
  }

  getData(): ContentData {
    return this.data;
  }
}
