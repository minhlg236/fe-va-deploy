import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPage.css";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/Table";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users
  // Fetch users based on the active tab
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/alluser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let fetchedUsers = response.data;

        if (activeTab === "Customer") {
          fetchedUsers = fetchedUsers.filter(
            (user) => user.roleId === 3 && user.status === "active"
          );
        } else if (activeTab === "system") {
          fetchedUsers = fetchedUsers.filter(
            (user) =>
              [2, 5, 4].includes(user.roleId) && user.status === "active"
          );
        } else if (activeTab === "Banned") {
          fetchedUsers = fetchedUsers.filter(
            (user) => user.status === "inactive"
          );
        }

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 401) {
          alert("Bạn không có quyền truy cập. Vui lòng đăng nhập lại!");
          navigate("/");
        }
      }
    };

    fetchUsers();
  }, [activeTab, navigate]);

  // Filter users by search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.username?.toLowerCase() || "").includes(
          (searchTerm || "").toLowerCase()
        ) ||
        (user.phoneNumber?.toLowerCase() || "").includes(
          (searchTerm || "").toLowerCase()
        ) ||
        (user.email?.toLowerCase() || "").includes(
          (searchTerm || "").toLowerCase()
        )
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async (userId, currentStatus) => {
    if (currentStatus === "inactive") {
      alert("User đã bị ban trước đó.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/updateStaff`,
        { userId, status: "inactive" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("User đã được chuyển sang trạng thái bị ban!");
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Không thể cập nhật trạng thái user.");
    }
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} />
      <div className="content">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="header">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            navigate={navigate}
          />
          <button
            className="create-button"
            onClick={() => navigate("/create-account")}
          >
            Create
          </button>
        </div>
        <EnhancedTable rows={filteredUsers} />
      </div>
    </div>
  );
};

export default AdminPage;
