import { useRef, useState } from "react";

export default function FileDropZone({ file, onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const selectedFile = fileList?.[0];

    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
  };

  return (
    <div className="dropzone-block">
      <input
        ref={inputRef}
        className="hidden-input"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
      />

      <button
        type="button"
        className={`dropzone ${isDragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="dropzone-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M12 3 7.5 7.5l1.4 1.4 2.1-2.1V16h2V6.8l2.1 2.1 1.4-1.4L12 3Z" />
            <path d="M5 14v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4h2v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4h2Z" />
          </svg>
        </span>

        <span className="dropzone-title">
          Drop your document here or click to browse
        </span>
        <span className="dropzone-caption">Accepted formats: PDF, DOCX</span>
      </button>

      {file ? (
        <div className="file-chip" aria-live="polite">
          <div>
            <strong>{file.name}</strong>
            <p>{file.size}</p>
            <p className="file-debug">
              Extension: {file.extension} | MIME: {file.type}
            </p>
          </div>
          <span className="file-chip-badge">Ready</span>
        </div>
      ) : null}
    </div>
  );
}
