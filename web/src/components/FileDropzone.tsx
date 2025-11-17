import { useCallback, useRef, useState } from "react";

type FileDropzoneProps = {
  label: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  onFiles: (files: File[]) => void;
};

export default function FileDropzone({
  label,
  accept,
  multiple = true,
  required,
  onFiles
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (filesList: FileList | null) => {
      if (!filesList) return;
      const arr = Array.from(filesList);
      onFiles(arr);
    },
    [onFiles]
  );

  return (
    <div
      className={`dropzone ${isDragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      aria-label={label}
    >
      <div className="dropzone-label">
        <strong>{label}</strong>
        <div className="muted">Multiple image files supported</div>
        {required ? <div className="muted required">Image attachments are required</div> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        hidden
      />
    </div>
  );
}

