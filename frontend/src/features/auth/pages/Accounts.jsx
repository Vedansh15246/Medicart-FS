import React, { useState, useEffect } from "react";
import authService from "../../../api/authService";
import AlertModal from "../../../components/ui/AlertModal";

const Accounts = () => {
  const [data, setData] = useState({ 
    fullName: "", 
    email: "", 
    phone: ""
  });
  const [isChanged, setIsChanged] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });

  const handleOnChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
    setIsChanged(true);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch User Profile
        const userRes = await authService.getCurrentUser();

        if (!mounted) return;

        setData({
          fullName: userRes.fullName || "",
          email: userRes.email || "",
          phone: userRes.phone || ""
        });
        
        setIsChanged(false);
      } catch (err) {
        console.error("Fetch error", err);
      }
    })();
    return () => { mounted = false };
  }, []);

const handleFormSubmit = async (e) => {
  e.preventDefault();
  try {
    // Get current user ID
    const currentUser = await authService.getCurrentUser();
    const userId = currentUser.id;

    // Update User Profile (Name and Phone)
    const profilePayload = { 
      fullName: data.fullName, 
      phone: data.phone 
    };
    await authService.updateProfile(userId, profilePayload);

    setIsChanged(false);
    setAlertModal({ open: true, title: "Success", message: "Profile updated successfully!", type: "success" });
  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
    setAlertModal({ open: true, title: "Error", message: "Failed to update profile", type: "error" });
  }
};

  return (
    <div className="bg-body-tertiary h-100 w-100 rounded-3 border shadow-sm p-2">
      <div className="border-bottom w-100 pb-1 mb-2">
        <span className="fs-5 fw-bold "> Account Details </span>
      </div>

      <div className="p-2">
        <form onSubmit={handleFormSubmit}>
          <div className="row g-3">
            <div className="form-floating col-md-6">
              <input type="text" className="form-control" id="floatingName" name="fullName" value={data.fullName} onChange={handleOnChange} />
              <label htmlFor="floatingName">Name</label>
            </div>

            <div className="form-floating col-md-6">
              <input type="text" className="form-control" id="floatingPhone" name="phone" value={data.phone} onChange={handleOnChange} />
              <label htmlFor="floatingPhone">Phone</label>
            </div>

            <div className="form-floating col-12">
              <input type="email" className="form-control" id="floatingEmail" value={data.email} disabled />
              <label htmlFor="floatingEmail">Email Address (Cannot be changed)</label>
            </div>

            <div>
              <button type="submit" className="btn btn-success mb-3" disabled={!isChanged}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
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
}

export default Accounts;