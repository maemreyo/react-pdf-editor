import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFViewerProps, PDFSource } from "@/types";
import { StaticQRCodeGenerator } from "../strategies/QRCodeStrategies";
import { usePDFLoader } from "../hooks/usePDFLoader";
import { useViewerMode } from "../hooks/useViewerMode";
import { useQRCode } from "../hooks/useQRCode";
import { PDFToolbar } from "./PDFToolbar";
import { PDFCanvas } from "./PDFCanvas";
import { QRCodeCanvas } from "./QRCodeCanvas";
import { mergeQRCodeWithPDF, downloadPDF, downloadBlob } from "../utils";
import { DEFAULT_VIEWER_CONFIG } from "../constants";
import "../styles.scss";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const AdvancedPDFViewer: React.FC<PDFViewerProps> = ({
  source,
  outputFileName = "document.pdf",
  enableDownload = true,
  enableQRCode = true,
  qrLink = "https://example.com",
  qrCodeImage = "/images/qr-code.png",
  defaultQRSize = DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
  initialZoom = 1,
  minZoom: dMinzoom = DEFAULT_VIEWER_CONFIG.MIN_ZOOM,
  maxZoom: dMaxzoom = DEFAULT_VIEWER_CONFIG.MAX_ZOOM,
  mergeOutputType = "File",
  onPositionUpdate,
  onViewModeChange,
  onMerge,
  qrCodeGeneratorStrategy,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfSource, setPdfSource] = useState<PDFSource | null>(null);
  const { pdf, isLoading, error, renderTaskRef } = usePDFLoader(pdfSource);
  const {
    viewMode,
    updateViewMode,
    zoomIn,
    zoomOut,
    rotate,
    resetView,
    zoomInput,
    handleZoomInputChange,
    minZoom,
    maxZoom,
  } = useViewerMode(onViewModeChange, initialZoom, dMinzoom, dMaxzoom);
  const {
    qrPosition,
    isDragging,
    showQRCode,
    setShowQRCode,
    handleDragStart,
    handleDragEnd,
    handleDrag,
    updatePosition,
  } = useQRCode(enableQRCode, defaultQRSize, onPositionUpdate);

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const loadPdf = useCallback(async () => {
    if (typeof source === "string") {
      if (source.startsWith("data:")) {
        // Handle base64 data URLs
        const response = await fetch(source);
        const arrayBuffer = await response.arrayBuffer();
        setPdfSource({ type: "arrayBuffer", data: arrayBuffer });
      } else {
        // Handle as a regular URL
        setPdfSource({ type: "url", data: source });
      }
    } else if (source instanceof ArrayBuffer) {
      setPdfSource({ type: "arrayBuffer", data: source });
    } else if (source instanceof Blob) {
      setPdfSource({ type: "blob", data: source });
    }
  }, [source]);
  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  useEffect(() => {
    if (pdf) {
      updateViewMode({ totalPages: pdf.numPages });
    }
  }, [pdf, updateViewMode]);

  const handlePageChange = (delta: number) => {
    const newPageNumber = viewMode.pageNumber + delta;
    if (newPageNumber >= 1 && newPageNumber <= viewMode.totalPages) {
      updateViewMode({ pageNumber: newPageNumber });
    }
  };

  const handleQRSwitch = () => {
    if (!viewMode.isModified) {
      setShowQRCode(!showQRCode);
    }
  };

  const handleCanvasRender = () => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        setCanvasSize({
          width: canvas.width,
          height: canvas.height,
        });
      }
    }
  };

  const handleDownload = () => {
    if (enableDownload && pdfSource) {
      if (pdfSource.type === "url") {
        // Regular URL
        downloadPDF(pdfSource.data as string, outputFileName);
      } else if (pdfSource.type === "blob") {
        // Blob
        const url = URL.createObjectURL(pdfSource.data as Blob);
        downloadPDF(url, outputFileName);
        URL.revokeObjectURL(url);
      } else if (pdfSource.type === "arrayBuffer") {
        // ArrayBuffer
        const blob = new Blob([pdfSource.data as ArrayBuffer], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        downloadPDF(url, outputFileName);
        URL.revokeObjectURL(url);
      }
    } else if (
      enableDownload &&
      typeof source === "string" &&
      source.startsWith("data:")
    ) {
      const blob = new Blob([source], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      downloadPDF(url, outputFileName);
      URL.revokeObjectURL(url);
    } else if (enableDownload && source instanceof Blob) {
      const url = URL.createObjectURL(source);
      downloadPDF(url, outputFileName);
      URL.revokeObjectURL(url);
    } else if (enableDownload && source instanceof ArrayBuffer) {
      const blob = new Blob([source], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      downloadPDF(url, outputFileName);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadWithQR = async () => {
    if (!showQRCode || !pdfSource) return;
    let arrayBuffer: ArrayBuffer;

    if (pdfSource.type === "url") {
      const response = await fetch(pdfSource.data as string);
      arrayBuffer = await response.arrayBuffer();
    } else if (pdfSource.type === "blob") {
      const blob = pdfSource.data as Blob;
      arrayBuffer = await blob.arrayBuffer();
    } else if (pdfSource.type === "arrayBuffer") {
      arrayBuffer = pdfSource.data as ArrayBuffer;
    } else {
      return;
    }

    // Sử dụng chiến lược tạo QR Code
    let qrCodeBase64: string;
    const defaultQRStrategy = new StaticQRCodeGenerator(
      qrCodeImage || "/images/qr-code.png"
    ); // Default to static if not provided
    const strategy = qrCodeGeneratorStrategy || defaultQRStrategy;

    if (qrCodeGeneratorStrategy) {
      qrCodeBase64 = await strategy.generate(
        qrLink || "https://example.com",
        qrPosition
      ); // Use qrLink if available
    } else {
      qrCodeBase64 = await defaultQRStrategy.generate("", qrPosition);
    }
    // Tiếp tục xử lý với base64 của QR Code
    const mergedPdf = await mergeQRCodeWithPDF(
      arrayBuffer,
      qrCodeBase64,
      qrPosition,
      outputFileName,
      mergeOutputType
    );

    if (mergedPdf) {
      if (onMerge) {
        onMerge(mergedPdf);
      }

      if (mergedPdf instanceof Blob) {
        downloadBlob(mergedPdf, outputFileName);
      }
    }
  };
  // Add a useEffect to update showQRCode based on qrCodeGeneratorStrategy
  useEffect(() => {
    if (!qrCodeGeneratorStrategy) {
      setShowQRCode(false);
    } else {
      setShowQRCode(enableQRCode);
    }
  }, [qrCodeGeneratorStrategy, enableQRCode]);

  return (
    <div ref={containerRef} className="pdf-viewer position-relative w-100">
      <PDFToolbar
        viewMode={viewMode}
        showQRCode={showQRCode}
        isQRSwitchDisabled={viewMode.isModified}
        enableDownload={enableDownload}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onRotate={rotate}
        onResetView={resetView}
        onQRSwitch={handleQRSwitch}
        onPageChange={handlePageChange}
        onDownload={handleDownload}
        onDownloadWithQR={handleDownloadWithQR}
        zoomInput={zoomInput}
        handleZoomInputChange={handleZoomInputChange}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />

      <div
        className="canvas-container overflow-auto d-flex justify-content-center align-items-center"
        style={{
          height: DEFAULT_VIEWER_CONFIG.DEFAULT_VIEWER_HEIGHT,
        }}
      >
        {isLoading ? (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            Error loading PDF: {error.message}
          </div>
        ) : (
          <div className="position-relative">
            <PDFCanvas
              pdf={pdf}
              viewMode={viewMode}
              renderTaskRef={renderTaskRef}
              onRender={handleCanvasRender}
            />
            {showQRCode && (
              <QRCodeCanvas
                qrPosition={qrPosition}
                qrCodeImage={qrCodeImage}
                width={canvasSize.width}
                height={canvasSize.height}
                onDragStart={handleDragStart}
                onDrag={(e) =>
                  handleDrag(
                    e,
                    containerRef.current?.getBoundingClientRect() as DOMRect,
                    canvasSize.width,
                    canvasSize.height
                  )
                }
                onDragEnd={handleDragEnd}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPDFViewer;
