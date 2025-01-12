import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  RefObject,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ContentElement,
  ContentData,
  ContentFactory as IContentFactory,
} from "../types/_content";
import { StrategyProvider } from "@/core/di/StrategyProvider";
import { ContentStateManager } from "@/core/state/ContentStateManager";
import { ContentType } from "@/types";
import { ImageElement } from "./ContentElements";
import { DraggableBehaviorPlugin } from "@/plugins/DraggableBehaviorPlugin";

interface ContentManagerProps {
  contentFactory?: IContentFactory;
  initialContent?: ContentData[];
  onChange?: (content: ContentData[]) => void;
  ref?: RefObject<ContentManagerRef>;
  canvasRef?: RefObject<HTMLCanvasElement>; // Add canvasRef prop
}

export interface ContentManagerRef {
  addContent: (data: ContentData) => void;
  updateContent: (id: string, data: Partial<ContentData>) => void;
  removeContent: (id: string) => void;
  renderContent: (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ) => Promise<void>;
}

// Initialize strategies
StrategyProvider.initialize();

export const ContentManager = forwardRef<
  ContentManagerRef,
  ContentManagerProps
>(({ contentFactory, initialContent = [], onChange, canvasRef }, ref) => {
  const [contentElements, setContentElements] = useState<ContentElement[]>([]);
  const contentDataRef = useRef<ContentData[]>([]);

  // Subscribe to changes in content elements
  useEffect(() => {
    const subscriptions = contentElements.map((element) => {
      const stateManagerSubscription =
        "stateManager" in element
          ? (element.stateManager as ContentStateManager).subscribe((state) => {
              // Update contentDataRef
              contentDataRef.current = contentDataRef.current.map((data) => {
                if (data.id === element.id) {
                  return element.getData();
                }
                return data;
              });
              onChange?.(contentDataRef.current);
            })
          : () => {};

      // Enable dragging if canvasRef is available
      let draggableCleanup: () => void;
      if (canvasRef?.current) {
        const draggablePlugin = new DraggableBehaviorPlugin();
        draggableCleanup = draggablePlugin.enableDragging(
          element,
          canvasRef.current,
        );
      }

      return () => {
        stateManagerSubscription();
        draggableCleanup?.();
      };
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [contentElements, canvasRef]);

  // Khởi tạo các ContentElement từ initialContent
  useEffect(() => {
    console.log("ContentManager useEffect, contentFactory:", contentFactory);
    if (!contentFactory) {
      return;
    }

    const initialElements = initialContent.map((data) =>
      contentFactory.create(data),
    );
    setContentElements(initialElements);
    contentDataRef.current = initialContent;
  }, [contentFactory, initialContent]);

  const addContent = useCallback(
    async (data: ContentData) => {
      if (!contentFactory) {
        console.error("contentFactory is not defined");
        return;
      }

      try {
        const newElement = contentFactory.create(data);

        // Nếu là image element, đợi load xong
        if (newElement.type === ContentType.IMAGE) {
          await (newElement as ImageElement).loadImage();
        }

        setContentElements((prev) => [...prev, newElement]);
        contentDataRef.current = [...contentDataRef.current, data];
        onChange?.(contentDataRef.current);
      } catch (error) {
        console.error("Error adding content:", error);
      }
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

  // Expose methods through ref
  useImperativeHandle(
    ref,
    () => ({
      addContent,
      updateContent,
      removeContent,
      renderContent,
    }),
    [addContent, updateContent, removeContent, renderContent],
  );

  return (
    <>
      {/* Add class name for z-index */}
      {contentElements.map((element) => (
        <div
          key={element.id}
          data-type={element.type}
          className="contentElement"
          style={{
            left: element.getData().x,
            top: element.getData().y,
          }}
        >
          {/* Placeholder for each content element */}
        </div>
      ))}
    </>
  );
});

ContentManager.displayName = "ContentManager";
