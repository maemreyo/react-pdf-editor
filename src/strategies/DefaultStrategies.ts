import {
  IRenderStrategy,
  ILoadingStrategy,
  IErrorHandlingStrategy,
  IStateManagementStrategy,
} from "../types/_strategies";
import { ContentElement, ContentData } from "../types/_content";
import { DEFAULT_VIEWER_CONFIG } from "@/constants";
import {
  DynamicQRCodeGenerator,
  StaticQRCodeGenerator,
} from "./QRCodeStrategies";
import { ContentRenderError } from "../core/errors/ContentErrors";

/**
 * Default implementation for IRenderStrategy.
 */
export class DefaultRenderStrategy implements IRenderStrategy {
  async render(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    try {
      if (element.type === "text") {
        const data = element.getData();
        if (!data.value) return;

        ctx.save();
        ctx.fillStyle = "black"; // Default color, make configurable later
        ctx.font = "16px Arial"; // Default font, make configurable later
        ctx.fillText(data.value, data.x, data.y);
        ctx.restore();
      } else if (element.type === "image") {
        const data = element.getData();
        const image = await this.loadImage(data.src!);

        if (image) {
          ctx.drawImage(image, data.x, data.y);
        }
      } else if (element.type === "qrcode") {
        const data = element.getData();
        const qrCodeImage = await this.loadQRCodeImage(
          data.link!,
          data.src,
          data.x,
          data.y,
          data.size,
          data.dpi,
        );
        if (qrCodeImage) {
          const size = data.size || DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE;
          const dpi = data.dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI;
          const displaySize = Math.max((size * dpi) / 96, 5);
          ctx.drawImage(qrCodeImage, data.x, data.y, displaySize, displaySize);
        }
      } else {
        console.warn(
          "DefaultRenderStrategy is being used, you might want to implement a specific render strategy for this content type.",
        );
      }
    } catch (error) {
      throw new ContentRenderError(`Error rendering element ${element.id}`, {
        element,
        canvasWidth,
        canvasHeight,
        error: error,
      });
    }
  }

  private async loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise<HTMLImageElement | null>((resolve, reject) => {
      if (!src) {
        reject("Image source is required");
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject("Error loading image");
      };
    });
  }

  private async loadQRCodeImage(
    link: string,
    src: string | undefined,
    x: number,
    y: number,
    size: number | undefined,
    dpi: number | undefined,
  ): Promise<HTMLImageElement | null> {
    return new Promise<HTMLImageElement | null>((resolve, reject) => {
      if (!link) {
        reject("QR Code link is required");
        return;
      }
      const strategy = src
        ? new StaticQRCodeGenerator(src)
        : new DynamicQRCodeGenerator();

      strategy
        .generate(link, {
          x: x,
          y: y,
          size: size || DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
          dpi: dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI,
        })
        .then((qrCodeImage) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = qrCodeImage;
          img.onload = () => {
            resolve(img);
          };

          img.onerror = () => {
            reject("Error loading QR Code image");
          };
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

/**
 * Default implementation for ILoadingStrategy.
 */
export class DefaultLoadingStrategy implements ILoadingStrategy {
  handleLoading(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    // Draw a simple loading indicator
    ctx.save();
    ctx.fillStyle = "lightgray";
    ctx.fillRect(element.getData().x, element.getData().y, 50, 50);
    ctx.fillStyle = "black";
    ctx.fillText(
      "Loading...",
      element.getData().x + 5,
      element.getData().y + 25,
    );
    ctx.restore();
  }
}

/**
 * Default implementation for IErrorHandlingStrategy.
 */
export class DefaultErrorHandlingStrategy implements IErrorHandlingStrategy {
  handleError(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    error: string,
  ): void {
    // Draw a simple error indicator
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(element.getData().x, element.getData().y, 50, 50);
    ctx.fillStyle = "white";
    ctx.fillText("Error", element.getData().x + 5, element.getData().y + 25);
    ctx.restore();
    console.error(`Error in element ${element.id}: ${error}`);
  }
}

/**
 * Default implementation for IStateManagementStrategy.
 */
export class DefaultStateManagementStrategy
  implements IStateManagementStrategy
{
  getState(element: ContentElement): any {
    return element.getData();
  }

  setState(element: ContentElement, data: Partial<ContentData>): void {
    element.update(data);
  }
}
