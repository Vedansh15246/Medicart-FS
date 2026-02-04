import React, { useEffect, useState } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import client from "../../../api/client";
import logger from "../../../utils/logger";

const Prescription = () => {

  const [prescription, setPrescription] = useState()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    logger.info("📝 Prescription component mounted");
    
    const limit = 1024 * 1024 * 5 // 5 mb limit
    if (prescription?.size > limit) {
      alert("File size greater than 5mb not allowed")
      setPrescription()
    }

    // fetch user's prescription history when component mounts or file selection changes
    const loadHistory = async () => {
      try {
        setLoading(true)
        logger.info("📋 Loading prescription history...");
        const res = await client.get('/api/prescriptions')
        logger.info("✅ Prescription history loaded", { count: res.data?.length || 0 });
        setHistory(res.data || [])
      } catch (err) {
        logger.error('Failed to load prescriptions', err.response?.data || err.message);
        setError(err?.response?.data?.message || 'Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()

  }, [prescription])

  


  // remove placeholder submit; use handleUpload for form submit

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!prescription) return
    try {
      setLoading(true)
      logger.info("📤 Starting prescription upload", { fileName: prescription.name, size: prescription.size });
      
      const fd = new FormData()
      fd.append('file', prescription)
      
      const res = await client.post('/api/prescriptions', fd)
      logger.info("✅ Prescription uploaded successfully", { fileName: prescription.name });
      
      // refresh list
      const list = await client.get('/api/prescriptions')
      setHistory(list.data || [])
      setPrescription()
    } catch (err) {
      logger.error('Upload failed', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data
      });
      setError(err?.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const res = await client.get(`/api/prescriptions/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || `prescription_${id}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      setError(err?.response?.data?.message || 'Download failed')
    }
  }
  

  return (
    <div className="bg-body-tertiary h-100 w-100 rounded-3 border shadow-sm p-2">
      <div className="border-bottom w-100 pb-1 mb-2">
        <span className="fs-5 fw-bold text-secondary"> Upload Prescription </span>
      </div>

      <div>
        <form onSubmit={handleUpload}>
          <div className="py-5 d-flex items-center content-center flex-col gap-3">
            <input type="file" name="upload-perscription" id="upload" hidden accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => setPrescription(e.target.files[0])} />
            <div className="flex gap-2 flex-col">
              <button type="button" className="btn btn-success text-white">
                <label htmlFor="upload" className="d-flex gap-1 align-items-center cursor-pointer">
                  Select Prescription &nbsp;
                  <MdOutlineUploadFile className="fs-5" />
                </label>
              </button>
              {!!prescription && (
                <React.Fragment>
                  <span>
                    <strong>File:</strong> {prescription?.name}
                  </span>
                </React.Fragment>
              )}
            </div>
            <div className="mt-3">
              {!!prescription && (
                <button type="submit" className="btn btn-success">
                  Upload Prescription 
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="my-5"></div>

      <div className="border-bottom w-100 pb-1 mb-2">
        <span className="fs-5 fw-bold text-secondary"> Prescription History </span>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#ffffff' }}>
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th scope="col">#</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Prescription</th>
                <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3}>Loading...</td>
              </tr>
            )}
            {!loading && history && history.length === 0 && (
              <tr>
                <td colSpan={3}>No prescriptions uploaded yet.</td>
              </tr>
            )}
            {!loading && history && history.map((p, idx) => {
              // ✅ Safely parse the date
              const uploadDate = p.uploadedAt ? new Date(p.uploadedAt) : null;
              const isValidDate = uploadDate && uploadDate instanceof Date && !isNaN(uploadDate.getTime());
              
              return (
              <tr key={p.id}>
                <th scope="row">{idx + 1}</th>
                <td>{isValidDate ? uploadDate.toLocaleDateString() : 'N/A'}</td>
                <td>{isValidDate ? uploadDate.toLocaleTimeString() : 'N/A'}</td>
                <td>{p.fileName || 'Prescription'}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleDownload(p.id, p.fileName)}
                      style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none' }}
                    >
                      Download
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prescription;