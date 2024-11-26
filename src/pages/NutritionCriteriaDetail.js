import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/NutritionCriteriaDetail.css";
import editIcon from "../assets/icons/edit-icon.png"; // Icon for editing
import axios from "axios";

const NutritionCriteriaDetail = () => {
  const { id } = useParams(); // Nutrition criteria ID from the URL
  const [criteria, setCriteria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch Nutrition Criteria details by ID
  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/getNutritionCriteriaDetailByCriteriaId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCriteria(response.data);
      } catch (error) {
        console.error("Error fetching nutrition criteria details:", error);
        alert("Failed to load nutrition criteria details.");
        navigate("/nutritionCriteria-management");
      }
    };

    fetchCriteria();
  }, [id, navigate]);

  // Handle updating Nutrition Criteria
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/updateNutritionCriteriaByCriteriaId`,
        criteria,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Nutrition criteria updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating nutrition criteria:", error);
      alert("Failed to update nutrition criteria.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria({ ...criteria, [name]: value });
  };

  if (!criteria) {
    return <p>Loading nutrition criteria details...</p>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="criteria-detail-container">
          <h2>Nutrition Criteria Details</h2>

          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Back
            </button>
            <div
              className="edit-icon"
              onClick={() => setIsEditing(!isEditing)}
              style={{ cursor: "pointer" }}
            >
              <img src={editIcon} alt="Edit" width="40" height="40" />
            </div>
          </div>

          <div className="criteria-info">
            {Object.keys(criteria).map((key) => (
              <div key={key}>
                <label>{key.replace(/([A-Z])/g, " $1").toUpperCase()}:</label>
                {key === "criteriaId" ? (
                  // Readonly for ID
                  <input type="text" value={criteria[key]} readOnly />
                ) : isEditing ? (
                  // Dropdowns for specific fields
                  key === "gender" ? (
                    <select
                      name="gender"
                      value={criteria.gender}
                      onChange={handleChange}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  ) : key === "activityLevel" ? (
                    <select
                      name="activityLevel"
                      value={criteria.activityLevel}
                      onChange={handleChange}
                    >
                      <option value="Cao">Cao</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Ít">Ít</option>
                    </select>
                  ) : key === "goal" ? (
                    <select
                      name="goal"
                      value={criteria.goal}
                      onChange={handleChange}
                    >
                      <option value="Tăng cân">Tăng cân</option>
                      <option value="Giữ nguyên">Giữ nguyên</option>
                      <option value="Giảm cân">Giảm cân</option>
                    </select>
                  ) : (
                    // Input fields for other keys
                    <input
                      type={
                        typeof criteria[key] === "number" ? "number" : "text"
                      }
                      name={key}
                      value={criteria[key]}
                      onChange={handleChange}
                    />
                  )
                ) : (
                  // Display data when not editing
                  <p>{criteria[key]}</p>
                )}
              </div>
            ))}
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
        Manage Dishes
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/nutritionCriteria-management")}
      >
        Manage Nutrition Criteria
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/Ingredient-management")}
      >
        Manage Ingredients
      </div>
      <div
        className="sidebar-item"
        onClick={() => navigate("/articles-management")}
      >
        Manage Articles
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Logout
      </div>
    </div>
  );
};

export default NutritionCriteriaDetail;
