import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import PDFViewer from "./PDFViewer/PDFViewer";
import { PDFUploadButton } from "./PDFUpload/PDFUpload";
import { PDFViewerProps } from "@/types";

const meta: Meta<typeof PDFViewer> = {
  title: "Components/PDFViewer",
  component: PDFViewer,
  // Add controls for boolean props
  argTypes: {
    source: {
      control: { type: "text" },
      description:
        "The source of the PDF file. Can be a URL, base64 string, Blob, or ArrayBuffer. Leave empty to enable upload from local.",
    },
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
      defaultValue: "/images/qr-code.png",
    },
    qrCodeLink: {
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
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: StoryFn<typeof PDFViewer> = (args) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  return (
    <>
      {(!args.source || !uploadedFile) && (
        <PDFUploadButton onFilesSelected={handleFileSelected} className="mb-3">
          Upload PDF
        </PDFUploadButton>
      )}
      <PDFViewer {...args} source={uploadedFile ? uploadedFile : args.source} />
    </>
  );
};

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  source: "",
} as PDFViewerProps;
