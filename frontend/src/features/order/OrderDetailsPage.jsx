import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderService";
import Navbar from "../../components/navbar/Navbar";
 
function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [medicineNames, setMedicineNames] = useState({});
 
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        setOrder(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrderDetails();
  }, [orderId]);
 
  // Fetch medicine names for items that only have medicineId
  useEffect(() => {
    const fetchMedicineName = async (medicineId) => {
      try {
        const response = await fetch(`/api/medicines/${medicineId}`);
        if (response.ok) {
          const medicine = await response.json();
          return medicine.name || "Unknown Medicine";
        }
      } catch (error) {
        console.error(`Error fetching medicine ${medicineId}:`, error);
      }
      return "Medicine Item";
    };
 
    const loadMedicineNames = async () => {
      if (!order?.items || order.items.length === 0) return;
      const ids = Array.from(
        new Set(order.items.map((i) => i.medicineId).filter(Boolean))
      );
      if (ids.length === 0) return;
      const namesMap = {};
      await Promise.all(
        ids.map(async (id) => {
          const name = await fetchMedicineName(id);
          namesMap[id] = name;
        })
      );
      setMedicineNames(namesMap);
    };
 
    loadMedicineNames();
  }, [order]);
 
  if (!order) return <div className="text-center mt-20">Finding order details...</div>;

  // Calculate price breakdown (same logic as checkout)
  const subtotal = order.items?.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0) || 0;
  const gst = Math.round(subtotal * 0.18); // 18% GST
  const delivery = subtotal > 500 ? 0 : 40; // Free delivery for orders > 500
  const total = subtotal + gst + delivery;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate("/orders")} className="text-green-700 border border-green-700 px-4 py-2 rounded mb-6 hover:bg-green-50 transition">
          ← Back to Orders
        </button>
 
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Order Details #{order.id}</h2>
         
          <div className="grid grid-cols-2 gap-4 mb-8 text-gray-700">
            <p><span className="font-semibold">Order Date:</span> {new Date(order.orderDate).toLocaleString()}</p>
            <p><span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.status}
              </span>
            </p>
           
            {/* ✅ NEW FIELD: Expected Delivery Date */}
            <p>
              <span className="font-semibold">Expected Delivery:</span> {
                order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString()
                : "TBD (To be decided)"
              }
            </p>
          </div>
 
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Purchased Items</h3>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-800">
                    {item.medicineName || medicineNames[item.medicineId] || item.batch?.medicine?.name || "Medicine Item"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Qty: {item.quantity}</p>
                  <p className="text-green-700 font-semibold">₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>GST (18%):</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Charge:</span>
              <span>{delivery === 0 ? <span className="text-green-600">Free</span> : `₹${delivery.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-green-700 border-t pt-2 mt-2">
              <span>Total Amount:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default OrderDetailsPage;
 