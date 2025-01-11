import { useState, useCallback, useEffect } from "react";
import { ViewerMode } from "../types";
import { DEFAULT_VIEWER_CONFIG } from "../constants";

export const useViewerMode = (
  onViewModeChange?: (mode: ViewerMode) => void,
  initialZoom: number = 1,
  minZoom: number = DEFAULT_VIEWER_CONFIG.MIN_ZOOM,
  maxZoom: number = DEFAULT_VIEWER_CONFIG.MAX_ZOOM,
) => {
  const [viewMode, setViewMode] = useState<ViewerMode>({
    zoom: initialZoom,
    rotation: 0,
    pageNumber: 1,
    totalPages: 0,
    isModified: false,
  });
  const [zoomInput, setZoomInput] = useState<string>(
    (initialZoom * 100).toFixed(0),
  );

  const validateZoom = useCallback(
    (zoom: number): number => {
      return Math.min(Math.max(zoom, minZoom), maxZoom);
    },
    [minZoom, maxZoom],
  );

  const updateViewMode = useCallback(
    (updates: Partial<ViewerMode>) => {
      setViewMode((prev) => {
        const validatedUpdates = {
          ...updates,
          zoom:
            updates.zoom !== undefined ? validateZoom(updates.zoom) : prev.zoom,
        };

        const newMode = {
          ...prev,
          ...validatedUpdates,
          isModified:
            (validatedUpdates.zoom !== undefined &&
              validatedUpdates.zoom !== 1) ||
            (validatedUpdates.rotation !== undefined &&
              validatedUpdates.rotation !== 0) ||
            (updates.pageNumber !== undefined &&
              updates.pageNumber !== prev.pageNumber),
        };

        if (onViewModeChange) {
          onViewModeChange(newMode);
        }

        return newMode;
      });
    },
    [onViewModeChange, validateZoom],
  );

  const zoomIn = useCallback(() => {
    updateViewMode({
      zoom: validateZoom(viewMode.zoom + DEFAULT_VIEWER_CONFIG.ZOOM_STEP),
    });
  }, [viewMode.zoom, updateViewMode, validateZoom]);

  const zoomOut = useCallback(() => {
    updateViewMode({
      zoom: validateZoom(viewMode.zoom - DEFAULT_VIEWER_CONFIG.ZOOM_STEP),
    });
  }, [viewMode.zoom, updateViewMode, validateZoom]);

  const rotate = useCallback(() => {
    updateViewMode({
      rotation: (viewMode.rotation + DEFAULT_VIEWER_CONFIG.ROTATION_STEP) % 360,
    });
  }, [viewMode.rotation, updateViewMode]);

  const resetView = useCallback(() => {
    updateViewMode({
      zoom: 1,
      rotation: 0,
      isModified: false,
    });
  }, [updateViewMode]);

  useEffect(() => {
    setZoomInput(viewMode.zoom ? (viewMode.zoom * 100).toFixed(0) : "");
  }, [viewMode.zoom]);

  const handleZoomInputChange = useCallback(
    (value: string) => {
      setZoomInput(value);
      const parsedZoom = parseFloat(value);
      if (!isNaN(parsedZoom)) {
        updateViewMode({ zoom: parsedZoom / 100 });
      }
    },
    [updateViewMode],
  );

  return {
    viewMode,
    updateViewMode,
    zoomIn,
    zoomOut,
    rotate,
    resetView,
    zoomInput,
    handleZoomInputChange,
    minZoom,
    maxZoom,
  };
};
