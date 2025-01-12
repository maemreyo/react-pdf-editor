import {
  IBehaviorPlugin,
  ContentData,
  IStateManagementStrategy,
  ContentElement,
  ContentFactory,
  IContentElementFactory,
  BehaviorPluginType,
} from "../types";
import { ErrorHandler } from "../core/errors/ErrorHandler";
import { ContentStateManager } from "../core/state/ContentStateManager";
import { DEFAULT_VIEWER_CONFIG } from "@/constants";
import { ImageElement } from "@/ui/ContentElements";

interface DragState {
  dragging: boolean;
  startX: number;
  startY: number;
}
export class DraggableBehaviorPlugin implements IBehaviorPlugin {
  name = "DraggableBehaviorPlugin";
  type: BehaviorPluginType = "behavior";
  private dragState: Map<string, DragState> = new Map();

  stateManagementStrategy: IStateManagementStrategy = {
    getState: (element: ContentElement) => {
      return element.getData();
    },
    setState: (element: ContentElement, data: Partial<ContentData>) => {
      element.update(data);
      const currentState = this.dragState.get(element.id);
      if (currentState) {
      }
    },
  };

  init(factory: IContentElementFactory): void {
    try {
      console.log(
        `${this.name} initialized with factory: ${
          (factory as ContentFactory).constructor.name
        }`,
      );
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }

  apply(data: ContentData): void {
    try {
      console.log(`${this.name} applied to data for element id: ${data.id}`);
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }

  public onMouseDown =
    (element: ContentElement, canvasRect: () => DOMRect | undefined) =>
    (event: MouseEvent) => {
      const data = element.getData();
      const rect = canvasRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Dynamically get the size of the element
      let elementWidth = 50; // Default size
      let elementHeight = 50; // Default size

      if (element.type === "image") {
        const imgElement = element as ImageElement;
        if (imgElement.getImage()) {
          // Assuming you have a method to get the image in ImageElement
          elementWidth = imgElement.getImage().width;
          elementHeight = imgElement.getImage().height;
        }
      } else if (element.type === "qrcode") {
        elementWidth = data.size
          ? (data.size * (data.dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI)) / 96
          : DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE;
        elementHeight = elementWidth;
      } else if (element.type === "text") {
        // Approximating text size - might need a more accurate method
        const textMetrics = this.measureText(data.value || "", "16px Arial"); // Assuming a default font
        elementWidth = textMetrics.width;
        elementHeight =
          textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent;
      }
      // Add more conditions for other types if necessary

      // Check if the mouse is within the bounding box of the element
      if (
        mouseX >= data.x &&
        mouseX <= data.x + elementWidth &&
        mouseY >= data.y &&
        mouseY <= data.y + elementHeight
      ) {
        this.dragState.set(element.id, {
          dragging: true,
          startX: event.clientX - data.x,
          startY: event.clientY - data.y,
        });
      }
    };

  // Helper function to measure text size (rough approximation)
  private measureText(text: string, font: string): TextMetrics {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return {} as TextMetrics;
    context.font = font;
    return context.measureText(text);
  }

  public onMouseMove =
    (element: ContentElement, canvasRect: () => DOMRect | undefined) =>
    (event: MouseEvent) => {
      const state = this.dragState.get(element.id);
      if (state?.dragging) {
        const data = element.getData();
        const rect = canvasRect();
        if (!rect) return;

        const newX = event.clientX - rect.left - state.startX;
        const newY = event.clientY - rect.top - state.startY;

        if ("stateManager" in element) {
          (element.stateManager as ContentStateManager).updateData({
            x: newX,
            y: newY,
          });
        }
      }
    };

  public onMouseUp = (element: ContentElement) => () => {
    this.dragState.set(element.id, {
      ...this.dragState.get(element.id),
      dragging: false,
    } as DragState);
  };

  enableDragging(element: ContentElement, canvas: HTMLCanvasElement) {
    const canvasRect = () => canvas.getBoundingClientRect();
    const mouseDownHandler = this.onMouseDown(element, canvasRect);
    const mouseMoveHandler = this.onMouseMove(element, canvasRect);
    const mouseUpHandler = this.onMouseUp(element);

    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);

    return () => {
      canvas.removeEventListener("mousedown", mouseDownHandler);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mouseup", mouseUpHandler);
    };
  }
}
