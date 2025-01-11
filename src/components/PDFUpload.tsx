import React, { useRef, useState } from "react";

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
    const zoneClasses = [
      "drop-zone",
      "position-relative",
      "p-4",
      "d-flex",
      "flex-column",
      "align-items-center",
      "justify-content-center",
      "border",
      "border-2",
      "rounded",
      isDragging ? "border-primary" : "border-dashed",
      disabled ? "bg-light" : "",
      loading ? "opacity-75" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={zoneClasses}
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
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <>
            <i className="bi bi-cloud-upload fs-1 text-primary mb-2"></i>
            <div className="text-center">
              {children || (
                <>
                  <p className="mb-1">Drop PDF file here or click to upload</p>
                  {hint && <small className="text-muted">{hint}</small>}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Button variant
  const buttonClasses = [
    "btn",
    disabled ? "btn-secondary" : "btn-primary",
    loading ? "disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        type="button"
        className={buttonClasses}
        onClick={handleButtonClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </>
        ) : (
          children || (
            <>
              <i className="bi bi-upload me-2"></i>
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
