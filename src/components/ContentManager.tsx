// File: src/components/ContentManager.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ContentElement,
  ContentData,
  ContentFactory as IContentFactory,
} from "../types/_content";
import { ContentFactory as NewContentFactory } from "./ContentFactory";

interface ContentManagerProps {
  contentFactory?: IContentFactory;
  initialContent?: ContentData[];
  onChange?: (content: ContentData[]) => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  contentFactory = new NewContentFactory(), // Use the new ContentFactory
  initialContent = [],
  onChange,
}) => {
  const [contentElements, setContentElements] = useState<ContentElement[]>([]);
  const contentDataRef = useRef<ContentData[]>([]);

  // Khởi tạo các ContentElement từ initialContent
  useEffect(() => {
    const initialElements = initialContent.map((data) =>
      contentFactory.create(data),
    );
    setContentElements(initialElements);
    contentDataRef.current = initialContent;
  }, [initialContent, contentFactory]);

  const addContent = useCallback(
    (data: ContentData) => {
      const newElement = contentFactory.create(data);
      setContentElements((prev) => [...prev, newElement]);
      contentDataRef.current = [...contentDataRef.current, data];
      onChange?.(contentDataRef.current);
    },
    [contentFactory, onChange],
  );

  const updateContent = useCallback(
    (id: string, data: Partial<ContentData>) => {
      setContentElements((prev) =>
        prev.map((element) => {
          if (element.id === id) {
            element.update(data);
            // Update corresponding data in contentDataRef
            const updatedData = element.getData();
            contentDataRef.current = contentDataRef.current.map((d) =>
              d.id === id ? updatedData : d,
            );
          }
          return element;
        }),
      );
      onChange?.(contentDataRef.current);
    },
    [onChange],
  );

  const removeContent = useCallback(
    (id: string) => {
      setContentElements((prev) => prev.filter((element) => element.id !== id));
      contentDataRef.current = contentDataRef.current.filter(
        (data) => data.id !== id,
      );
      onChange?.(contentDataRef.current);
    },
    [onChange],
  );

  const renderContent = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      await Promise.all(
        contentElements.map((element) =>
          element.render(ctx, canvasWidth, canvasHeight),
        ),
      );
    },
    [contentElements],
  );

  return (
    <>
      {/* Hidden placeholder for rendering, actual rendering will be done in PDFViewer */}
      <div style={{ display: "none" }}>
        {contentElements.map((element) => (
          <div key={element.id} data-type={element.type}>
            {/* Placeholder for each content element */}
          </div>
        ))}
      </div>
      {/* Expose methods for external control */}
      {/* These methods will be used by ContentToolbar */}
      <div
        style={{ display: "none" }}
        data-add-content={addContent}
        data-update-content={updateContent}
        data-remove-content={removeContent}
        data-render-content-func={renderContent}
      ></div>
    </>
  );
};
