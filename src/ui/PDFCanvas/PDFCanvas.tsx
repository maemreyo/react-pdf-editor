// File: ui/PDFCanvas/PDFCanvas.tsx
import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ViewerMode } from "../../types";
import styles from "./PDFCanvas.module.scss";

interface PDFCanvasProps {
  pdf: any;
  viewMode: ViewerMode;
  renderTaskRef: React.MutableRefObject<any>;
  onRender?: () => void;
}

// Add forwardRef and useImperativeHandle to expose the canvas element
export const PDFCanvas = forwardRef<HTMLCanvasElement, PDFCanvasProps>(
  ({ pdf, viewMode, renderTaskRef, onRender }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentRenderTask = useRef<any>(null);

    // Expose the canvas element through the ref
    useImperativeHandle(ref, () => canvasRef.current!, []);

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
      } catch (error: any) {
        if (error?.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", error);
        }
      }
    }, [pdf, viewMode, renderTaskRef]);

    useEffect(() => {
      renderPage();

      return () => {
        if (currentRenderTask.current) {
          currentRenderTask.current.cancel();
        }
      };
    }, [renderPage, viewMode.pageNumber, viewMode.zoom, viewMode.rotation]);

    return <canvas ref={canvasRef} className={styles.pdfCanvas} />;
  },
);

PDFCanvas.displayName = "PDFCanvas";
