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
    }
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    if (this.loading) {
      this.loadingStrategy.handleLoading(this, ctx, canvasWidth, canvasHeight);
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
  }

  update(data: Partial<ContentData>): void {
    this.stateManagementStrategy.setState(this, data);
    if (data.src && data.src !== this.data.src) {
      this.loadImage();
    }
  }

  getData(): ContentData {
    return this.stateManagementStrategy.getState(this);
  }
}
