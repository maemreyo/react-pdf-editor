import React from "react";
import { ViewerMode } from "../types";

interface PDFToolbarProps {
  viewMode: ViewerMode;
  showQRCode: boolean;
  isQRSwitchDisabled: boolean;
  enableDownload: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onResetView: () => void;
  onQRSwitch: () => void;
  onPageChange: (delta: number) => void;
  onDownload: () => void;
  onDownloadWithQR: () => void;
  zoomInput: string;
  handleZoomInputChange: (value: string) => void;
  minZoom: number;
  maxZoom: number;
}

export const PDFToolbar: React.FC<PDFToolbarProps> = ({
  viewMode,
  showQRCode,
  isQRSwitchDisabled,
  enableDownload,
  onZoomIn,
  onZoomOut,
  onRotate,
  onResetView,
  onQRSwitch,
  onPageChange,
  onDownload,
  onDownloadWithQR,
  zoomInput,
  handleZoomInputChange,
  minZoom,
  maxZoom,
}) => {
  const minZoomPercent = Math.round(minZoom * 100);
  const maxZoomPercent = Math.round(maxZoom * 100);
  return (
    <div className="pdf-toolbar position-sticky top-0 start-0 w-100 bg-light shadow p-2 d-flex justify-content-between align-items-center">
      <div className="btn-group">
        <button
          className="btn btn-sm btn-outline-primary rounded-start me-0"
          onClick={onZoomIn}
          disabled={showQRCode}
        >
          <i className="fa fa-search-plus"></i>
        </button>
        <div className="input-group" style={{ width: "80px" }}>
          <input
            type="number"
            className="form-control form-control-sm text-center"
            value={zoomInput}
            onChange={(e) => handleZoomInputChange(e.target.value)}
            min={minZoomPercent}
            max={maxZoomPercent}
            disabled={showQRCode}
          />
        </div>
        <button
          className="btn btn-sm btn-outline-primary rounded-end me-0"
          onClick={onZoomOut}
          disabled={showQRCode}
        >
          <i className="fa fa-search-minus"></i>
        </button>

        <button
          className="btn btn-sm btn-outline-primary ms-2"
          onClick={onRotate}
          disabled={showQRCode}
        >
          <i className="fa fa-redo"></i>
        </button>
        {viewMode.isModified && (
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={onResetView}
            disabled={showQRCode}
            title="Reset View"
          >
            <i className="fa fa-sync"></i>
          </button>
        )}
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="qrSwitch"
            checked={showQRCode}
            onChange={onQRSwitch}
            disabled={isQRSwitchDisabled}
          />
          <label className="form-check-label" htmlFor="qrSwitch">
            Show QR Code
          </label>
        </div>

        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => onPageChange(-1)}
            disabled={viewMode.pageNumber <= 1}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <span>
            Page {viewMode.pageNumber} of {viewMode.totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-primary ms-2"
            onClick={() => onPageChange(1)}
            disabled={viewMode.pageNumber >= viewMode.totalPages}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="d-flex gap-2">
        {enableDownload && (
          <button
            className="btn btn-sm btn-primary"
            onClick={onDownload}
            disabled={showQRCode}
          >
            <i className="fa fa-download me-1"></i>
            Download
          </button>
        )}
        <button
          className="btn btn-sm btn-primary"
          onClick={onDownloadWithQR}
          disabled={!showQRCode}
        >
          <i className="fa fa-qrcode me-1"></i>
          Download with QR
        </button>
      </div>
    </div>
  );
};
