
import React from 'react';

interface FileUploaderProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-slate-500 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-2 text-sm text-slate-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">all-trades.csv (from export script)</p>
        </div>
        <input type="file" className="hidden" accept=".csv" onChange={onUpload} />
      </label>
    </div>
  );
};
