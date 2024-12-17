import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // lấy location hiện tại để highlight active tab
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const roleIdLocal = localStorage.getItem("roleId");
        setRoleId(parseInt(roleIdLocal)); // lấy role id từ local storage
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
    localStorage.removeItem("roleId");
    navigate("/");
  };

  // Định nghĩa các link cho từng role
  const linksByRole = {
    // admin có toàn quyền
    1: [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/admin", label: "Quản lý người dùng" },
    ],
    // staff có quyền quản lí món ăn, nguyên liệu
    2: [
      { path: "/orders-management", label: "Quản lý đặt món" },
      { path: "/shipping-management", label: "Quản lí ship hàng" },
    ],
    // moderator có quyền quản lí bài viết
    4: [
      {
        path: "/articleModerate-management",
        label: "Quản lí bài viết của khách hàng",
      },
      { path: "/moderated-articles", label: "Quản lí bài viết đã duyệt" },
    ],

    // nutrition có quyền quản lí thể trạng, và bài viết
    5: [
      { path: "/dishes-management", label: "Quản lí món ăn" },
      { path: "/Ingredient-management", label: "Quản lí nguyên liệu" },

      { path: "/nutritionCriteria-management", label: "Quản lí thể trạng" },
      { path: "/articles-management", label: "Quản lí bài viết" },
    ],
  };
  // lọc các link theo role
  const currentRoleLinks = linksByRole[roleId] || [];

  // hàm kiểm tra xem link hiện tại có phải là active hay không để highlight
  const isLinkActive = (path) => {
    return location.pathname === path;
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
      {/* sidebar navigation */}
      {currentRoleLinks.map((link) => (
        <div
          key={link.path}
          className={`sidebar-item ${isLinkActive(link.path) ? "active" : ""}`}
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </div>
      ))}
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

export default Sidebar;
