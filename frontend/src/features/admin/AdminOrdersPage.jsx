import React, { useState, useEffect } from "react";
import { orderService } from "../../api/orderService";
import OrdersTable from "./OrdersTable";
import OrderStatusModal from "./OrderStatusModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      // In Admin, you likely want a different endpoint that returns ALL users' orders
      const res = await orderService.getAllOrders(); 
      setOrders(res);
    } catch (err) {
      console.error("Failed to fetch all orders", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>User Orders Management</h1>
      </div>

      <OrdersTable 
        orders={orders} 
        onEdit={handleEdit} 
      />

      {isModalOpen && (
        <OrderStatusModal 
          order={selectedOrder} 
          onClose={() => setIsModalOpen(false)} 
          onSaved={fetchOrders}
        />
      )}
    </div>
  );
}