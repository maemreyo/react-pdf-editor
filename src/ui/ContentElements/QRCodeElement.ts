import { ContentElement, ContentData } from "../../types/_content";
import {
  StaticQRCodeGenerator,
  DynamicQRCodeGenerator,
} from "../../strategies";
import { DEFAULT_VIEWER_CONFIG } from "../../constants";
import {
  IRenderStrategy,
  ILoadingStrategy,
  IErrorHandlingStrategy,
  IStateManagementStrategy,
} from "../../types/_strategies";
import {
  DefaultRenderStrategy,
  DefaultLoadingStrategy,
  DefaultErrorHandlingStrategy,
  DefaultStateManagementStrategy,
} from "../../strategies/DefaultStrategies";
import { ContentType } from "@/types";
import { ErrorHandler } from "../../core/errors/ErrorHandler";
import { ContentStateManager } from "@/core/state/ContentStateManager";

export class QRCodeElement implements ContentElement {
  readonly id: string;
  readonly type: ContentType = ContentType.QRCODE;
  private data: ContentData;
  private qrCodeImage: string | null = null;
  private loading: boolean = false;
  private error: string | null = null;
  private renderStrategy: IRenderStrategy;
  private loadingStrategy: ILoadingStrategy;
  private errorHandlingStrategy: IErrorHandlingStrategy;
  private stateManagementStrategy: IStateManagementStrategy;
  private stateManager: ContentStateManager;

  constructor(
    data: ContentData,
    renderStrategy: IRenderStrategy = new DefaultRenderStrategy(),
    loadingStrategy: ILoadingStrategy = new DefaultLoadingStrategy(),
    errorHandlingStrategy: IErrorHandlingStrategy = new DefaultErrorHandlingStrategy(),
    stateManagementStrategy: IStateManagementStrategy = new DefaultStateManagementStrategy(),
  ) {
    this.id = data.id;
    this.data = data;
    this.renderStrategy = renderStrategy;
    this.loadingStrategy = loadingStrategy;
    this.errorHandlingStrategy = errorHandlingStrategy;
    this.stateManagementStrategy = stateManagementStrategy;
    this.generateQRCode();
    this.stateManager = new ContentStateManager({
      isLoading: false,
      error: null,
      data: data,
    });
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
      ErrorHandler.handle(error as Error);
    } finally {
      this.loading = false;
    }
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    try {
      if (this.loading) {
        this.loadingStrategy.handleLoading(
          this,
          ctx,
          canvasWidth,
          canvasHeight,
        );
        return;
      }

      if (this.error) {
        this.errorHandlingStrategy.handleError(
          this,
          ctx,
          canvasWidth,
          canvasHeight,
          this.error,
        );
        return;
      }
      if (this.qrCodeImage) {
        // Delegate rendering to the render strategy
        await this.renderStrategy.render(this, ctx, canvasWidth, canvasHeight);
      }
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }

  update(data: Partial<ContentData>): void {
    this.stateManager.updateData(data);
    const newData = this.stateManager.getState().data;
    if (
      (data.link && data.link !== newData.link) ||
      (data.src && data.src !== newData.src)
    ) {
      this.generateQRCode();
    }
  }

  getData(): ContentData {
    return this.stateManager.getState().data;
  }
}
