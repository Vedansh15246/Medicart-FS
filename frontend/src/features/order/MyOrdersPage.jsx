import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../api/orderService";
import Navbar from "../../components/navbar/Navbar";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicineNames, setMedicineNames] = useState({});
  const navigate = useNavigate();

  // Function to fetch medicine name by ID
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

  useEffect(() => {
    const loadOrdersAndMedicines = async () => {
      try {
        const ordersData = await orderService.getMyOrders();
        console.log("Order Data Received:", ordersData);
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersArray);

        // Collect all unique medicine IDs
        const medicineIds = new Set();
        ordersArray.forEach(order => {
          order.items?.forEach(item => {
            if (item.medicineId) {
              medicineIds.add(item.medicineId);
            }
          });
        });

        // Fetch medicine names for all IDs
        const medicineNamesMap = {};
        await Promise.all(
          Array.from(medicineIds).map(async (medicineId) => {
            const name = await fetchMedicineName(medicineId);
            medicineNamesMap[medicineId] = name;
          })
        );

        setMedicineNames(medicineNamesMap);
      } catch (err) {
        console.error("Fetch Orders Error:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          navigate("/login");
        } else {
          setError("Failed to load orders. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrdersAndMedicines();
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
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between border-b pb-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                    <p className="text-xs text-gray-400">
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : "Date N/A"}
                    </p>
                  </div>
                  <p className="text-green-700 font-bold text-xl">₹{order.totalAmount?.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {medicineNames[item.medicineId] || item.MedicineName || item.batch?.medicine?.name || "Medicine Item"} x {item.quantity}
                      </span>
                      <span className="font-medium text-gray-700">
                        ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="mt-4 w-full py-2 bg-green-50 text-green-700 rounded font-medium border border-green-200 hover:bg-green-100 transition"
                >
                  View Order Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}