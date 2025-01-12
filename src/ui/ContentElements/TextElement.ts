// File: ui/ContentElements/TextElement.ts
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
import { ErrorHandler } from "../../core/errors/ErrorHandler";
import { ContentStateManager } from "@/core/state/ContentStateManager";

export class TextElement implements ContentElement {
  readonly id: string;
  readonly type: ContentType = ContentType.TEXT;
  private data: ContentData;
  private renderStrategy: IRenderStrategy;
  private loadingStrategy: ILoadingStrategy;
  private errorHandlingStrategy: IErrorHandlingStrategy;
  private stateManagementStrategy: IStateManagementStrategy;
  stateManager: ContentStateManager;

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

    this.stateManager = new ContentStateManager({
      isLoading: false,
      error: null,
      data: data,
    });
  }

  async render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    try {
      // Delegate rendering to the render strategy
      await this.renderStrategy.render(this, ctx, canvasWidth, canvasHeight);
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }

  update(data: Partial<ContentData>): void {
    this.stateManager.updateData(data);
  }

  getData(): ContentData {
    return this.stateManager.getState().data;
  }
}
