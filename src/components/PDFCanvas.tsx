import React, { useRef, useEffect, useCallback } from "react";
import { ViewerMode } from "../types";

interface PDFCanvasProps {
  pdf: any;
  viewMode: ViewerMode;
  renderTaskRef: React.MutableRefObject<any>;
  onRender?: () => void;
}

export const PDFCanvas: React.FC<PDFCanvasProps> = ({
  pdf,
  viewMode,
  renderTaskRef,
  onRender,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRenderTask = useRef<any>(null);

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;

    try {
      if (currentRenderTask.current) {
        await currentRenderTask.current.cancel();
      }

      const page = await pdf.getPage(viewMode.pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const viewport = page.getViewport({
        scale: viewMode.zoom,
        rotation: viewMode.rotation,
      });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      currentRenderTask.current = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      renderTaskRef.current = currentRenderTask.current;

      await currentRenderTask.current.promise;

      if (onRender) {
        onRender();
      }
    } catch (error) {
      if (error?.name !== "RenderingCancelledException") {
        console.error("Error rendering page:", error);
      }
    }
  }, [pdf, viewMode, renderTaskRef, onRender]);

  useEffect(() => {
    renderPage();

    return () => {
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }
    };
  }, [renderPage, viewMode.pageNumber, viewMode.zoom, viewMode.rotation]);

  return (
    <canvas
      ref={canvasRef}
      className="pdf-canvas"
      style={{
        width: "100%",
        display: "block",
        transition: "0.3s ease-in-out",
      }}
    />
  );
};
