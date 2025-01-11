// src/components/PDFToolbar/PDFToolbar.tsx
import React from "react";
import { ViewerMode } from "../../types";
import styles from "./PDFToolbar.module.scss";

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
    <div className={styles.pdfToolbar}>
      <div className={styles.pdfToolbar__buttonGroup}>
        <button
          className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__roundedStart}`}
          onClick={onZoomIn}
          disabled={showQRCode}
        >
          <i className="fa fa-search-plus"></i>
        </button>
        <div className={styles.pdfToolbar__inputGroup}>
          <input
            type="number"
            className={styles.pdfToolbar__inputGroup_input}
            value={zoomInput}
            onChange={(e) => handleZoomInputChange(e.target.value)}
            min={minZoomPercent}
            max={maxZoomPercent}
            disabled={showQRCode}
          />
        </div>
        <button
          className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__roundedEnd}`}
          onClick={onZoomOut}
          disabled={showQRCode}
        >
          <i className="fa fa-search-minus"></i>
        </button>

        <button
          className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__marginLeft}`}
          onClick={onRotate}
          disabled={showQRCode}
        >
          <i className="fa fa-redo"></i>
        </button>
        {viewMode.isModified && (
          <button
            className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__marginLeft}`}
            onClick={onResetView}
            disabled={showQRCode}
            title="Reset View"
          >
            <i className="fa fa-sync"></i>
          </button>
        )}
      </div>

      <div className={styles.pdfToolbar__switchGroup}>
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

        <div className={styles.pdfToolbar__pageInfo}>
          <button
            className={styles.pdfToolbar__button}
            onClick={() => onPageChange(-1)}
            disabled={viewMode.pageNumber <= 1}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <span>
            Page {viewMode.pageNumber} of {viewMode.totalPages}
          </span>
          <button
            className={styles.pdfToolbar__button}
            onClick={() => onPageChange(1)}
            disabled={viewMode.pageNumber >= viewMode.totalPages}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className={styles.pdfToolbar__buttonGroup}>
        {enableDownload && (
          <button
            className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__primary}`}
            onClick={onDownload}
            disabled={showQRCode}
          >
            <i
              className={`${styles.pdfToolbar__button__icon} fa fa-download`}
            ></i>
            Download
          </button>
        )}
        <button
          className={`${styles.pdfToolbar__button} ${styles.pdfToolbar__button__primary}`}
          onClick={onDownloadWithQR}
          disabled={!showQRCode}
        >
          <i className={`${styles.pdfToolbar__button__icon} fa fa-qrcode`}></i>
          Download with QR
        </button>
      </div>
    </div>
  );
};
