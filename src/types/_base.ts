export interface QRCodePosition {
  x: number;
  y: number;
  size: number;
  dpi: number;
}

export interface ViewerMode {
  zoom: number;
  rotation: number;
  pageNumber: number;
  totalPages: number;
  isModified: boolean;
}

export interface PDFViewerProps {
  source: string | Blob | ArrayBuffer;
  outputFileName?: string;
  enableDownload?: boolean;
  enableQRCode?: boolean;
  qrCodeImage?: string;
  qrCodeLink?: string;
  defaultQRSize?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  mergeOutputType?: "File" | "Uint8Array" | "Blob" | "Base64";
  onPositionUpdate?: (position: QRCodePosition) => void;
  onViewModeChange?: (mode: ViewerMode) => void;
  onMerge?: (data: any) => void;
  qrLink?: string;
  qrCodeGeneratorStrategy?: QRCodeGenerator;
}

export interface PDFSource {
  type: "url" | "blob" | "arrayBuffer";
  data: string | Blob | ArrayBuffer;
}

export interface QRCodeGenerator {
  generate(link: string, position: QRCodePosition): Promise<string>;
}
