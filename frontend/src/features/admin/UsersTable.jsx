import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaUserCircle, FaTrash } from "react-icons/fa"; // Added FaTrash

export default function UsersTable({ users, onDelete }) { // Destructure onDelete
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const safeUsers = Array.isArray(users) ? users : [];
  const totalPages = Math.ceil(safeUsers.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const selectedUsers = safeUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Registered On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedUsers.map((u) => (
              <tr key={u.id}>
                <td className="sku">#{u.id}</td>
                <td className="product-name">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUserCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    {u.fullName}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || <span style={{color: '#ccc'}}>No Phone</span>}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button 
                    onClick={() => onDelete(u.id)}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer',
                        padding: '5px' 
                    }}
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ... pagination controls remain same ... */}
    </div>
  );
}