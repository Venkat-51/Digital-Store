import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { productsService } from '@/services/products.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

interface BulkProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResult {
  message: string;
  success_count: number;
  failed_count: number;
  total_rows: number;
  errors: { row: number; name: string; error: string }[];
}

export const BulkProductUploadModal: React.FC<BulkProductUploadModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await productsService.downloadCSVTemplate();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_bulk_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download CSV template:', err);
      setErrorMessage('Failed to download template. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
        setErrorMessage('Please select a valid .csv file.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
        setErrorMessage('Please drop a valid .csv file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadResult(null);

    try {
      const result = await productsService.bulkUploadProducts(selectedFile);
      setUploadResult(result);
      // Invalidate products query to refresh shop and catalog UI
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to upload products CSV.';
      setErrorMessage(serverMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Product Upload (CSV Import)" size="lg">
      <div className="p-6 space-y-6">
        
        {/* Step 1: Download Template Notice */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-900">Step 1: Download Template</h3>
              <p className="text-xs text-primary-700 font-medium">CSV includes columns: name, description, price, stock, category, imageUrl, sku, brand</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={15} />}
            onClick={handleDownloadTemplate}
            className="flex-shrink-0 bg-white hover:bg-primary-50 text-primary-700 border-primary-200 text-xs"
          >
            Download CSV Template
          </Button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 2: Upload Zone or Results */}
        {!uploadResult ? (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Step 2: Upload CSV File
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50/50 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Upload size={28} />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-extrabold text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Ready for upload ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Click to browse or drop your CSV file here
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Supports UTF-8 CSV files</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="md" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? 'Importing Products...' : 'Start Bulk Import'}
              </Button>
            </div>
          </div>
        ) : (
          /* Step 3: Granular Upload Results */
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Import Complete</h3>
                  <p className="text-xs text-gray-500 font-medium">{uploadResult.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 size={14} /> {uploadResult.success_count} Succeeded
                  </span>
                  {uploadResult.failed_count > 0 && (
                    <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <AlertTriangle size={14} /> {uploadResult.failed_count} Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Row-Level Errors Table */}
              {uploadResult.errors && uploadResult.errors.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span>Row-Level Validation Errors</span>
                    <span>{uploadResult.errors.length} issue(s)</span>
                  </div>
                  <div className="border border-rose-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-rose-50/80 text-rose-900 font-bold border-b border-rose-100">
                          <th className="py-2.5 px-3">Row</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Error Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-50 bg-white">
                        {uploadResult.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                            <td className="py-2 px-3 font-bold text-rose-700">#{err.row}</td>
                            <td className="py-2 px-3 font-bold text-gray-900 max-w-[140px] truncate">{err.name}</td>
                            <td className="py-2 px-3 text-rose-600 font-medium">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span>All rows passed validation and were inserted into Neon PostgreSQL without errors!</span>
                </div>
              )}
            </div>

            {/* Actions after upload */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="md" onClick={handleReset} leftIcon={<RefreshCw size={15} />}>
                Upload Another CSV
              </Button>
              <Button variant="primary" size="md" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
