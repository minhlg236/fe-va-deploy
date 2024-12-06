import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import axios from "axios";

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Get user ID from localStorage
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByID/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* User Greeting */}
      {user && (
        <div className="user-info">
          <p className="username" onClick={togglePopup}>
            Chào, {user.username}!
          </p>
          {showPopup && (
            <div className="user-popup">
              <h4>Thông tin của bạn</h4>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>SĐT:</strong> {user.phoneNumber}
              </p>
              <p>
                <strong>Vai trò:</strong> {user.roleName}
              </p>
              <button onClick={togglePopup}>Đóng</button>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Navigation */}
      <div
        className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </div>
      <div
        className={`sidebar-item ${activeTab === "users" ? "active" : ""}`}
        onClick={() => navigate("/admin")}
      >
        Quản lý người dùng
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default Sidebar;
