import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { addressService } from "../../api/orderService";
import AddressForm from './AddressForm';
import AddressList from './AddressList';
import Navbar from '../../components/navbar/Navbar';
import { useToast } from '../../components/ui/Toast';
import './AddressPage.css';
 
const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();
  
  // Get cart items to check for prescription requirements
  const cartItems = useSelector((state) => state.cart.items);
 
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
      showToast("Failed to update default address", "error");
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
      setShowForm(false);
      fetchAddresses()
    } catch (err) {
      console.error("❌ Save failed:", err.response?.data || err.message);
      showToast("Save failed: " + (err.response?.data?.message || err.message), "error");
    }
  };
 
  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "Delete Address",
      "Are you sure you want to delete this address?",
      { variant: "danger", okText: "Delete", cancelText: "Cancel" }
    );
    if (!confirmed) return;
    try {
      await addressService.deleteAddress(id);
      showToast("Address deleted successfully", "success");
      fetchAddresses();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };
 
  const handleEdit = (id) => {
    setEditing(id)
    setShowForm(true);
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if any cart item requires prescription
  const hasPrescriptionRequired = () => {
    return cartItems.some(item => item.product?.requiresRx === true);
  };

  // Handle continue to payment with prescription check
  const handleContinueToPayment = () => {
    if (!selectedId) {
      showToast("Please select a delivery address", "warning");
      return;
    }

    // Check if any medicine requires prescription
    if (hasPrescriptionRequired()) {
      // Store selected address in sessionStorage to resume after prescription upload
      sessionStorage.setItem('selectedAddressId', selectedId);
      sessionStorage.setItem('redirectAfterPrescription', 'payment');
      
      showToast("Some medicines require prescription. Please upload your prescription.", "info");
      navigate('/dashboard_client/prescription');
    } else {
      // No prescription required, go directly to payment
      navigate('/payment');
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
          {/* SAVED ADDRESSES SECTION - NOW FIRST */}
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
               
                {/* Add New Address Button */}
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="add-address-btn"
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: '#ffffff',
                      border: '2px dashed #2fbf5d',
                      color: '#2fbf5d',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginTop: '16px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f0fdf4';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                    }}
                  >
                    + Add New Address
                  </button>
                )}
               
                <button
                  disabled={!selectedId}
                  onClick={handleContinueToPayment}
                  className="deliver-btn"
                >
                  {selectedId
                    ? hasPrescriptionRequired() 
                      ? 'Continue to Prescription' 
                      : 'Continue to Payment'
                    : 'Select an Address'}
                </button>
              </>
            )}
          </div>
 
          {/* ADD/EDIT ADDRESS FORM - NOW SECOND, CONDITIONALLY SHOWN */}
          {showForm && (
            <div className="form-section">
              <h3 className="section-heading">
                {editing ? 'Edit Address' : 'Add New Address'}
              </h3>
              <AddressForm
                initialValues={addresses.find(a => a.id === editing)}
                onSubmit={handleSave}
                onCancel={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default AddressPage;