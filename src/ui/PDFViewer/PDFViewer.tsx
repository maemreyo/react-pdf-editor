import React, { useRef, useState, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFViewerProps } from "@/types";
import { StaticQRCodeGenerator } from "../../strategies/QRCodeStrategies";
import { usePDFLoader } from "../../hooks/usePDFLoader";
import { useViewerMode } from "../../hooks/useViewerMode";
import { useQRCode } from "../../hooks/useQRCode";
import { PDFToolbar } from "../PDFToolbar/PDFToolbar";
import { PDFCanvas } from "../PDFCanvas/PDFCanvas";
import { QRCodeCanvas } from "../QRCodeCanvas/QRCodeCanvas";
import { mergeQRCodeWithPDF, downloadPDF, downloadBlob } from "../../utils";
import { DEFAULT_VIEWER_CONFIG } from "../../constants";
import styles from "./PDFViewer.module.scss";
import ErrorBoundary from "../ErrorBoundary";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

import { useMemo } from "react";

import { ContentManager, ContentManagerRef } from "../ContentManager";
import { ContentToolbar } from "../ContentToolbar";
import { ContentData } from "../../types/_content";
import {
  ContentFactory,
  DefaultContentConfiguration,
  DefaultContentValidation,
} from "../ContentFactory";
import { ContentFactoryRegistry } from "@/types";
import { DIContainer } from "@/core/di/Container";

const PDFViewer: React.FC<PDFViewerProps> = (props) => {
  const {
    source,
    outputFileName = "document.pdf",
    enableDownload = true,
    enableQRCode = true,
    qrLink = "https://example.com",
    qrCodeImage = "https://placehold.co/150x150/png",
    defaultQRSize = DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
    initialZoom = 1,
    minZoom: dMinzoom = DEFAULT_VIEWER_CONFIG.MIN_ZOOM,
    maxZoom: dMaxzoom = DEFAULT_VIEWER_CONFIG.MAX_ZOOM,
    mergeOutputType = "File",
    onPositionUpdate,
    onViewModeChange,
    onMerge,
    qrCodeGeneratorStrategy,
    initialContent = [],
    onContentChange,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const contentManagerRef = useRef<ContentManagerRef | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [contentData, setContentData] = useState<ContentData[]>([]);

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

  const { pdf, pdfSource, isLoading, error, renderTaskRef } = usePDFLoader(
    source,
    updateViewMode,
  );

  const {
    qrPosition,
    showQRCode,
    setShowQRCode,
    handleDragStart,
    handleDragEnd,
    handleDrag,
  } = useQRCode(enableQRCode, defaultQRSize, onPositionUpdate);

  const handleCanvasRender = useCallback(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector("canvas");
      if (canvas) {
        setCanvasSize({
          width: canvas.width,
          height: canvas.height,
        });
      }
    }
  }, [containerRef]);

  const handlePageChange = useCallback(
    (delta: number) => {
      const newPageNumber = viewMode.pageNumber + delta;
      if (newPageNumber >= 1 && newPageNumber <= viewMode.totalPages) {
        updateViewMode({ pageNumber: newPageNumber });
      }
    },
    [viewMode.pageNumber, viewMode.totalPages, updateViewMode],
  );

  const handleQRSwitch = useCallback(() => {
    if (!viewMode.isModified) {
      setShowQRCode((prev) => !prev);
    }
  }, [viewMode.isModified, setShowQRCode]);

  const handleDownload = useCallback(() => {
    if (!enableDownload || !pdfSource) return;

    if (pdfSource.type === "url") {
      downloadPDF(pdfSource.data as string, outputFileName);
    } else if (pdfSource.type === "blob") {
      const url = URL.createObjectURL(pdfSource.data as Blob);
      downloadPDF(url, outputFileName);
      URL.revokeObjectURL(url);
    } else if (pdfSource.type === "arrayBuffer") {
      const blob = new Blob([pdfSource.data as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      downloadPDF(url, outputFileName);
      URL.revokeObjectURL(url);
    }
  }, [enableDownload, pdfSource, outputFileName]);

  const handleDownloadWithQR = useCallback(async () => {
    if (!showQRCode || !pdfSource) return;

    let arrayBuffer: ArrayBuffer;
    if (pdfSource.type === "url") {
      const response = await fetch(pdfSource.data as string);
      arrayBuffer = await response.arrayBuffer();
    } else if (pdfSource.type === "blob") {
      arrayBuffer = await (pdfSource.data as Blob).arrayBuffer();
    } else {
      arrayBuffer = pdfSource.data as ArrayBuffer;
    }

    const defaultQRStrategy = new StaticQRCodeGenerator(qrCodeImage);
    const strategy = qrCodeGeneratorStrategy || defaultQRStrategy;
    const qrCodeBase64 = await strategy.generate(qrLink, qrPosition);

    const mergedPdf = await mergeQRCodeWithPDF(
      arrayBuffer,
      qrCodeBase64,
      qrPosition,
      outputFileName,
      mergeOutputType,
    );

    if (mergedPdf) {
      if (onMerge) onMerge(mergedPdf);
      if (mergedPdf instanceof Blob) {
        downloadBlob(mergedPdf, outputFileName);
      }
    }
  }, [
    showQRCode,
    pdfSource,
    qrCodeImage,
    qrCodeGeneratorStrategy,
    qrLink,
    qrPosition,
    outputFileName,
    mergeOutputType,
    onMerge,
  ]);

  const toolbarProps = useMemo(
    () => ({
      viewMode,
      showQRCode,
      isQRSwitchDisabled: viewMode.isModified,
      enableDownload,
      onZoomIn: zoomIn,
      onZoomOut: zoomOut,
      onRotate: rotate,
      onResetView: resetView,
      onQRSwitch: handleQRSwitch,
      onPageChange: handlePageChange,
      onDownload: handleDownload,
      onDownloadWithQR: handleDownloadWithQR,
      zoomInput,
      handleZoomInputChange,
      minZoom,
      maxZoom,
    }),
    [
      viewMode,
      showQRCode,
      enableDownload,
      zoomIn,
      zoomOut,
      rotate,
      resetView,
      handleQRSwitch,
      handlePageChange,
      handleDownload,
      handleDownloadWithQR,
      zoomInput,
      handleZoomInputChange,
      minZoom,
      maxZoom,
    ],
  );

  const handleContentChange = useCallback(
    (content: ContentData[]) => {
      setContentData(content);
      onContentChange?.(content);
    },
    [onContentChange],
  );

  const renderContent = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      if (contentManagerRef.current?.renderContent) {
        await contentManagerRef.current.renderContent(
          ctx,
          canvasWidth,
          canvasHeight,
        );
      }
    },
    [contentManagerRef],
  );

  useEffect(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas && !isLoading) {
      renderContent(ctx, canvas.width, canvas.height);
    }
  }, [contentData, isLoading, renderContent]);

  const contentFactory = useMemo(() => {
    console.log("Initializing ContentFactory");
    const diContainer = DIContainer.getInstance();
    const registry = new ContentFactoryRegistry();
    const validation = new DefaultContentValidation();
    const configuration = new DefaultContentConfiguration();
    const factory = new ContentFactory(registry, validation, configuration);

    return factory;
  }, []);

  console.log("contentFactory in PDFViewer:", contentFactory);

  return (
    <div ref={containerRef} className={styles.pdfViewer}>
      <ErrorBoundary>
        <ContentToolbar contentManagerRef={contentManagerRef} />
        <PDFToolbar {...toolbarProps} />

        <div
          className={styles.pdfViewer__canvasContainer}
          style={{ height: DEFAULT_VIEWER_CONFIG.DEFAULT_VIEWER_HEIGHT }}
        >
          {isLoading ? (
            <div className={styles.pdfViewer__spinner} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : error ? (
            <div className={styles.pdfViewer__errorAlert}>
              Error loading PDF: {error.message}
            </div>
          ) : (
            <div className="position-relative">
              <ContentManager
                ref={contentManagerRef}
                contentFactory={contentFactory}
                initialContent={initialContent}
                onChange={handleContentChange}
                canvasRef={canvasRef} // Pass canvasRef to ContentManager
              />
              <PDFCanvas
                ref={canvasRef} // Pass canvasRef to PDFCanvas
                pdf={pdf}
                viewMode={viewMode}
                renderTaskRef={renderTaskRef}
                onRender={() => {
                  handleCanvasRender();
                  const canvas = containerRef.current?.querySelector("canvas");
                  const ctx = canvas?.getContext("2d");
                  if (ctx && canvas) {
                    renderContent(ctx, canvas.width, canvas.height);
                  }
                }}
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
                      canvasSize.height,
                    )
                  }
                  onDragEnd={handleDragEnd}
                />
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default React.memo(PDFViewer);