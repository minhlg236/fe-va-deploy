import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/IngredientManagement.css";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import IngredientTable from "../components/IngredientTable"; // Sử dụng IngredientTable mới
import Sidebar from "../components/Sidebar"; // Import Sidebar

const IngredientManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredients, setIngredients] = useState([]); // Dữ liệu từ API
  const [filteredIngredients, setFilteredIngredients] = useState([]); // Dữ liệu đã lọc

  // Gọi API để lấy dữ liệu nguyên liệu
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/allIngredient",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIngredients(response.data);
        setFilteredIngredients(response.data); // Gán dữ liệu ban đầu
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        if (error.response && error.response.status === 401) {
          alert("Bạn không có quyền truy cập. Vui lòng đăng nhập lại!");
          navigate("/");
        }
      }
    };

    fetchIngredients();
  }, [navigate]);

  // Lọc nguyên liệu theo từ khóa tìm kiếm
  useEffect(() => {
    const filtered = ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, ingredients]);

  return (
    <div className="ingredient-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-ingredient")}
          >
            Create
          </button>
        </div>
        {/* Sử dụng IngredientTable */}
        <IngredientTable rows={filteredIngredients} />
      </div>
    </div>
  );
};

export default IngredientManagement;
