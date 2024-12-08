import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DishesManagement.css"; // Ensure this file contains the styles
import SearchBar from "../components/SearchBar";
import DishTable from "../components/DishTable";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/dishes-management")}
      >
        Quản lý món ăn
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/nutritionCriteria-management")}
      >
        Quản lí thể trạng
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/ingredient-management")}
      >
        Quản lí nguyên liệu
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/articles-management")}
      >
        Quản lí bài viết
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

const DishesManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all dishes from the API
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          navigate("/"); // Redirect to login if not authorized
          return;
        }

        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/alldish",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDishes(response.data);
        setFilteredDishes(response.data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [navigate]);

  // Filter dishes based on search input
  useEffect(() => {
    const filtered = dishes.filter(
      (dish) =>
        dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.dishType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.preferenceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
  }, [searchTerm, dishes]);

  // Handle deleting a dish
  const handleDeleteClick = async (dishId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/delete/${dishId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the dish list after deletion
      setDishes((prevDishes) =>
        prevDishes.filter((dish) => dish.dishId !== dishId)
      );
      alert("Món ăn đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Không thể xóa món ăn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="dishes-management-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-dish")}
          >
            Tạo món ăn mới
          </button>
        </div>
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredDishes.length === 0 ? (
          <div className="no-data">Không có món ăn nào để hiển thị.</div>
        ) : (
          <DishTable
            dishes={filteredDishes}
            handleDeleteClick={handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
};

export default DishesManagement;
