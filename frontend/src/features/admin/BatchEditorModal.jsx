import { useEffect, useState } from "react";
import { createBatch, updateBatch } from "./batchApi";

const EMPTY_BATCH = {
  medicineId: "",
  batchNo: "",
  expiryDate: "",
  qtyAvailable: ""
};

export default function BatchEditorModal({ batch, medicines, onClose, onSaved }) {
  const isEdit = Boolean(batch?.id);
  const [form, setForm] = useState(EMPTY_BATCH);
  
  // 1. Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIX: Ensure medicines is always an array to prevent .map() errors
  const medicineList = Array.isArray(medicines) ? medicines : [];

  useEffect(() => {
    if (batch && isEdit) {
      setForm({
        ...batch,
        medicineId: batch.medicine?.id || "" 
      });
    } else {
      setForm(EMPTY_BATCH);
    }
  }, [batch, isEdit]);

  if (!batch) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 2. Start loading
    setIsLoading(true);

    try {
      const payload = {
        batchNo: form.batchNo,
        expiryDate: form.expiryDate,
        qtyAvailable: parseInt(form.qtyAvailable),
        medicine: {
          id: parseInt(form.medicineId)
        }
      };

      if (isEdit) {
        await updateBatch({ id: batch.id, data: payload });
      } else {
        await createBatch(payload);
      }
      
      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save batch:", error);
    } finally {
      // 3. Stop loading
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">{isEdit ? "Edit Batch" : "Add Batch"}</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>Select Medicine</label>
            <select 
              value={form.medicineId} 
              onChange={(e) => setForm({ ...form, medicineId: e.target.value })} 
              disabled={isLoading} 
              required
            >
              <option value="">-- Choose Medicine --</option>
              {/* ✅ Use the safe medicineList instead of medicines */}
              {medicineList.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <input 
              placeholder="Batch Number" 
              value={form.batchNo} 
              onChange={(e) => setForm({ ...form, batchNo: e.target.value })} 
              disabled={isLoading}
              required 
            />

            <label>Expiry Date</label>
            <input 
              type="date" 
              value={form.expiryDate} 
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
              disabled={isLoading}
              required 
            />

            <input 
              type="number" 
              placeholder="Quantity Available" 
              value={form.qtyAvailable} 
              onChange={(e) => setForm({ ...form, qtyAvailable: e.target.value })} 
              disabled={isLoading}
              required 
            />
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Save Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}