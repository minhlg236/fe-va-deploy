import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateIngredient.css"; // Tạo file CSS để tùy chỉnh giao diện
import axios from "axios";

const CreateIngredient = () => {
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    weight: "",
    fiber: "",
    vitaminA: "",
    vitaminB: "",
    vitaminC: "",
    vitaminD: "",
    vitaminE: "",
    calcium: "",
    iron: "",
    magnesium: "",
    omega3: "",
    sugars: "",
    cholesterol: "",
    sodium: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/createIngredient",
        {
          name: formData.name, // Include the name field
          calories: parseFloat(formData.calories || 0),
          protein: parseFloat(formData.protein || 0),
          carbs: parseFloat(formData.carbs || 0),
          fat: parseFloat(formData.fat || 0),
          weight: parseFloat(formData.weight || 0),
          fiber: parseFloat(formData.fiber || 0),
          vitaminA: parseFloat(formData.vitaminA || 0),
          vitaminB: parseFloat(formData.vitaminB || 0),
          vitaminC: parseFloat(formData.vitaminC || 0),
          vitaminD: parseFloat(formData.vitaminD || 0),
          vitaminE: parseFloat(formData.vitaminE || 0),
          calcium: parseFloat(formData.calcium || 0),
          iron: parseFloat(formData.iron || 0),
          magnesium: parseFloat(formData.magnesium || 0),
          omega3: parseFloat(formData.omega3 || 0),
          sugars: parseFloat(formData.sugars || 0),
          cholesterol: parseFloat(formData.cholesterol || 0),
          sodium: parseFloat(formData.sodium || 0),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Tạo nguyên liệu thành công!");
        navigate("/Ingredient-management"); // Redirect to the Ingredient Management page
      }
    } catch (error) {
      console.error("Lỗi khi tạo nguyên liệu:", error);
      alert("Không thể tạo nguyên liệu. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="create-ingredient-container">
      <h2>Tạo nguyên liệu mới</h2>
      <form onSubmit={handleCreateIngredient}>
        {Object.keys(formData).map((key) => (
          <div className="ingredient-input-group" key={key}>
            <label htmlFor={key}>
              {key === "name"
                ? "Name"
                : key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}{" "}
              {key !== "name" &&
                `(${
                  key === "calories" || key === "weight" ? "kcal/g" : "mg/g"
                })`}
            </label>
            <input
              type={key === "name" ? "text" : "number"}
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Nhập ${key === "name" ? "name" : key}`}
              required={key === "name"} // Đặt bắt buộc cho trường name
            />
          </div>
        ))}
        <div className="ingredient-create-button">
          <button type="submit">Tạo nguyên liệu</button>
        </div>
      </form>
    </div>
  );
};

export default CreateIngredient;
