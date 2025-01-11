import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getPdfUrlFromBlob } from "../utils";
import { PDFSource, ViewerMode } from "../types";

export const usePDFLoader = (
  initialSource: string | Blob | ArrayBuffer,
  updateViewMode: (updates: Partial<ViewerMode>) => void,
) => {
  const [pdf, setPdf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pdfSource, setPdfSource] = useState<PDFSource | null>(null);
  const renderTaskRef = useRef<any>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Xử lý source một lần duy nhất khi component mount hoặc source thay đổi
  useEffect(() => {
    const processSource = async () => {
      try {
        if (typeof initialSource === "string") {
          if (initialSource.startsWith("data:")) {
            const response = await fetch(initialSource);
            const arrayBuffer = await response.arrayBuffer();
            setPdfSource({ type: "arrayBuffer", data: arrayBuffer });
          } else {
            setPdfSource({ type: "url", data: initialSource });
          }
        } else if (initialSource instanceof ArrayBuffer) {
          setPdfSource({ type: "arrayBuffer", data: initialSource });
        } else if (initialSource instanceof Blob) {
          setPdfSource({ type: "blob", data: initialSource });
        }
      } catch (err) {
        setError(err as Error);
      }
    };

    processSource();
  }, [initialSource]);
  // Load PDF khi pdfSource đã được xử lý
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfSource) return;

      setIsLoading(true);
      try {
        let urlToLoad: string | Uint8Array | undefined;

        if (pdfSource.type === "url") {
          urlToLoad = pdfSource.data as string;
        } else if (pdfSource.type === "blob") {
          urlToLoad = getPdfUrlFromBlob(pdfSource.data as Blob);
          blobUrlRef.current = urlToLoad;
        } else if (pdfSource.type === "arrayBuffer") {
          urlToLoad = new Uint8Array(pdfSource.data as ArrayBuffer);
        }

        if (!urlToLoad) {
          throw new Error("Invalid PDF source");
        }

        const loadingTask = pdfjsLib.getDocument(urlToLoad);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);

        // Update totalPages after PDF is loaded
        updateViewMode({ totalPages: pdfDoc.numPages });
      } catch (err) {
        setError(err as Error);
        console.error("Error loading PDF:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [pdfSource, updateViewMode]);

  return { pdf, pdfSource, isLoading, error, renderTaskRef };
};
