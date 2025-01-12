import { ContentStateManager } from "@/core/state/ContentStateManager";
import { ContentType } from "./_factory";

// Định nghĩa interface cho dữ liệu đầu vào của các Content Element
export interface ContentData {
  type: ContentType;
  id: string; // ID duy nhất cho mỗi element
  // Các thuộc tính chung, có thể mở rộng thêm tùy theo loại nội dung
  x: number;
  y: number;
  // Các thuộc tính riêng cho từng loại
  value?: string; // Dùng cho text
  src?: string; // Dùng cho image
  link?: string; // Dùng cho qrcode
  size?: number; // Dùng cho qrcode
  dpi?: number; // Dùng cho qrcode
}

// Interface cho các element được render trên PDF
export interface ContentElement {
  readonly id: string;
  readonly type: ContentData["type"];
  stateManager: ContentStateManager;
  // Phương thức để render element lên canvas
  render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void>;

  // Phương thức để update các thuộc tính của element (có thể được gọi khi drag, resize, v.v.)
  update(data: Partial<ContentData>): void;

  // Phương thức để lấy data hiện tại của element
  getData(): ContentData;
}

// Interface cho factory tạo các Content Element
export interface ContentFactory {
  create(data: ContentData): ContentElement;
}
