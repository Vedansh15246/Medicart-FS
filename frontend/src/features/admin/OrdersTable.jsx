import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function OrdersTable({ orders, onEdit }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalPages = Math.ceil(safeOrders.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const selectedOrders = safeOrders.slice(startIndex, startIndex + itemsPerPage);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Delivered": return <span className="badge ok">Delivered</span>;
      case "Pending": return <span className="badge warn">Pending</span>;
      case "Cancelled": return <span className="badge danger">Cancelled</span>;
      default: return <span className="badge secondary">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Details</th> {/* Changed header */}
              <th>Total Amount</th>
              <th>Date Placed</th>
              <th>Exp. Delivery</th> {/* Added column */}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedOrders.map((o) => (
              <tr key={o.id}>
                <td className="sku">#{o.id}</td>
                
                {/* ✅ Combined Name and Email display */}
                <td className="product-name">
                  <div style={{ fontWeight: '600' }}>{o.user?.fullName || "Guest"}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{o.user?.email}</div>
                </td>

                <td className="price">₹{o.totalAmount?.toFixed(2)}</td>
                <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                
                {/* ✅ Display Delivery Date if set */}
                <td>
                    {o.deliveryDate 
                        ? new Date(o.deliveryDate).toLocaleDateString() 
                        : <span style={{color: '#999', fontSize: '0.8rem'}}>Not Set</span>
                    }
                </td>

                <td>{renderStatusBadge(o.status)}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => onEdit(o)}>Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-controls">
        <button className="nav-arrow" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
          <FaChevronLeft /> Previous
        </button>
        <span className="page-indicator">
          Showing <b>{safeOrders.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, safeOrders.length)}</b> of {safeOrders.length}
        </span>
        <button className="nav-arrow" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1 || totalPages === 0}>
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}