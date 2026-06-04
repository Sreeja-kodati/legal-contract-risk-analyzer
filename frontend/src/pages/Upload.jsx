import React, { useState } from 'react';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
    setProgress(0);
    setStatus('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const uploadFile = () => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) {
        return reject(new Error('Please select a PDF file first.'));
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      };

      xhr.onreadystatechange = async () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error('Unable to parse upload response.'));
          }
        } else {
          let message = 'File upload failed.';
          try {
            const response = JSON.parse(xhr.responseText);
            message = response.error || message;
          } catch (e) {
            // ignore parse error
          }
          reject(new Error(message));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload.'));
      };

      xhr.send(formData);
    });
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setStatus('Preparing upload...');
    setErrorMessage('');
    setSuccessMessage('');
    setProgress(0);
    setIsUploading(true);

    try {
      if (!selectedFile) {
        throw new Error('No PDF file selected.');
      }

      setStatus('Uploading PDF...');
      const uploadResponse = await uploadFile();
      setStatus('PDF uploaded successfully. Starting ingestion...');
      setProgress(100);

      const ingestResponse = await fetch('/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfPath: uploadResponse.file?.path,
          contractName: selectedFile.name,
        }),
      });

      if (!ingestResponse.ok) {
        const errorBody = await ingestResponse.json().catch(() => null);
        throw new Error(errorBody?.error || 'Ingestion request failed.');
      }

      const ingestResult = await ingestResponse.json();
      setStatus('Ingestion completed successfully.');
      setSuccessMessage(`Contract ingested successfully: ${ingestResult.contractName || selectedFile.name}`);
    } catch (error) {
      setErrorMessage(error.message || 'Upload failed.');
      setStatus('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Upload Contract PDF</h2>
        <p className="mt-2 text-sm text-slate-600">Upload your contract PDF to extract text, generate embeddings, and ingest it into the contract analyzer.</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">Select PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
        />

        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isUploading ? 'Uploading...' : 'Upload and Ingest'}
        </button>
      </form>

      {status && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">{status}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Progress: {progress}%</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default Upload;
