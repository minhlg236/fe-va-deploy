import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin, message } from "antd";
import MainLayout from "../components/MainLayout"; // Sử dụng layout tổng thể
import SearchBar from "../components/SearchBar";
import DishTable from "../components/DishTable";
import axios from "axios";

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
        } else {
          message.error("Đã xảy ra lỗi khi tải danh sách món ăn.");
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
      message.success("Món ăn đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting dish:", error);
      message.error("Không thể xóa món ăn. Vui lòng thử lại.");
    }
  };

  return (
    <MainLayout title="Quản lý món ăn">
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Button type="primary" onClick={() => navigate("/create-dish")}>
          Tạo món ăn mới
        </Button>
      </div>
      {isLoading ? (
        <Spin tip="Đang tải danh sách món ăn..." />
      ) : filteredDishes.length === 0 ? (
        <div>Không có món ăn nào để hiển thị.</div>
      ) : (
        <DishTable
          dishes={filteredDishes}
          handleDeleteClick={handleDeleteClick}
        />
      )}
    </MainLayout>
  );
};

export default DishesManagement;
