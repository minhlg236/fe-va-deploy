import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/IngredientDetail.css";
import editIcon from "../assets/icons/edit-icon.png"; // Icon chỉnh sửa
import axios from "axios";

const IngredientDetail = () => {
  const { id } = useParams(); // Lấy ingredient ID từ URL
  const [ingredient, setIngredient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const roleId = parseInt(localStorage.getItem("roleId")); // Lấy roleId từ localStorage

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (roleId !== 5) {
      alert("Bạn không có quyền truy cập vào trang này!");
      navigate("/Ingredient-management"); // Chuyển hướng về trang quản lý nguyên liệu
    }
  }, [roleId, navigate]);

  // Lấy dữ liệu chi tiết nguyên liệu từ API
  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setIngredient(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin nguyên liệu:", error);
        alert("Không thể tải thông tin nguyên liệu.");
        navigate("/Ingredient-management");
      }
    };

    fetchIngredient();
  }, [id, navigate]);

  // Hàm xử lý cập nhật thông tin nguyên liệu
  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/updateIngredient`,
        ingredient, // Truyền toàn bộ đối tượng ingredient làm body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin nguyên liệu:", error);
      alert("Không thể cập nhật thông tin nguyên liệu.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngredient({ ...ingredient, [name]: value });
  };

  if (!ingredient) {
    return <p>Đang tải thông tin nguyên liệu...</p>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="ingredient-detail-container">
          <h2>Thông tin chi tiết của Nguyên Liệu</h2>

          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <div
              className="edit-icon"
              onClick={() => setIsEditing(!isEditing)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>

          <div className="ingredient-info">
            {Object.keys(ingredient).map((key) => (
              <div key={key}>
                <label>{key.replace(/_/g, " ").toUpperCase()}:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name={key}
                    value={ingredient[key]}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{ingredient[key]}</p>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <button className="edit-button" onClick={handleUpdate}>
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar component
const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
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
        onClick={() => navigate("/Ingredient-management")}
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

export default IngredientDetail;
