import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressService } from "../../api/orderService";
import AddressForm from './AddressForm';
import AddressList from './AddressList';
import Navbar from '../../components/navbar/Navbar';
import './AddressPage.css';

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
      
      // Select the default address automatically
      const def = data.find(a => a.isDefault === true);
      if (def) setSelectedId(def.id);
      else if (data.length > 0) setSelectedId(data[0].id);
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id) => {
    try {
      // We call a specific endpoint or PUT the whole object
      const target = addresses.find(a => a.id === id);
      await addressService.updateAddress(id, { ...target, isDefault: true });
      fetchAddresses(); // Refresh to see changes
    } catch (err) {
      alert("Failed to update default address");
    }
  };

  const handleSave = async (payload) => {
    try {
      console.log("📍 Address payload being sent:", payload);
      if (editing) {
        console.log("📝 Updating address ID:", editing);
        await addressService.updateAddress(editing, payload);
      } else {
        console.log("➕ Creating new address");
        await addressService.createAddress(payload);
      }
      console.log("✅ Address saved successfully");
      setEditing(null);
      fetchAddresses();
    } catch (err) {
      console.error("❌ Save failed:", err.response?.data || err.message);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (id) => {
    setEditing(id);
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="address-page-container">
      <Navbar />
      <div className="address-page-content">
        <div className="page-header">
          <h2 className="page-title">
            Delivery Addresses
          </h2>
          <button onClick={() => navigate("/cart")} className="back-btn">
            ← Back to Cart
          </button>
        </div>
        
        <div className="address-page-layout">
          <div className="form-section">
            <h3 className="section-heading">
              {editing ? 'Edit Address' : 'Add New Address'}
            </h3>
            <AddressForm 
              initialValues={addresses.find(a => a.id === editing)} 
              onSubmit={handleSave} 
              onCancel={editing ? () => setEditing(null) : null} 
            />
          </div>

          <div className="list-section">
            <h3 className="section-heading">
              Saved Addresses {addresses.length > 0 && `(${addresses.length})`}
            </h3>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">⏳</div>
                <div className="loading-text">Loading addresses...</div>
              </div>
            ) : (
              <>
                <AddressList 
                  addresses={addresses}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                />
                
                <button 
                  disabled={!selectedId} 
                  onClick={() => navigate('/payment')}
                  className="deliver-btn"
                >
                  {selectedId 
                    ? 'Continue to Payment' 
                    : 'Select an Address'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;