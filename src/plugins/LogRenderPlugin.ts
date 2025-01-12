import {
  IRenderingPlugin,
  ContentData,
  ContentFactory,
  IContentElementFactory,
  RenderingPluginType,
} from "../types";
import { ContentElement } from "../types/_content";

export class LogRenderPlugin implements IRenderingPlugin {
  name = "LogRenderPlugin";
  type: RenderingPluginType = "rendering";

  init(factory: IContentElementFactory): void {
    console.log(
      `${this.name} initialized with factory: ${
        (factory as ContentFactory).constructor.name
      }`,
    );
  }
  apply(data: ContentData): void {
    console.log(`${this.name} applied to data for element id: ${data.id}`);
  }
  renderStrategy = {
    render: async (
      element: ContentElement,
      _ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      console.log("Rendering element:", element);
      console.log("Canvas size:", canvasWidth, canvasHeight);
    },
  };
}
