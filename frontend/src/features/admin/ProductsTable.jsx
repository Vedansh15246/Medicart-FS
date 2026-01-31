import React, { useState, useEffect } from 'react'; // 1. Make sure useEffect is imported
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import './ProductsTable.css';

export default function ProductsTable({ products, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // ✅ Strictly fixing the "not a function" error by ensuring an array
  const safeProducts = Array.isArray(products) ? products : (products?.content || []);

  // 2. ADD THIS HOOK: It resets the view to Page 1 whenever the list changes
  useEffect(() => {
    setCurrentPage(0);
  }, [safeProducts]); // This triggers whenever the products prop updates (on search)

  const totalPages = Math.ceil(safeProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const selectedProducts = safeProducts.slice(startIndex, startIndex + itemsPerPage);

  const nextSlide = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const prevSlide = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const renderStatusBadge = (status) => {
    if (!status) return <span className="badge secondary">N/A</span>;
    switch (status) {
      case "IN_STOCK": return <span className="badge ok">In Stock</span>;
      case "WARNING": return <span className="badge warn">Warning</span>;
      case "OUT_OF_STOCK": return <span className="badge danger">Out of Stock</span>;
      default: return <span className="badge secondary">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((p) => (
              <tr key={p.id}>
                <td className="sku">{p.sku}</td>
                <td className="product-name">{p.name}</td>
                <td>{p.category}</td>
                <td className="price">₹{p.price.toFixed(2)}</td>
                <td>{renderStatusBadge(p.stockStatus)}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => onEdit(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => onDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-controls">
        <button 
          className="nav-arrow" 
          onClick={prevSlide} 
          disabled={currentPage === 0}
        >
          <FaChevronLeft /> Previous
        </button>

        <span className="page-indicator">
          Showing <b>{safeProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, safeProducts.length)}</b> of {safeProducts.length}
        </span>

        <button 
          className="nav-arrow" 
          onClick={nextSlide} 
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
        >
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}