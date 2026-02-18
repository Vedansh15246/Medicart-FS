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

  // Check if user came from address page (checkout flow)
  const isCheckoutFlow = sessionStorage.getItem('redirectAfterPrescription') === 'payment';

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
      
      // refresh list
      const list = await client.get('/api/prescriptions')
      setHistory(list.data || [])
      setPrescription()
      
      // Check if user came from address page and needs to redirect to payment
      const redirectTo = sessionStorage.getItem('redirectAfterPrescription');
      if (redirectTo === 'payment') {
        sessionStorage.removeItem('redirectAfterPrescription');
        logger.info("🔄 Redirecting to payment after prescription upload");
        
        // Show success message and redirect after a short delay
        setTimeout(() => {
          navigate('/payment');
        }, 1500);
      }
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

  // Continue to payment page (checkout flow)
  const handleContinueToPayment = () => {
    sessionStorage.removeItem('redirectAfterPrescription');
    navigate('/payment');
  };

  // Check if user already has prescriptions uploaded (can proceed without uploading again)
  const hasPrescriptions = history.length > 0;
  

  return (
    <div className="bg-body-tertiary h-100 w-100 rounded-3 border shadow-sm p-2">
      {/* Checkout flow banner */}
      {isCheckoutFlow && (
        <div style={{
          background: 'linear-gradient(135deg, #e0f2fe, #dbeafe)',
          border: '1px solid #93c5fd',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💊</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#1e40af', fontSize: '15px' }}>
                Prescription Required
              </p>
              <p style={{ margin: 0, color: '#3b82f6', fontSize: '13px' }}>
                {hasPrescriptions 
                  ? 'You already have prescriptions on file. Upload a new one or continue to payment.'
                  : 'Please upload your prescription to proceed with your order.'}
              </p>
            </div>
          </div>
          {hasPrescriptions && (
            <button
              onClick={handleContinueToPayment}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'; }}
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

      {/* Continue to Payment button for checkout flow - shown after a successful upload */}
      {isCheckoutFlow && hasPrescriptions && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 0',
        }}>
          <button
            onClick={handleContinueToPayment}
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.45)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)'; }}
          >
            ✅ Continue to Payment →
          </button>
        </div>
      )}

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