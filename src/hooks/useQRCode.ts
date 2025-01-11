import { useState, useCallback, useRef, useEffect } from "react";
import { QRCodePosition } from "../types";
import { DEFAULT_VIEWER_CONFIG } from "../constants";
import { calculateValidQRPosition } from "../utils";

export const useQRCode = (
  enableQRCode: boolean = false,
  defaultQRSize: number = DEFAULT_VIEWER_CONFIG.DEFAULT_QR_SIZE,
  onPositionUpdate?: (position: QRCodePosition) => void,
) => {
  const [qrPosition, setQrPosition] = useState<QRCodePosition>({
    x: 50,
    y: 50,
    size: defaultQRSize,
    dpi: DEFAULT_VIEWER_CONFIG.DEFAULT_DPI,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showQRCode, setShowQRCode] = useState(enableQRCode);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialQRPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setShowQRCode(enableQRCode);
  }, [enableQRCode]);

  const updatePosition = useCallback(
    (newPosition: Partial<QRCodePosition>) => {
      setQrPosition((prev) => {
        const updated = { ...prev, ...newPosition };
        if (onPositionUpdate) {
          onPositionUpdate(updated);
        }
        return updated;
      });
    },
    [onPositionUpdate],
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialQRPos.current = { x: qrPosition.x, y: qrPosition.y };
    },
    [qrPosition.x, qrPosition.y],
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartPos.current = null;
    initialQRPos.current = null;
  }, []);

  const handleDrag = useCallback(
    (
      e: React.MouseEvent,
      canvasRect: DOMRect,
      canvasWidth: number,
      canvasHeight: number,
    ) => {
      if (!isDragging || !dragStartPos.current || !initialQRPos.current) return;

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      // Calculate new position considering the QR size and document boundaries
      const displayQRSize = Math.max(
        (qrPosition.size * qrPosition.dpi) / 96,
        5,
      );
      const validPosition = calculateValidQRPosition(
        initialQRPos.current.x + deltaX,
        initialQRPos.current.y + deltaY,
        displayQRSize,
        { width: canvasWidth, height: canvasHeight },
      );

      updatePosition(validPosition);
    },
    [isDragging, qrPosition.size, qrPosition.dpi, updatePosition],
  );

  return {
    qrPosition,
    isDragging,
    showQRCode,
    setShowQRCode,
    handleDragStart,
    handleDragEnd,
    handleDrag,
    updatePosition,
  };
};
