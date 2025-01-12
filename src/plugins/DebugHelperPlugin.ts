import { ErrorHandler } from "@/core/errors/ErrorHandler";
import {
  IUtilityPlugin,
  ContentElement,
  ContentFactory,
  IContentElementFactory,
  UtilityPluginType,
} from "../types";

export class DebugHelperPlugin implements IUtilityPlugin {
  name = "DebugHelperPlugin";
  type: UtilityPluginType = "utility";

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

  drawBoundingBox(element: ContentElement, ctx: CanvasRenderingContext2D) {
    try {
      const data = element.getData();
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.strokeRect(data.x, data.y, 50, 50); // Assuming a 50x50 element size
      ctx.restore();
    } catch (error) {
      ErrorHandler.handle(error as Error);
    }
  }
}
