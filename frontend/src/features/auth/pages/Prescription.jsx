import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineUploadFile } from "react-icons/md";
import client from "../../../api/client";
import logger from "../../../utils/logger";
import AlertModal from "../../../components/ui/AlertModal";
import { useToast } from '../../../components/ui/Toast';

const Prescription = () => {
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" })
  const { showToast } = useToast()

  // Check if user came from address page (prescription-required checkout flow)
  const isCheckoutFlow = sessionStorage.getItem('redirectAfterPrescription') === 'payment';
  const [hasUploadedInSession, setHasUploadedInSession] = useState(false);

  useEffect(() => {
    logger.info("📝 Prescription component mounted");
    
    const limit = 1024 * 1024 * 5 // 5 mb limit
    if (prescription?.size > limit) {
      setAlertModal({ open: true, title: "File Too Large", message: "File size greater than 5MB not allowed", type: "warning" });
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
      showToast("Prescription uploaded successfully!", "success")
      setHasUploadedInSession(true);
      
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
      const errMsg = err?.response?.data?.message || 'Upload failed'
      setError(errMsg)
      showToast(errMsg, "error", "Upload Failed")
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
  

  const handleContinueToPayment = () => {
    // Clear the redirect flag
    sessionStorage.removeItem('redirectAfterPrescription');
    navigate('/payment');
  };

  return (
    <div className="bg-body-tertiary h-100 w-100 rounded-3 border shadow-sm p-2">

      {/* Checkout Flow Banner */}
      {isCheckoutFlow && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3cd, #fff8e1)',
          border: '1px solid #ffc107',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <div>
              <strong style={{ color: '#856404', fontSize: '14px' }}>Prescription Required</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                {hasUploadedInSession || history.length > 0
                  ? "Your prescription has been uploaded. You can now continue to payment."
                  : "Some medicines in your cart require a valid prescription. Please upload before continuing."}
              </p>
            </div>
          </div>
          {(hasUploadedInSession || history.length > 0) && (
            <button
              onClick={handleContinueToPayment}
              style={{
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(40,167,69,0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              Continue to Payment →
            </button>
          )}
        </div>
      )}

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

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default Prescription;