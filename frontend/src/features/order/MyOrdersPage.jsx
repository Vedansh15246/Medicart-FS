import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderService";
import Navbar from "../../components/navbar/Navbar";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => {
        console.log("Order Data Received:", res);
        setOrders(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error("Fetch Orders Error:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          navigate("/login"); // Redirect to login if not authenticated
        } else {
          setError("Failed to load orders. Please try again later.");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-green-700 mb-8">My Orders</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading history...</p>
        ) : error ? (
          <p className="text-red-500 bg-red-50 p-4 rounded">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              // Calculate price breakdown (same logic as checkout)
              const subtotal = order.items?.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0) || 0;
              const gst = Math.round(subtotal * 0.18); // 18% GST
              const delivery = subtotal > 500 ? 0 : 40; // Free delivery for orders > 500
              const total = subtotal + gst + delivery;

              return (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between border-b pb-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                    <p className="text-xs text-gray-400">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : "Date N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-700 font-bold text-xl">₹{total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Incl. GST & Delivery</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.batch?.medicine?.name || "Medicine Item"} x {item.quantity}
                      </span>
                      <span className="font-medium text-gray-700">
                        ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="mt-3 pt-3 border-t space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>{delivery === 0 ? <span className="text-green-600">Free</span> : `₹${delivery.toFixed(2)}`}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="mt-4 w-full py-2 bg-green-50 text-green-700 rounded font-medium border border-green-200 hover:bg-green-100 transition"
                >
                  View Order Details
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}