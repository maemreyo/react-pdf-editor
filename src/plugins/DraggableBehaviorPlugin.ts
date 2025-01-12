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
        // Update drag state if needed
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
  // Require canvas
  enableDragging(element: ContentElement, canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousedown", this.onMouseDown(element));
    canvas.addEventListener("mousemove", this.onMouseMove(element));
    canvas.addEventListener("mouseup", this.onMouseUp(element));
  }

  private onMouseDown = (element: ContentElement) => (event: MouseEvent) => {
    const data = element.getData();
    const rect = (event.target as HTMLElement)
      .closest("canvas")
      ?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (
      mouseX >= data.x &&
      mouseX <= data.x + 50 &&
      mouseY >= data.y &&
      mouseY <= data.y + 50
    ) {
      // Assuming a 50x50 element size
      this.dragState.set(element.id, {
        dragging: true,
        startX: event.clientX - data.x,
        startY: event.clientY - data.y,
      });
    }
  };
  private onMouseMove = (element: ContentElement) => (event: MouseEvent) => {
    const state = this.dragState.get(element.id);
    if (state?.dragging) {
      const data = element.getData();
      const rect = (event.target as HTMLElement)
        .closest("canvas")
        ?.getBoundingClientRect();
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
  private onMouseUp = (element: ContentElement) => () => {
    this.dragState.set(element.id, {
      ...this.dragState.get(element.id),
      dragging: false,
    } as DragState);
  };
}
