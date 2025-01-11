import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getPdfUrlFromBlob } from "../utils";
import { PDFSource } from "../types";

export const usePDFLoader = (pdfSource: PDFSource | null) => {
  const [pdf, setPdf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const renderTaskRef = useRef<any>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        if (!pdfSource) return;

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
  }, [pdfSource]);

  return { pdf, isLoading, error, renderTaskRef };
};
