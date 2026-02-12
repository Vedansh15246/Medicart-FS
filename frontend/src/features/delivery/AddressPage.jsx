import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressService } from "../../api/orderService";
import AddressForm from './AddressForm';
import AddressList from './AddressList';
import Navbar from '../../components/navbar/Navbar';
import AlertModal from '../../components/ui/AlertModal';

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });
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
      setAlertModal({ open: true, title: "Error", message: "Failed to update default address", type: "error" });
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
      setAlertModal({ open: true, title: "Save Failed", message: err.response?.data?.message || err.message, type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      setAlertModal({ open: true, title: "Error", message: "Failed to delete address", type: "error" });
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => navigate("/cart")} style={pageStyles.backBtn}>
          ← Back to Cart
        </button>
        
        <div style={pageStyles.layout}>
          <div style={pageStyles.formSection}>
            <h3>{editing ? 'Edit Address' : 'Add New Address'}</h3>
            <AddressForm 
              initialValues={addresses.find(a => a.id === editing)} 
              onSubmit={handleSave} 
              onCancel={() => setEditing(null)} 
            />
          </div>

          <div style={pageStyles.listSection}>
            <h3>Saved Addresses</h3>
            {loading ? <p>Loading...</p> : (
              <AddressList 
                addresses={addresses}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onEdit={setEditing}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            )}
            
            <button 
              disabled={!selectedId} 
              onClick={() => navigate('/payment')}
              style={{
                ...pageStyles.deliverBtn,
                opacity: selectedId ? 1 : 0.5
              }}
            >
              Deliver to Selected Address
            </button>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.open}
        onClose={() => setAlertModal((s) => ({ ...s, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

const pageStyles = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', marginTop: '20px' },
  backBtn: { background: 'none', border: '1px solid #2fbf5d', color: '#2fbf5d', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  deliverBtn: { marginTop: '20px', width: '100%', padding: '14px', background: '#2fbf5d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};

export default AddressPage;