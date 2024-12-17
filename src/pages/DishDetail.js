import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/DishDetail.css";
import editIcon from "../assets/icons/edit-icon.png";
import Sidebar from "../components/Sidebar";

const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [allIngredients, setAllIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientWeight, setIngredientWeight] = useState("");
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState([]);

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

  useEffect(() => {
    const fetchDishDetails = async () => {
      let isNoIngredientsError = false;
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        const dishResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (dishResponse.status === 404) {
          alert(
            "Không thể tìm thấy thông tin chi tiết món ăn, vui lòng thử lại"
          );
          setIsLoading(false);
          return;
        }
        setDish(dishResponse.data);

        await fetchNutritionDetails();

        const ingredientResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ingredientResponse.data.length === 0) {
          setIngredients([]);
          setIsLoading(false);
          alert(
            "Món ăn của bạn chưa có nguyên liệu nào. Hãy thêm nguyên liệu vào nhé!"
          );
          isNoIngredientsError = true;
          return;
        }

        const ingredientDetails = await Promise.all(
          ingredientResponse.data.map(async (item) => {
            try {
              const ingredientDetailResponse = await axios.get(
                `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${item.ingredientId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              return {
                ...ingredientDetailResponse.data,
                weight: item.weight,
              };
            } catch (error) {
              console.error(
                `Error fetching ingredient details for ID ${item.ingredientId}:`,
                error
              );
              alert(
                `Không thể tải thông tin nguyên liệu có ID ${item.ingredientId}. Vui lòng thử lại.`
              );
              return null;
            }
          })
        );

        const validIngredientDetails = ingredientDetails.filter(
          (item) => item !== null
        );
        setIngredients(validIngredientDetails);
      } catch (error) {
        console.error("Error fetching dish details:", error);
        if (!isNoIngredientsError) {
          alert("Không thể tải chi tiết món ăn, vui lòng thử lại");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishDetails();
  }, [id, navigate]);

  const fetchNutritionDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const nutritionResponse = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNutrition(nutritionResponse.data);
    } catch (error) {
      console.error("Error fetching nutrition details:", error);
      alert("Failed to fetch nutrition details.");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/updateDishDetailByDishId`,
        dish,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Dish updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating dish:", error);
      alert("Failed to update dish. Please try again.");
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedIngredient || ingredientWeight <= 0) {
      alert("Please select an ingredient and enter a valid weight.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        dishId: id,
        ingredientId: selectedIngredient,
        weight: parseFloat(ingredientWeight),
      };

      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/addIngredient",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        const selectedIngredientData = allIngredients.find(
          (ingredient) =>
            ingredient.ingredientId === parseInt(selectedIngredient)
        );

        alert("Ingredient added successfully!");
        setIngredients((prev) => [
          ...prev,
          {
            ingredientId: selectedIngredient,
            name: selectedIngredientData?.name || "Unknown Ingredient",
            weight: ingredientWeight,
          },
        ]);

        await fetchNutritionDetails();
        setIsAddingIngredient(false);
        setSelectedIngredient(null);
        setIngredientWeight("");
      } else {
        alert(response.data.message || "Failed to add ingredient.");
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
      alert("Failed to add ingredient. Please try again.");
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/removeIngredient/${id}/${ingredientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert("Ingredient removed successfully!");
        setIngredients((prev) =>
          prev.filter((ingredient) => ingredient.ingredientId !== ingredientId)
        );
        await fetchNutritionDetails();
      } else {
        alert(response.data.message || "Failed to remove ingredient.");
      }
    } catch (error) {
      console.error("Error removing ingredient:", error);
      alert("Failed to remove ingredient. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDish((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient.ingredientId);
    setSearchTerm(ingredient.name);
    setFilteredIngredients([]);
  };

  if (isLoading) {
    return <p>Loading dish details...</p>;
  }

  if (!dish) {
    return <p>No dish details available.</p>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="dish-detail-container">
          <h2>Chi tiết món ăn</h2>
          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <div
              className="edit-icon"
              onClick={() => setIsEditing((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>
          <div className="dish-info">
            <div>
              <label>Tên món:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={dish.name}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.name}</p>
              )}
            </div>
            <div>
              <label>Loại:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="dishType"
                  value={dish.dishType}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.dishType}</p>
              )}
            </div>
            <div>
              <label>Price:</label>
              {isEditing ? (
                <input
                  type="number"
                  name="price"
                  value={dish.price}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.price?.toLocaleString("vi-VN")} VNĐ</p>
              )}
            </div>
            <div>
              <label>Mô tả:</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={dish.description}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.description}</p>
              )}
            </div>
            <div>
              <label>Cách làm:</label>
              {isEditing ? (
                <textarea
                  name="recipe"
                  value={dish.recipe}
                  onChange={handleChange}
                />
              ) : (
                <p>{dish.recipe}</p>
              )}
            </div>

            <div>
              <label>Hình ảnh:</label>
              <div>
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  style={{
                    width: "400px",
                    height: "400px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              </div>
            </div>

            <div>
              <table className="nutrition-table">
                <thead>
                  <tr>
                    <th>Khối lượng</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Fat</th>
                    <th>Carbs</th>
                    <th>Fiber</th>
                    <th>Sodium</th>
                  </tr>
                </thead>

                {/* muốn thêm thành phần dinh dưỡng nào thì cứ .ra là đc  */}

                <tbody>
                  <tr>
                    <td>{nutrition.totalWeights?.toFixed(2)} g</td>
                    <td>{nutrition.totalCalories?.toFixed(2)} kcal</td>
                    <td>{nutrition.totalProtein?.toFixed(2)} g</td>
                    <td>{nutrition.totalFat?.toFixed(2)} g</td>
                    <td>{nutrition.totalCarbs?.toFixed(2)} g</td>
                    <td>{nutrition.totalFiber?.toFixed(2)} g</td>
                    <td>{nutrition.totalSodium?.toFixed(2)} mg</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <label>Nguyên liệu:</label>
              <ul>
                {ingredients.map((ingredient) => (
                  <li key={ingredient.ingredientId} className="ingredient-item">
                    {ingredient.name} ({ingredient.weight} g)
                    <button
                      onClick={() =>
                        handleDeleteIngredient(ingredient.ingredientId)
                      }
                      style={{
                        marginLeft: "10px",
                        padding: "5px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="add-ingredient-button"
                onClick={() => setIsAddingIngredient(true)}
              >
                Add New Ingredient
              </button>
            </div>
            {/* Add ingredient form (conditionally rendered) */}
            {isAddingIngredient && (
              <div className="add-ingredient-form">
                <h3>Add New Ingredient</h3>
                <label>
                  Search Ingredient:
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for ingredients..."
                  />
                </label>
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
                <label>
                  Weight (g):
                  <input
                    type="number"
                    value={ingredientWeight}
                    onChange={(e) => setIngredientWeight(e.target.value)}
                  />
                </label>
                <div>
                  <button onClick={handleAddIngredient}>Add</button>
                  <button onClick={() => setIsAddingIngredient(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {isEditing && (
            <button className="edit-button" onClick={handleUpdate}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishDetail;
