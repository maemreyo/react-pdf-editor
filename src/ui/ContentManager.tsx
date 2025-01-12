// File: ui/ContentManager.tsx
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
import { ImageElement, TextElement, QRCodeElement } from "./ContentElements";
import { DEFAULT_VIEWER_CONFIG } from "@/constants";

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
  const contentDataRef = useRef<ContentData[]>(initialContent);
  const draggingElementId = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
      const updatedContentElements = contentElements.map((element) => {
        if (element.id === id) {
          element.update(data);
        }
        return element;
      });

      setContentElements(updatedContentElements);

      contentDataRef.current = contentDataRef.current.map((c) => {
        if (c.id === id) {
          return { ...c, ...data };
        }
        return c;
      });

      onChange?.(contentDataRef.current);
    },
    [contentElements, onChange],
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

  const getElementSize = (
    element: ContentElement,
  ): { width: number; height: number } => {
    let width = 50; // Default size
    let height = 50; // Default size

    const data = element.getData();

    if (element.type === "image") {
      const imgElement = element as ImageElement;
      if (imgElement.getImage()) {
        width = imgElement.getImage().width;
        height = imgElement.getImage().height;
      }
    } else if (element.type === "qrcode") {
      width = data.size
        ? (data.size * (data.dpi || DEFAULT_VIEWER_CONFIG.DEFAULT_DPI)) / 96
        : DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE;
      height = width;
    } else if (element.type === "text") {
      // Approximating text size - might need a more accurate method
      const textMetrics = measureText(data.value || "", "16px Arial"); // Assuming a default font
      width = textMetrics.width;
      height =
        textMetrics.actualBoundingBoxAscent +
        textMetrics.actualBoundingBoxDescent;
    }
    // Add more conditions for other types if necessary

    return { width, height };
  };

  // Helper function to measure text size (rough approximation)
  const measureText = (text: string, font: string): TextMetrics => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return {} as TextMetrics;
    context.font = font;
    return context.measureText(text);
  };

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const canvasRect = canvasRef?.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;

      // Iterate backwards to check elements on top first
      for (let i = contentElements.length - 1; i >= 0; i--) {
        const element = contentElements[i];
        const data = element.getData();
        const { width, height } = getElementSize(element);

        if (
          mouseX >= data.x &&
          mouseX <= data.x + width &&
          mouseY >= data.y &&
          mouseY <= data.y + height
        ) {
          draggingElementId.current = element.id;
          dragOffset.current = { x: mouseX - data.x, y: mouseY - data.y };
          break; // Stop checking further elements
        }
      }
    },
    [contentElements, canvasRef],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!draggingElementId.current) return;

      const canvasRect = canvasRef?.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;

      const newX = mouseX - dragOffset.current.x;
      const newY = mouseY - dragOffset.current.y;

      updateContent(draggingElementId.current, { x: newX, y: newY });
    },
    [canvasRef, updateContent],
  );

  const handleMouseUp = useCallback(() => {
    draggingElementId.current = null;
    dragOffset.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      canvas.addEventListener("mousedown", handleMouseDown as any);
      canvas.addEventListener("mousemove", handleMouseMove as any);
      canvas.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown as any);
        canvas.removeEventListener("mousemove", handleMouseMove as any);
        canvas.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* No need for the extra div for rendering, as elements are not React components */}
    </>
  );
});

ContentManager.displayName = "ContentManager";
