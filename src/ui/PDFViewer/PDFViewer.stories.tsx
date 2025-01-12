import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import PDFViewerComponent from "./PDFViewer";
import { PDFUploadButton } from "../PDFUpload/PDFUpload";
import { PDFViewerProps } from "@/types";

const meta: Meta<typeof PDFViewerComponent> = {
  title: "Components/PDFControlStory",
  component: PDFViewerComponent,

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
      qrCodeImage: "https://placehold.co/150x150/png",
    },
    qrLink: {
      control: { type: "text" },
      defaultValue: "https://example.com",
    },
    defaultQRSize: {
      control: { type: "number" },
      defaultValue: 20,
    },
    initialZoom: {
      control: { type: "number" },
      defaultValue: 1,
    },
    minZoom: {
      control: { type: "number" },
      defaultValue: 0.5,
    },
    maxZoom: {
      control: { type: "number" },
      defaultValue: 3,
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

const PDFControlStoryTemplate: StoryFn<typeof PDFViewerComponent> = (args) => {
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
      ) : null}

      {uploadedFile && <PDFViewerComponent {...args} source={uploadedFile} />}
    </div>
  );
};

export const PDFControlStory = PDFControlStoryTemplate.bind({});

PDFControlStory.args = {
  enableDownload: true,
  enableQRCode: true,
  qrLink: "https://example.com",
  outputFileName: "output.pdf",
  defaultQRSize: 20,
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 3,
  initialContent: [],
  onContentChange: undefined,
} as Partial<PDFViewerProps>;
