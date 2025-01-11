import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import PDFViewerComponent from "./PDFViewer/PDFViewer"; // Import PDFViewer as PDFViewerComponent
import { PDFUploadButton } from "./PDFUpload/PDFUpload";
import { PDFViewerProps } from "@/types"; // Import PDFViewerProps

const meta: Meta<typeof PDFViewerComponent> = {
  title: "Components/PDFControlStory", // Updated title
  component: PDFViewerComponent, // Use PDFViewerComponent
  // Add controls for boolean props
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
      qrCodeImage: "https://placehold.co/150x150/png", // Default: Online URL
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
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const PDFControlStoryTemplate: StoryFn<typeof PDFViewerComponent> = (args) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Handle file selection
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
      {/* Display PDFUploadButton if no file is uploaded */}
      {!uploadedFile ? (
        <PDFUploadButton onFilesSelected={handleFileSelected} variant="zone">
          Upload PDF
        </PDFUploadButton>
      ) : null}

      {/* Display PDFViewer if a file is uploaded */}
      {uploadedFile && (
        <PDFViewerComponent
          {...args}
          source={uploadedFile} // Pass the uploaded file as source
        />
      )}
    </div>
  );
};

export const PDFControlStory = PDFControlStoryTemplate.bind({});

// Default arguments for PDFControlStory
PDFControlStory.args = {
  enableDownload: true,
  enableQRCode: true,
  qrLink: "https://example.com",
  outputFileName: "output.pdf",
  defaultQRSize: 20,
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 3,
} as Partial<PDFViewerProps>;
