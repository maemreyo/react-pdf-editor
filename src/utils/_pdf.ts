import { saveAs } from "file-saver";
import { PDFDocument } from "pdf-lib";
import { QRCodePosition, PDFSource } from "../types";
import { calculateValidQRPosition } from "./_qr";

export const getBase64FromImageUrl = async (
  imageUrl: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx?.drawImage(img, 0, 0);
      const base64DataUrl = canvas.toDataURL("image/png");
      resolve(base64DataUrl);
    };
    img.onerror = () => reject(new Error("Error loading image"));
    img.src = imageUrl;
  });
};

export const mergeQRCodeWithPDF = async (
  pdfSource: ArrayBuffer,
  qrCodeBase64: string,
  qrPosition: QRCodePosition,
  outputFileName: string,
  mergeOutputType: "File" | "Uint8Array" | "Blob" | "Base64" = "File",
): Promise<File | Uint8Array | Blob | string | null> => {
  try {
    const existingPdfBytes = pdfSource;
    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
      ignoreEncryption: true,
    });
    const pages = pdfDoc.getPages();

    const displayQRSize = Math.max((qrPosition.size * qrPosition.dpi) / 96, 5);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      // Use the same validation for the QR position in PDF output
      const validPosition = calculateValidQRPosition(
        qrPosition.x,
        qrPosition.y,
        displayQRSize,
        { width, height },
      );

      const qrImage = await pdfDoc.embedPng(qrCodeBase64);

      page.drawImage(qrImage, {
        x: validPosition.x,
        y: height - validPosition.y - displayQRSize, // Convert coordinate system
        width: displayQRSize,
        height: displayQRSize,
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();

    switch (mergeOutputType) {
      case "Uint8Array":
        return new Uint8Array(modifiedPdfBytes);
      case "Blob":
        return new Blob([modifiedPdfBytes], { type: "application/pdf" });
      case "Base64":
        return btoa(String.fromCharCode(...new Uint8Array(modifiedPdfBytes)));
      default:
        return new File([modifiedPdfBytes], outputFileName, {
          type: "application/pdf",
        });
    }
  } catch (error) {
    console.error("Error merging QR code and PDF:", error);
    return null;
  }
};

export const getPdfUrlFromBlob = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

export const getPdfUrlFromArrayBuffer = (arrayBuffer: ArrayBuffer): string => {
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  return URL.createObjectURL(blob);
};
