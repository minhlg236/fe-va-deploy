import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NutritionCriteriaManagement.css";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import NutritionCriteriaTable from "../components/NutritionCriteriaTable"; // Assuming this is the NutritionCriteriaTable component

const NutritionCriteriaManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [nutritionCriteria, setNutritionCriteria] = useState([]); // Data from API
  const [filteredCriteria, setFilteredCriteria] = useState([]); // Filtered data

  // Fetch data from API
  useEffect(() => {
    const fetchNutritionCriteria = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/nutritionCriterions/allNutritionCriteria",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNutritionCriteria(response.data);
        setFilteredCriteria(response.data); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching nutrition criteria:", error);
        if (error.response && error.response.status === 401) {
          alert("You are not authorized. Please log in again.");
          navigate("/");
        }
      }
    };

    fetchNutritionCriteria();
  }, [navigate]);

  // Filter criteria based on search term
  useEffect(() => {
    const filtered = nutritionCriteria.filter(
      (criteria) =>
        criteria.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        criteria.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        criteria.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCriteria(filtered);
  }, [searchTerm, nutritionCriteria]);

  return (
    <div className="nutrition-criteria-container">
      <Sidebar />
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-nutritionCriteria")}
          >
            Create
          </button>
        </div>
        {/* Use the NutritionCriteriaTable */}
        <NutritionCriteriaTable rows={filteredCriteria} />
      </div>
    </div>
  );
};

export default NutritionCriteriaManagement;

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
