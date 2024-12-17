import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateDish.css";

const CLOUD_NAME = "dpzzzifpa";
const UPLOAD_PRESET = "vegetarian assistant";

const CreateDish = () => {
  const [name, setName] = useState("");
  const [dishType, setDishType] = useState("");
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [dietaryPreferenceId, setDietaryPreferenceId] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();
  const [allIngredients, setAllIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [isCreatingDish, setIsCreatingDish] = useState(false); // Track if dish creation is in progress

  useEffect(() => {
    const fetchAllIngredients = async () => {
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
        setAllIngredients(response.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchAllIngredients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const results = allIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIngredients(results);
    } else {
      setFilteredIngredients([]);
    }
  }, [searchTerm, allIngredients]);

  const uploadImageToCloudinary = async (file) => {
    if (!file) return "";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      return response.data.secure_url;
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
    setIsCreatingDish(true);
    const imageUrl = await uploadImageToCloudinary(imageFile);

    const dishPayload = {
      dishId: 0,
      name,
      dishType,
      description,
      recipe,
      imageUrl,
      status: "active",
      preferenceName: "Default Preference",
      dietaryPreferenceId: parseInt(dietaryPreferenceId),
      price: parseFloat(price),
    };

    try {
      const createResponse = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/createDish",
        dishPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (createResponse.status === 200) {
        const newDishIdFromCreate = createResponse.data.dishId;
        console.log("New Dish ID from create API:", newDishIdFromCreate);
        try {
          const token = localStorage.getItem("authToken");
          const getAllDishResponse = await axios.get(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/allDish",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const allDishes = getAllDishResponse.data;
          const newDish = allDishes.find((dish) => dish.name === name);

          if (newDish) {
            const newDishId = newDish.dishId;
            console.log("Confirmed New Dish ID:", newDishId);
            if (selectedIngredients.length > 0) {
              await Promise.all(
                selectedIngredients.map(async (item) => {
                  try {
                    const token = localStorage.getItem("authToken");
                    const payload = {
                      dishId: newDishId,
                      ingredientId: item.ingredientId,
                      weight: parseFloat(item.weight),
                    };
                    console.log("Payload to add ingredient:", payload);
                    await axios.post(
                      "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/addIngredient",
                      payload,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    console.log(
                      `Ingredient with ID ${item.ingredientId} added successfully.`
                    );
                  } catch (error) {
                    console.error(
                      `Error adding ingredient with ID ${item.ingredientId}:`,
                      error
                    );
                    alert(
                      `Không thể thêm nguyên liệu có ID ${item.ingredientId}. Vui lòng thử lại.`
                    );
                  }
                })
              );
            }
            alert("Tạo món ăn và thêm nguyên liệu thành công!");
            navigate("/dishes-management");
          } else {
            alert("Không tìm thấy dish vừa tạo.");
          }
        } catch (error) {
          console.error("Error fetching all dish or find new dish:", error);
          alert(
            "Không thể lấy danh sách món ăn hoặc tìm dish vừa tạo. Vui lòng thử lại."
          );
        }
      } else {
        alert("Tạo món ăn thất bại.");
      }
    } catch (error) {
      console.error(
        "Lỗi trong quá trình tạo món ăn và thêm nguyên liệu:",
        error
      );
      alert("Không thể tạo món ăn và thêm nguyên liệu. Vui lòng thử lại.");
    } finally {
      setIsCreatingDish(false);
    }
  };
  const handleSelectIngredient = (ingredient) => {
    setSearchTerm("");
    setFilteredIngredients([]);

    const selectedIngredientIndex = selectedIngredients.findIndex(
      (item) => item.ingredientId === ingredient.ingredientId
    );

    if (selectedIngredientIndex === -1) {
      setSelectedIngredients([
        ...selectedIngredients,
        {
          ingredientId: ingredient.ingredientId,
          name: ingredient.name,
          weight: "",
        },
      ]);
    } else {
      const newSelectedIngredients = [...selectedIngredients];
      newSelectedIngredients.splice(selectedIngredientIndex, 1);
      setSelectedIngredients(newSelectedIngredients);
    }
    console.log("selectedIngredients:", selectedIngredients);
  };

  const handleIngredientWeightChange = (ingredientId, weight) => {
    setSelectedIngredients((prevIngredients) => {
      return prevIngredients.map((item) =>
        item.ingredientId === ingredientId ? { ...item, weight } : item
      );
    });
    console.log("selectedIngredients:", selectedIngredients);
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
        <div style={{ marginTop: "20px" }}>
          <label>Chọn nguyên liệu:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nguyên liệu..."
          />
          {filteredIngredients.length > 0 && (
            <ul className="ingredient-search-results">
              {filteredIngredients.map((ingredient) => (
                <li
                  key={ingredient.ingredientId}
                  onClick={() => handleSelectIngredient(ingredient)}
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  {ingredient.name}
                </li>
              ))}
            </ul>
          )}
          {selectedIngredients.length > 0 && (
            <ul className="selected-ingredients-list">
              {selectedIngredients.map((item) => (
                <li key={item.ingredientId}>
                  {item.name}
                  <input
                    type="number"
                    placeholder="Khối lượng (g)"
                    value={item.weight}
                    onChange={(e) =>
                      handleIngredientWeightChange(
                        item.ingredientId,
                        e.target.value
                      )
                    }
                  />
                  <button onClick={() => handleSelectIngredient(item)}>
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="dish-create-button">
          <button type="submit" disabled={isCreatingDish}>
            Tạo món ăn
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDish;
