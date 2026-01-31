import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

export default function BatchTable({ batches, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); 
  const itemsPerPage = 5;

  // ✅ FIX: Ensure we are always filtering an ARRAY
  // This handles both direct lists [] and Spring Boot Page objects { content: [] }
  const getArrayData = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  const batchList = getArrayData(batches);

  // ✅ 1. Filter the batches based on search term
  const filteredBatches = batchList.filter((b) => {
    const term = searchTerm.toLowerCase();
    const medicineName = b.medicine?.name?.toLowerCase() || "";
    const batchNo = b.batchNo?.toLowerCase() || "";
    
    return medicineName.includes(term) || batchNo.includes(term);
  });

  // ✅ 2. Reset to page 0 whenever searching
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // ✅ 3. Calculate pagination based on FILTERED results
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const selectedBatches = filteredBatches.slice(startIndex, startIndex + itemsPerPage);

  const getStatus = (expiry) => {
    if (!expiry) return "active";
    const diff = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 60) return "warning";
    return "active";
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      onDelete(id);
    }
  };

  return (
    <div className="batch-container">
      {/* SEARCH BAR SECTION */}
      <div className="table-header-actions" style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', left: '12px', color: '#888' }} />
        <input
          type="text"
          placeholder="Search by medicine or batch no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 10px 10px 35px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      <div className="table-wrapper">
        <table className="batch-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch No</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedBatches.length > 0 ? (
              selectedBatches.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.medicine?.name || "Unknown Medicine"}</td>
                  <td>{b.batchNo}</td>
                  <td>{b.expiryDate}</td>
                  <td>{b.qtyAvailable}</td>
                  <td>
                    <span className={`badge ${getStatus(b.expiryDate)}`}>
                      {getStatus(b.expiryDate).toUpperCase()}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-icon" onClick={() => onEdit(b)}>Edit</button>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleDeleteClick(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                  {searchTerm ? `No results found for "${searchTerm}"` : "No batches found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="batch-pagination">
        <button 
          className="nav-arrow" 
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <FaChevronLeft /> Previous
        </button>

        <span className="page-indicator">
          Showing <b>{filteredBatches.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredBatches.length)}</b> of {filteredBatches.length}
        </span>

        <button 
          className="nav-arrow" 
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
        >
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}