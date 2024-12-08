import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateDish.css"; // Tạo file CSS để tùy chỉnh giao diện

const CLOUD_NAME = "dpzzzifpa"; // Tên Cloudinary của bạn
const UPLOAD_PRESET = "vegetarian assistant"; // Preset Cloudinary

const CreateDish = () => {
  const [name, setName] = useState("");
  const [dishType, setDishType] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [imageFile, setImageFile] = useState(null); // Lưu file ảnh
  const [dietaryPreferenceId, setDietaryPreferenceId] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const uploadImageToCloudinary = async (file) => {
    if (!file) return ""; // Trả về chuỗi rỗng nếu không chọn file

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      return response.data.secure_url; // Trả về URL của ảnh
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      alert("Không thể upload ảnh. Vui lòng thử lại.");
      return "";
    }
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !dishType ||
      !description ||
      !recipe ||
      !dietaryPreferenceId ||
      !price
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Upload ảnh lên Cloudinary
    const imageUrl = await uploadImageToCloudinary(imageFile);

    const dishPayload = {
      dishId: 0, // Để 0 cho API tự tạo ID
      name,
      dishType,
      description,
      recipe,
      imageUrl, // URL của ảnh từ Cloudinary
      status: "active", // Giá trị mặc định
      preferenceName: "Default Preference", // Có thể sửa lại
      dietaryPreferenceId: parseInt(dietaryPreferenceId),
      price: parseFloat(price),
    };

    try {
      await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/createDish",
        dishPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Tạo món ăn thành công!");
      navigate("/dishes-management"); // Điều hướng về trang quản lý món ăn
    } catch (error) {
      console.error("Lỗi trong quá trình tạo món ăn:", error);
      alert("Không thể tạo món ăn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="create-dish-container">
      <h2>Tạo món ăn mới</h2>
      <form onSubmit={handleCreateDish}>
        <div className="dish-input-group">
          <label htmlFor="name">Tên món ăn</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="dishType">Loại món ăn</label>
          <select
            id="dishType"
            value={dishType}
            onChange={(e) => setDishType(e.target.value)}
            required
          >
            <option value="">Chọn loại món ăn</option>
            <option value="Món chính">Món chính</option>
            <option value="Đồ uống">Đồ uống</option>
            <option value="Tráng miệng">Tráng miệng</option>
            <option value="Khai vị">Khai vị</option>
            <option value="Canh">Canh</option>
          </select>
        </div>
        <div className="dish-input-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="recipe">Công thức</label>
          <textarea
            id="recipe"
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            placeholder="Nhập công thức món ăn"
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="imageFile">Ảnh món ăn</label>
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
        </div>
        <div className="dish-input-group">
          <label htmlFor="dietaryPreferenceId">Sở thích dinh dưỡng</label>
          <select
            id="dietaryPreferenceId"
            value={dietaryPreferenceId}
            onChange={(e) => setDietaryPreferenceId(e.target.value)}
            required
          >
            <option value="">Chọn sở thích dinh dưỡng</option>
            <option value="1">Vegan</option>
            <option value="2">Lacto</option>
            <option value="3">Ovo</option>
            <option value="4">Lacto-Ovo</option>
            <option value="5">Pescatarian</option>
          </select>
        </div>
        <div className="dish-input-group">
          <label htmlFor="price">Giá (VNĐ)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Nhập giá món ăn"
            required
          />
        </div>
        <div className="dish-create-button">
          <button type="submit">Tạo món ăn</button>
        </div>
      </form>
    </div>
  );
};

export default CreateDish;
