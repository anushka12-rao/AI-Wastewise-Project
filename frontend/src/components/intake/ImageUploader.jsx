import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export default function ImageUploader({ imageBase64, onImageSelected, onClearImage, disabled }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_MB = 5;

  const processFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Invalid format. Please upload JPEG, PNG, or WebP images only.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected(reader.result);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the image file. Please try another one.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {imageBase64 ? (
        <div className="relative rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-900/5 aspect-video sm:aspect-auto sm:h-72 flex items-center justify-center group shadow-sm">
          <img
            src={imageBase64}
            alt="Waste item intake preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={onClearImage}
            disabled={disabled}
            className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/80 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="font-semibold text-slate-800 text-sm sm:text-base">
            Click to upload photo or drag & drop
          </p>
          <p className="text-xs text-slate-500 mt-1">
            JPEG, PNG, or WebP up to 5MB (processed transiently in-memory)
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
