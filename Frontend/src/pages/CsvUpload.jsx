import { useState, useRef } from 'react';
import {
  Upload, FileText, X, CheckCircle, AlertTriangle, Info, Download, ArrowRight,
} from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const SAMPLE_ROWS = [
  { date: '2026-01-01', description: 'NETFLIX.COM', amount: '-15.49', merchant: 'Netflix' },
  { date: '2026-01-05', description: 'SPOTIFY PREMIUM', amount: '-9.99', merchant: 'Spotify' },
  { date: '2026-01-10', description: 'Amazon Prime', amount: '-14.99', merchant: 'Amazon' },
  { date: '2026-01-15', description: 'ADOBE CC MONTHLY', amount: '-54.99', merchant: 'Adobe' },
];

function downloadSampleCSV() {
  const header = 'date,description,amount,merchant\n';
  const rows = SAMPLE_ROWS.map((r) => `${r.date},"${r.description}",${r.amount},"${r.merchant}"`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_bank_statement.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function CsvUpload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { detected: [], imported: number, errors: [] }
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await subscriptionAPI.uploadCSV(formData);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed. Please check your file format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">CSV Statement Upload</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload your bank statement CSV to automatically detect subscription payments.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200">
          <p className="font-medium mb-1">How it works</p>
          <p className="text-blue-300/80">
            Upload a CSV export from your bank. The system scans transaction descriptions for known
            subscription keywords and automatically imports them into your subscription list.
            Supported columns: <code className="bg-blue-500/20 px-1 rounded text-xs">date, description, amount, merchant</code>
          </p>
        </div>
      </div>

      {!result ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer ${
              dragging
                ? 'border-blue-500 bg-blue-500/10'
                : file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs transition"
                >
                  <X className="w-3.5 h-3.5" /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Drop your CSV here or click to browse</p>
                  <p className="text-slate-400 text-sm mt-1">Supports .csv files up to 5 MB</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Analyzing…
                </>
              ) : (
                <><Upload className="w-4 h-4" /> Analyze & Import</>
              )}
            </button>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <Download className="w-4 h-4" /> Sample CSV
            </button>
          </div>

          {/* Sample preview table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50">
              <h3 className="text-white text-sm font-medium">Expected CSV Format</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    {['date', 'description', 'amount', 'merchant'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/20">
                  {SAMPLE_ROWS.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-700/20 transition">
                      <td className="px-4 py-2 text-slate-400 text-xs">{r.date}</td>
                      <td className="px-4 py-2 text-slate-300 text-xs">{r.description}</td>
                      <td className="px-4 py-2 text-red-400 text-xs">{r.amount}</td>
                      <td className="px-4 py-2 text-slate-300 text-xs">{r.merchant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Upload result */
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
            <div>
              <p className="text-white font-medium">Analysis complete!</p>
              <p className="text-green-300 text-sm">
                Detected <strong>{result.detected?.length || 0}</strong> subscriptions,
                imported <strong>{result.imported || 0}</strong> new entries.
              </p>
            </div>
          </div>

          {result.detected?.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <h3 className="text-white text-sm font-medium">Detected Subscriptions</h3>
              </div>
              <div className="divide-y divide-slate-700/30">
                {result.detected.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition">
                    <div>
                      <p className="text-white text-sm font-medium">{item.providerName || item.merchant || item.description}</p>
                      <p className="text-slate-400 text-xs">{item.category || 'UNKNOWN'} · {item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">${parseFloat(item.amount || 0).toFixed(2)}</span>
                      {item.imported ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Imported</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-600/50 text-slate-400">Skipped</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-1">
              <p className="text-red-400 text-sm font-medium">Errors</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-red-300/80 text-xs">• {e}</p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
              <Upload className="w-4 h-4" /> Upload Another
            </button>
            <a href="/subscriptions" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
              View Subscriptions <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
