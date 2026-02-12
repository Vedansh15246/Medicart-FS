import { useState, useEffect } from "react";
import { orderService } from "../../api/orderService";
import AlertModal from "../../components/ui/AlertModal";

export default function OrderStatusModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: "Pending",
    deliveryDate: ""
  });
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (order) {
      setForm({
        status: order.status || "Pending",
        deliveryDate: order.deliveryDate || ""
      });
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint to update order status/date
      await orderService.updateOrder(order.id, form);
      onSaved();
      onClose();
    } catch (error) {
      setAlertModal({ open: true, title: "Error", message: "Failed to update order", type: "error" });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">Update Order #{order.id}</div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>Order Status</label>
            <select 
              value={form.status} 
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <label>Expected Delivery Date</label>
            <input 
              type="date" 
              value={form.deliveryDate} 
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              required 
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Update Order</button>
          </div>
        </form>
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
}