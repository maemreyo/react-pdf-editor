import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import PDFViewer from "./PDFViewer";
import { PDFUploadButton } from "../PDFUpload/PDFUpload";
import { PDFViewerProps } from "@/types";
import { DEFAULT_VIEWER_CONFIG } from "@/constants";

const meta: Meta<typeof PDFViewer> = {
  title: "Components/PDFViewer",
  component: PDFViewer,
  argTypes: {
    outputFileName: {
      control: { type: "text" },
      defaultValue: "document.pdf",
    },
    enableDownload: {
      control: { type: "boolean" },
      defaultValue: true,
    },
    enableQRCode: {
      control: { type: "boolean" },
      defaultValue: true,
    },
    qrCodeImage: {
      control: { type: "text" },
      defaultValue: "https://placehold.co/150x150/png",
    },
    qrLink: {
      control: { type: "text" },
      defaultValue: "https://example.com",
    },
    defaultQRSize: {
      control: { type: "number" },
      defaultValue: DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
    },
    initialZoom: {
      control: { type: "number" },
      defaultValue: 1,
    },
    minZoom: {
      control: { type: "number" },
      defaultValue: DEFAULT_VIEWER_CONFIG.MIN_ZOOM,
    },
    maxZoom: {
      control: { type: "number" },
      defaultValue: DEFAULT_VIEWER_CONFIG.MAX_ZOOM,
    },
    mergeOutputType: {
      control: { type: "select" },
      options: ["File", "Uint8Array", "Blob", "Base64"],
      defaultValue: "File",
    },
    onPositionUpdate: { action: "onPositionUpdate" },
    onViewModeChange: { action: "onViewModeChange" },
    onMerge: { action: "onMerge" },
    qrCodeGeneratorStrategy: {
      control: { type: "object" },
    },
    initialContent: {
      control: "object",
      defaultValue: [],
    },
    onContentChange: { action: "onContentChange" },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const PDFViewerTemplate: StoryFn<typeof PDFViewer> = (args) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {!uploadedFile ? (
        <PDFUploadButton onFilesSelected={handleFileSelected} variant="zone">
          Upload PDF
        </PDFUploadButton>
      ) : (
        <PDFViewer {...args} source={uploadedFile} />
      )}
    </div>
  );
};

export const Default = PDFViewerTemplate.bind({});

Default.args = {
  enableDownload: true,
  enableQRCode: true,
  qrLink: "https://example.com",
  outputFileName: "output.pdf",
  defaultQRSize: DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
  initialZoom: 1,
  minZoom: DEFAULT_VIEWER_CONFIG.MIN_ZOOM,
  maxZoom: DEFAULT_VIEWER_CONFIG.MAX_ZOOM,
  initialContent: [],
  onContentChange: undefined,
} as Partial<PDFViewerProps>;
