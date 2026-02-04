import { useEffect, useState } from "react";
import { createMedicine, updateMedicine } from "./adminApi";

const EMPTY_FORM = {
  sku: "",
  name: "",
  category: "Tablet",
  price: "",
  requiresRx: false,
  description: "" // Added field
};

export default function ProductEditorModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (product && isEdit) {
      setForm({
        sku: product.sku || "",
        name: product.name || "",
        category: product.category || "Tablet",
        price: product.price || "",
        requiresRx: product.requiresRx || false,
        description: product.description || "" // Load existing description
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [product, isEdit]);

  // Strictly returns null if product is not provided to prevent crashes
  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price)
    };

    try {
      if (isEdit) {
        await updateMedicine({ id: product.id, data: payload });
      } else {
        await createMedicine(payload);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving medicine:", error);
      alert("Failed to save medicine. Check console for details.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">{isEdit ? "Edit Medicine" : "Add Medicine"}</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <input 
              placeholder="SKU" 
              value={form.sku} 
              onChange={(e) => setForm({ ...form, sku: e.target.value })} 
              required 
            />
            <input 
              placeholder="Medicine Name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Powder">Powder</option>
            </select>
            <input 
              type="number" 
              placeholder="Price (₹)" 
              value={form.price} 
              onChange={(e) => setForm({ ...form, price: e.target.value })} 
              required 
            />
            
            {/* New Description Field */}
            <textarea 
              placeholder="Medical Description & Usage" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="4"
              className="form-textarea"
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
            
            <div className="checkbox-group">
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={form.requiresRx} 
                  onChange={(e) => setForm({ ...form, requiresRx: e.target.checked })} 
                />
                <span>Prescription Required</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Medicine</button>
          </div>
        </form>
      </div>
    </div>
  );
}