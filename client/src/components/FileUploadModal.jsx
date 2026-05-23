import React, { useState, useRef } from "react";
import { Upload, X, File, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

const FileUploadModal = ({ isOpen, onClose, onUpload, title = "Upload File", accept = "*", maxFiles = 1 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (success) setSuccess(false);
  };

  const simulateUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUploading(false);
    setSuccess(true);
    
    if (onUpload) {
      // In a MERN app, we send a base64 or a mock url for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
    
    setTimeout(() => {
      onClose();
      setFiles([]);
      setSuccess(false);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal Content */}
      <div
        style={{ position: 'relative', width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '2rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', boxSizing: 'border-box', zIndex: 10001 }}
      >
        {/* Close Button at top-right corner */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'rgba(15,23,42,0.05)', borderRadius: '1rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingRight: '2.5rem' }}>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{title}</h2>
          <p className="text-[#0F172A]/40 text-xs font-bold uppercase tracking-widest mt-1" style={{ margin: 0, fontSize: '10px', color: 'rgba(15,23,42,0.4)', letterSpacing: '0.1em' }}>Cloud Integration Active</p>
        </div>

        <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden`}
            style={{
              height: '180px',
              border: `2px dashed ${dragActive ? '#007A5E' : 'rgba(15,23,42,0.1)'}`,
              backgroundColor: dragActive ? 'rgba(0,122,94,0.05)' : 'rgba(15,23,42,0.02)',
              borderRadius: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={accept}
              multiple={maxFiles > 1}
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />

            <div 
              className="transition-all"
              style={{
                padding: '1rem',
                borderRadius: '1.25rem',
                backgroundColor: dragActive ? '#007A5E' : '#ffffff',
                color: dragActive ? '#ffffff' : '#007A5E',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Upload size={32} />
            </div>

            <div className="text-center">
              <p className="font-black text-[#0F172A]" style={{ margin: 0, fontWeight: 900 }}>Click or drag to upload</p>
              <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-widest mt-1" style={{ margin: 0, fontSize: '9px', color: 'rgba(15,23,42,0.4)', letterSpacing: '0.05em' }}>
                PNG, JPG, SVG up to 10MB
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(15,23,42,0.4)', margin: '0 0 0.25rem 0' }}>Selected File</p>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(15,23,42,0.03)',
                    border: '1px solid rgba(15,23,42,0.05)'
                  }}
                >
                  <div style={{ padding: '0.5rem', borderRadius: '0.75rem', backgroundColor: '#ffffff', color: '#007A5E', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center' }}>
                    {file.type.startsWith('image/') ? <ImageIcon size={18} /> : <File size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: 'rgba(15,23,42,0.4)', textTransform: 'uppercase' }}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {!uploading && !success && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(15,23,42,0.3)', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  {success && <CheckCircle2 size={18} style={{ color: '#007A5E' }} />}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                borderRadius: '1.25rem',
                backgroundColor: 'rgba(15,23,42,0.05)',
                color: '#0F172A',
                fontWeight: 900,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              disabled={files.length === 0 || uploading || success}
              onClick={simulateUpload}
              style={{
                flex: 2,
                padding: '1rem',
                border: 'none',
                borderRadius: '1.25rem',
                backgroundColor: files.length === 0 ? 'rgba(15,23,42,0.1)' : '#007A5E',
                color: files.length === 0 ? 'rgba(15,23,42,0.3)' : '#ffffff',
                fontWeight: 900,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: files.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: files.length === 0 ? 'none' : '0 10px 15px -3px rgba(0, 122, 94, 0.2)'
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  Uploaded
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Confirm Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
