// File/src/components/QRCodeCanvas/QRCodeCanvas.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { QRCodePosition } from "../../types";
import { calculateValidQRPosition } from "../../utils";
import styles from "./QRCodeCanvas.module.scss";

interface QRCodeCanvasProps {
  qrPosition: QRCodePosition;
  qrCodeImage: string;
  width: number;
  height: number;
  onDragStart: (event: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  qrPosition,
  qrCodeImage,
  width,
  height,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const renderQRCode = useCallback(async () => {
    if (!canvasRef.current || !qrCodeImage) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, width, height);

    const displayQRSize = Math.max((qrPosition.size * qrPosition.dpi) / 96, 5);

    // Validate QR position before rendering
    const validPosition = calculateValidQRPosition(
      qrPosition.x,
      qrPosition.y,
      displayQRSize,
      { width, height },
    );

    return new Promise<void>((resolve) => {
      if (!imageRef.current || imageRef.current.src !== qrCodeImage) {
        setImageLoading(true);
        setImageError(null);

        const newImage = new Image();
        newImage.crossOrigin = "anonymous"; // Important for external URLs
        newImage.src = qrCodeImage;

        newImage.onload = () => {
          imageRef.current = newImage;
          setImageLoading(false);
          if (imageRef.current) {
            context.drawImage(
              imageRef.current,
              validPosition.x,
              validPosition.y,
              displayQRSize,
              displayQRSize,
            );
          }
          resolve();
        };

        newImage.onerror = () => {
          setImageLoading(false);
          setImageError("Error loading QR Code image");
          console.error("Error loading QR Code image:", qrCodeImage);
          resolve();
        };
      } else if (!imageLoading && !imageError && imageRef.current) {
        context.drawImage(
          imageRef.current,
          validPosition.x,
          validPosition.y,
          displayQRSize,
          displayQRSize,
        );
        resolve();
      } else {
        resolve();
      }
    });
  }, [qrPosition, qrCodeImage, width, height, imageLoading, imageError]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      renderQRCode();
    }
  }, [renderQRCode, width, height]);

  return (
    <div className={styles.qrCanvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.qrCanvas}
        onMouseDown={onDragStart}
        onMouseMove={onDrag}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
      />
      {imageLoading && (
        <div className={styles.loadingIndicator}>Loading QR Code...</div>
      )}
      {imageError && <div className={styles.errorIndicator}>{imageError}</div>}
    </div>
  );
};
