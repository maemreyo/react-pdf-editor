import {
  IRenderingPlugin,
  ContentData,
  ContentFactory,
  IContentElementFactory,
  RenderingPluginType,
} from "../types";
import { ContentElement } from "../types/_content";
import { ErrorHandler } from "../core/errors/ErrorHandler";

export class LogRenderPlugin implements IRenderingPlugin {
  name = "LogRenderPlugin";
  type: RenderingPluginType = "rendering";

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
  renderStrategy = {
    render: async (
      element: ContentElement,
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      try {
        console.log("Rendering element:", element);
        console.log("Canvas size:", canvasWidth, canvasHeight);
      } catch (error) {
        ErrorHandler.handle(error as Error);
      }
    },
  };
}
