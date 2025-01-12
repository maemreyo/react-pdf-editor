import { ContentElement, ContentData } from "../../types/_content";
import { getBase64FromImageUrl } from "../../utils";
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

export class ImageElement implements ContentElement {
  readonly id: string;
  readonly type: ContentType = ContentType.IMAGE;
  private data: ContentData;
  private image: HTMLImageElement | null = null;
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
    this.loadImage();

    this.stateManager = new ContentStateManager({
      isLoading: false,
      error: null,
      data: data,
    });
  }

  private async loadImage() {
    if (!this.data.src) {
      this.error = "Image source is required";
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const base64Image = await getBase64FromImageUrl(this.data.src);
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
      ErrorHandler.handle(error as Error);
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

      if (this.image) {
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
    if (data.src && data.src !== newData.src) {
      this.loadImage();
    }
  }

  getData(): ContentData {
    return this.stateManager.getState().data;
  }
}
