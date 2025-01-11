interface Boundaries {
  width: number;
  height: number;
}

export const calculateValidQRPosition = (
  x: number,
  y: number,
  qrSize: number,
  boundaries: Boundaries,
  margin: number = 0,
): { x: number; y: number } => {
  const maxX = boundaries.width - qrSize - margin;
  const maxY = boundaries.height - qrSize - margin;

  return {
    x: Math.max(margin, Math.min(x, maxX)),
    y: Math.max(margin, Math.min(y, maxY)),
  };
};
