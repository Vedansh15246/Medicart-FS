import React, { useEffect, useState } from "react";
import client from "../../api/client";
import { useToast } from "../../components/ui/Toast";

export default function PrescriptionModal({ order, onClose }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const { showToast } = useToast();

  const userId = order?.userId;
  const userName = order?.user?.fullName || "User";

  useEffect(() => {
    if (!userId) return;
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/prescriptions/user/${userId}`);
        setPrescriptions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch prescriptions", err);
        showToast("Failed to load prescriptions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [userId]);

  const handleDownload = async (prescription) => {
    try {
      setDownloading(prescription.id);
      const res = await client.get(`/api/prescriptions/${prescription.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = prescription.fileName || `prescription_${prescription.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Prescription downloaded", "success");
    } catch (err) {
      console.error("Download failed", err);
      showToast("Failed to download prescription", "error");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "550px" }}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📋 Prescriptions — {userName} (Order #{order?.id})</span>
        </div>

        <div className="modal-body" style={{ padding: "16px", maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#888" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>⏳</div>
              Loading prescriptions...
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "32px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              color: "#856404"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <strong>No prescriptions found</strong>
              <p style={{ margin: "8px 0 0", fontSize: "13px" }}>
                This user has not uploaded any prescriptions yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {prescriptions.map((p, idx) => {
                const uploadDate = p.uploadedDate || p.uploadedAt;
                const dateObj = uploadDate ? new Date(uploadDate) : null;
                const isValid = dateObj && !isNaN(dateObj.getTime());
                const fileSize = p.fileSize ? (p.fileSize / 1024).toFixed(1) + " KB" : "N/A";

                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        📄 {p.fileName || `Prescription ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                        {isValid ? dateObj.toLocaleString() : "Date N/A"} &nbsp;·&nbsp; {fileSize}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(p)}
                      disabled={downloading === p.id}
                      style={{
                        padding: "6px 16px",
                        backgroundColor: downloading === p.id ? "#6c757d" : "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: downloading === p.id ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                        transition: "background 0.2s",
                      }}
                    >
                      {downloading === p.id ? "⏳ Downloading..." : "⬇ Download"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
