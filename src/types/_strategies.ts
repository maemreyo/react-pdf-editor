// File: types/_strategies.ts
import { ContentElement, ContentData } from "./_content";

/**
 * Interface cho chiến lược rendering.
 */
export interface IRenderStrategy {
  /**
   * Thực hiện render content lên canvas.
   * @param element - ContentElement cần render.
   * @param ctx - Canvas rendering context.
   * @param canvasWidth - Chiều rộng của canvas.
   * @param canvasHeight - Chiều cao của canvas.
   */
  render(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void>;
}

/**
 * Interface cho chiến lược xử lý trạng thái loading.
 */
export interface ILoadingStrategy {
  /**
   * Xử lý trạng thái loading.
   * @param element - ContentElement đang loading.
   * @param ctx - Canvas rendering context.
   * @param canvasWidth - Chiều rộng của canvas.
   * @param canvasHeight - Chiều cao của canvas.
   */
  handleLoading(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): void;
}

/**
 * Interface cho chiến lược xử lý lỗi.
 */
export interface IErrorHandlingStrategy {
  /**
   * Xử lý lỗi.
   * @param element - ContentElement đang bị lỗi.
   * @param ctx - Canvas rendering context.
   * @param canvasWidth - Chiều rộng của canvas.
   * @param canvasHeight - Chiều cao của canvas.
   * @param error - Thông tin lỗi.
   */
  handleError(
    element: ContentElement,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    error: string,
  ): void;
}

/**
 * Interface cho chiến lược quản lý trạng thái.
 */
export interface IStateManagementStrategy {
  /**
   * Lấy trạng thái hiện tại của element.
   * @param element - ContentElement.
   * @returns Trạng thái hiện tại.
   */
  getState(element: ContentElement): any;

  /**
   * Cập nhật trạng thái của element.
   * @param element - ContentElement.
   * @param data - Dữ liệu trạng thái mới.
   */
  setState(element: ContentElement, data: Partial<ContentData>): void;
}

/**
 * Interface tổng hợp cho các chiến lược liên quan đến lifecycle của content.
 */
export interface IContentLifecycleStrategy {
  renderStrategy: IRenderStrategy;
  loadingStrategy: ILoadingStrategy;
  errorHandlingStrategy: IErrorHandlingStrategy;
}

/**
 * Interface tổng hợp cho các chiến lược liên quan đến hành vi của content.
 */
export interface IContentBehaviorStrategy {
  stateManagementStrategy: IStateManagementStrategy;
}
