// File: src/components/ContentToolbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { ContentData } from "../types/_content";

interface ContentToolbarProps {
  contentManagerRef: React.RefObject<HTMLDivElement | null>;
}

export const ContentToolbar: React.FC<ContentToolbarProps> = ({
  contentManagerRef,
}) => {
  const [selectedContentType, setSelectedContentType] = useState<
    ContentData["type"] | null
  >(null);

  const addContent = (data: ContentData) => {
    if (contentManagerRef?.current) {
      const addContentFunc = contentManagerRef.current.dataset.addContent;
      if (addContentFunc) {
        // @ts-ignore
        contentManagerRef.current[addContentFunc](data);
      }
    }
  };

  const handleAddContent = () => {
    if (!selectedContentType) return;

    const id = Date.now().toString(); // Simple unique ID generator
    const baseContentData: Partial<ContentData> = {
      id,
      x: 50, // Default position
      y: 50, // Default position
    };

    switch (selectedContentType) {
      case "image":
        addContent({
          ...baseContentData,
          type: "image",
          src: "https://placehold.co/150x150/png", // Default image
        } as ContentData);
        break;
      case "text":
        addContent({
          ...baseContentData,
          type: "text",
          value: "New Text", // Default text
        } as ContentData);
        break;
      case "qrcode":
        addContent({
          ...baseContentData,
          type: "qrcode",
          link: "https://example.com", // Default link
          size: 20,
          dpi: 300,
        } as ContentData);
        break;
      default:
        break;
    }
  };

  return (
    <div className="content-toolbar">
      <select
        value={selectedContentType || ""}
        onChange={(e) =>
          setSelectedContentType(e.target.value as ContentData["type"])
        }
      >
        <option value="">Select Content Type</option>
        <option value="image">Image</option>
        <option value="text">Text</option>
        <option value="qrcode">QRCode</option>
      </select>
      <button onClick={handleAddContent} disabled={!selectedContentType}>
        Add Content
      </button>
    </div>
  );
};
