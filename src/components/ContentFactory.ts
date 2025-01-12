import {
  ContentFactory as IContentFactory,
  ContentElement,
  ContentData,
} from "../types/_content";
import { ImageElement, TextElement, QRCodeElement } from "./ContentElements";

export class ContentFactory implements IContentFactory {
  create(data: ContentData): ContentElement {
    switch (data.type) {
      case "image":
        return new ImageElement(data);
      case "text":
        return new TextElement(data);
      case "qrcode":
        return new QRCodeElement(data);
      default:
        throw new Error(`Unsupported content type: ${data.type}`);
    }
  }
}
