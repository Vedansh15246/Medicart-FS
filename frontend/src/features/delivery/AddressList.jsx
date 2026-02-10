import React from 'react';
import './AddressList.css';

export const AddressList = ({ addresses, selectedId, onSelect, onEdit, onDelete, onSetDefault }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">�</div>
        <div className="empty-state-text">No saved addresses yet. Add your first address above.</div>
      </div>
    );
  }

  return (
    <div className="address-list">
      {addresses.map(a => (
        <div 
          key={a.id} 
          className={`address-card ${selectedId === a.id ? 'selected' : ''}`}
          onClick={() => onSelect(a.id)}
        >
          <div className="card-header">
            <div className="card-label-wrapper">
              <div className="card-label">
                {a.label || 'Address'}
              </div>
              {a.isDefault && (
                <div className="tag-default">
                  Default
                </div>
              )}
            </div>
          </div>

          <div className="card-body">
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{a.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{a.phone}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item full">
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {a.streetAddress}
                  {a.addressLine1 && `, ${a.addressLine1}`}
                  {a.addressLine2 && `, ${a.addressLine2}`}
                </span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">City:</span>
                <span className="info-value">{a.city}</span>
              </div>
              <div className="info-item">
                <span className="info-label">State:</span>
                <span className="info-value">{a.state}</span>
              </div>
              <div className="info-item">
                <span className="info-label">PIN:</span>
                <span className="info-value">{a.postalCode || a.pincode}</span>
              </div>
            </div>
          </div>

          <div className="card-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className="action-btn edit" 
              onClick={() => onEdit(a.id)}
              title="Edit this address"
            >
              Edit
            </button>
            <button 
              className="action-btn delete" 
              onClick={() => onDelete(a.id)}
              title="Delete this address"
            >
              Delete
            </button>
            {!a.isDefault && (
              <button 
                className="action-btn default" 
                onClick={() => onSetDefault(a.id)}
                title="Set as default address"
              >
                Set Default
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
