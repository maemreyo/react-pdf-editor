import React, { useState } from "react";
import { ContentData } from "../types/_content";
import { ContentManagerRef } from "./ContentManager";

interface ContentToolbarProps {
  contentManagerRef: React.RefObject<ContentManagerRef | null>;
}

export const ContentToolbar: React.FC<ContentToolbarProps> = ({
  contentManagerRef,
}) => {
  const [selectedContentType, setSelectedContentType] = useState<
    ContentData["type"] | null
  >(null);

  const handleAddContent = () => {
    console.log("handleAddContent called");
    console.log("contentManagerRef.current:", contentManagerRef.current);
    if (!selectedContentType) return;

    const id = Date.now().toString(); // Simple unique ID generator
    const baseContentData: Partial<ContentData> = {
      id,
      x: 50, // Default position
      y: 50, // Default position
    };

    switch (selectedContentType) {
      case "image": {
        console.log("Adding image...");
        contentManagerRef.current?.addContent({
          ...baseContentData,
          type: "image",
          src: "https://placehold.co/150x150/png", // Default image
        } as ContentData);
        break;
      }
      case "text": {
        console.log("Adding text...");
        contentManagerRef.current?.addContent({
          ...baseContentData,
          type: "text",
          value: "New Text", // Default text
        } as ContentData);
        break;
      }
      case "qrcode": {
        console.log("Adding qrcode...");
        contentManagerRef.current?.addContent({
          ...baseContentData,
          type: "qrcode",
          link: "https://example.com", // Default link
        } as ContentData);
        break;
      }
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
