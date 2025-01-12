import { ContentElement, ContentData } from "../../types/_content";
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

export class TextElement implements ContentElement {
  readonly id: string;
  readonly type: ContentType = ContentType.TEXT;
  private data: ContentData;
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
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    // Delegate rendering to the render strategy
    await this.renderStrategy.render(this, ctx, canvasWidth, canvasHeight);
  }

  update(data: Partial<ContentData>): void {
    this.stateManagementStrategy.setState(this, data);
  }

  getData(): ContentData {
    return this.stateManagementStrategy.getState(this);
  }
}
