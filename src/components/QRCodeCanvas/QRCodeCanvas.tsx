import React, { useRef, useEffect } from "react";
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

  const renderQRCode = async () => {
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
      if (!imageRef.current) {
        imageRef.current = new Image();
        imageRef.current.src = qrCodeImage;
        imageRef.current.onload = () => {
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
      } else {
        context.drawImage(
          imageRef.current,
          validPosition.x,
          validPosition.y,
          displayQRSize,
          displayQRSize,
        );
        resolve();
      }
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      renderQRCode();
    }
  }, [qrPosition, qrCodeImage, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.qrCanvas}
      onMouseDown={onDragStart}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    />
  );
};
