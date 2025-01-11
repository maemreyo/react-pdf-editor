import React, { useRef, useState } from "react";
import styles from "./PDFUpload.module.scss";

// Types
interface PDFUploadButtonProps {
  onFilesSelected: (files: File[]) => void;
  variant?: "button" | "zone";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  hint?: string;
  accept?: string;
  children?: React.ReactNode;
}

// PDF Upload Button/Zone Component
export const PDFUploadButton: React.FC<PDFUploadButtonProps> = ({
  onFilesSelected,
  variant = "button",
  disabled = false,
  loading = false,
  className = "",
  hint,
  accept = ".pdf,application/pdf",
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || loading) return;

    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleButtonClick = () => {
    if (disabled || loading) return;
    fileInputRef.current?.click();
  };

  if (variant === "zone") {
    return (
      <div
        className={`${styles.dropZone} ${
          isDragging ? styles.dropZone__dragging : ""
        } ${disabled ? styles.dropZone__disabled : ""} ${className}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !loading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="d-none"
          disabled={disabled || loading}
        />

        {loading ? (
          <div className={styles.spinner} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <>
            <i className={`${styles.uploadIcon} bi bi-cloud-upload`}></i>
            <div className={styles.uploadText}>
              {children || (
                <>
                  <p className={styles.uploadText__paragraph}>
                    Drop PDF file here or click to upload
                  </p>
                  {hint && (
                    <small className={styles.uploadText__hint}>{hint}</small>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Button variant
  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${
          disabled ? styles.button__secondary : styles.button__primary
        } ${loading ? styles.button__disabled : ""} ${className}`}
        onClick={handleButtonClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <span
              className={`${styles.spinner} ${styles.spinner__small}`}
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </>
        ) : (
          children || (
            <>
              <i className={`${styles.button__icon} bi bi-upload`}></i>
              Upload PDF
            </>
          )
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="d-none"
        disabled={disabled || loading}
      />
    </>
  );
};
