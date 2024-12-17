import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ArticleModerateManagement.css";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/MorderateTable"; // Assuming this is your table component
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Import Sidebar
const ArticleModerateManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/"); // Redirect to login if no token
          return;
        }

        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filter articles with 'pending' status
        const pendingArticles = response.data.filter(
          (article) => article.status === "pending"
        );

        setArticles(pendingArticles);
        setFilteredArticles(pendingArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [navigate]);

  // Filter articles based on search term
  useEffect(() => {
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  // Handle delete article
  const handleDeleteClick = async (articleId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/delete/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the articles list after deletion
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.articleId !== articleId)
      );
      alert("Bài viết đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Không thể xóa bài viết. Vui lòng thử lại.");
    }
  };

  return (
    <div className="article-moderate-container">
      <Sidebar /> {/* Sử dụng Sidebar */}
      <div className="content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="no-data">Không có bài viết nào để hiển thị.</div>
        ) : (
          <EnhancedTable
            rows={filteredArticles.map((article) => ({
              articleId: article.articleId,
              title: article.title,
              authorName: article.authorName,
              status: article.status,
              moderateDate: article.moderateDate || "N/A",
            }))}
            handleDeleteClick={handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
};

export default ArticleModerateManagement;
