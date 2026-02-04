import React, { useState, useEffect } from "react";
import authService from "../../api/authService";
import UsersTable from "./UsersTable";
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await authService.deleteUser(userId);
        // Update UI by filtering out the deleted user
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        alert("Failed to delete user: " + (err.response?.data || err.message));
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
    </div>
  );
}