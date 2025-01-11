import { saveAs } from "file-saver";

export const downloadPDF = (url: string, fileName: string) => {
  saveAs(url, fileName);
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  saveAs(blob, fileName);
};
