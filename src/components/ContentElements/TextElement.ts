import { ContentElement, ContentData } from "../../types/_content";

export class TextElement implements ContentElement {
  readonly id: string;
  readonly type: ContentData["type"] = "text";
  private data: ContentData;

  constructor(data: ContentData) {
    this.id = data.id;
    this.data = data;
  }

  async render(
    ctx: CanvasRenderingContext2D,
    _canvasWidth: number,
    _canvasHeight: number,
  ): Promise<void> {
    if (!this.data.value) return;

    ctx.save();
    ctx.fillStyle = "black"; // Default color, make configurable later
    ctx.font = "16px Arial"; // Default font, make configurable later
    ctx.fillText(this.data.value, this.data.x, this.data.y);
    ctx.restore();
  }

  update(data: Partial<ContentData>): void {
    this.data = { ...this.data, ...data };
  }

  getData(): ContentData {
    return this.data;
  }
}
