import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ContentElement,
  ContentData,
  ContentFactory as IContentFactory,
} from "../types/_content";
import { ContentFactory } from "./ContentFactory";
import { StrategyProvider } from "@/core/di/StrategyProvider";
import { DIContainer } from "@/core/di/Container";
import { DI_TOKENS } from "@/core/di/tokens";
import { ContentStateManager } from "@/core/state/ContentStateManager";

interface ContentManagerProps {
  contentFactory?: IContentFactory;
  initialContent?: ContentData[];
  onChange?: (content: ContentData[]) => void;
}

// Initialize strategies
StrategyProvider.initialize();

export const ContentManager: React.FC<ContentManagerProps> = ({
  contentFactory = new ContentFactory(
    DIContainer.getInstance().resolve(DI_TOKENS.CONTENT_REGISTRY),
    DIContainer.getInstance().resolve(DI_TOKENS.CONTENT_VALIDATION),
    DIContainer.getInstance().resolve(DI_TOKENS.CONTENT_CONFIGURATION),
  ),
  initialContent = [],
  onChange,
}) => {
  const [contentElements, setContentElements] = useState<ContentElement[]>([]);
  const contentDataRef = useRef<ContentData[]>([]);

  // Subscribe to changes in content elements
  useEffect(() => {
    const subscriptions = contentElements.map((element) => {
      if ("stateManager" in element) {
        return (element.stateManager as ContentStateManager).subscribe(
          (state) => {
            // Handle state changes here, e.g., re-render
            console.log(`State updated for element ${element.id}:`, state);
            setContentElements((prev) => [...prev]);
          },
        );
      }
      return () => {};
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [contentElements]);

  // Khởi tạo các ContentElement từ initialContent
  useEffect(() => {
    const initialElements = initialContent.map((data) =>
      contentFactory.create(data),
    );
    setContentElements(initialElements);
    contentDataRef.current = initialContent;
  }, []);

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
          }
          return element;
        }),
      );
      onChange?.(
        contentElements.map((el) => {
          const data = el.getData();
          return {
            ...data,
          };
        }),
      );
    },
    [onChange, contentElements],
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
