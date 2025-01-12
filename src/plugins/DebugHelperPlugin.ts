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
    console.log(
      `${this.name} initialized with factory: ${
        (factory as ContentFactory).constructor.name
      }`,
    );
  }

  drawBoundingBox(element: ContentElement, ctx: CanvasRenderingContext2D) {
    const data = element.getData();
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.strokeRect(data.x, data.y, 50, 50); // Assuming a 50x50 element size
    ctx.restore();
  }
}
