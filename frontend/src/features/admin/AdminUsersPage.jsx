import React, { useState, useEffect } from "react";
import authService from "../../api/authService";
import UsersTable from "./UsersTable";
import AlertModal from "../../components/ui/AlertModal";
import { useToast } from '../../components/ui/Toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", type: "info" });
  const { showToast, showConfirm } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    authService.getAllUsers()
      .then(res => setUsers(Array.isArray(res) ? res : res.data || []))
      .catch(err => console.error("Could not load users", err))
      .finally(() => setLoading(false));
  };

  // --- NEW DELETE LOGIC ---
  const handleDeleteUser = async (userId) => {
    const confirmed = await showConfirm(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      { variant: "danger", okText: "Delete", cancelText: "Cancel" }
    );
    if (confirmed) {
      try {
        await authService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        showToast("User deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete user: " + (err.response?.data || err.message), "error", "Delete Failed");
        console.log("Error deleting user", err);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>User Directory</h1>
        <p className="stats-text">
          There are currently <strong>{users.length}</strong> users registered in MediCart.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading Database...</div>
      ) : (
        <UsersTable users={users} onDelete={handleDeleteUser} /> // Passing delete function
      )}

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