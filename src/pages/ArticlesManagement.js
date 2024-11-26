import React, { useEffect, useState } from "react";
import "../styles/ArticlesManagement.css";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/ArticleTable"; // Sử dụng ArticleTable từ trước
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ArticlesManagement = () => {
  const [articles, setArticles] = useState([]); // Danh sách bài viết từ API
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [filteredArticles, setFilteredArticles] = useState([]); // Bài viết đã lọc
  const navigate = useNavigate();

  // Hàm lấy ảnh bài viết
  const fetchArticleImages = async (articleId) => {
    try {
      const response = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data.length > 0 ? response.data[0].imageUrl : null; // Lấy ảnh đầu tiên nếu có
    } catch (error) {
      console.error(`Lỗi khi tải ảnh bài viết ${articleId}:`, error);
      return null; // Trả về null nếu có lỗi
    }
  };

  // Gọi API để lấy danh sách bài viết và ảnh
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/5",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const articlesWithImages = await Promise.all(
          response.data.map(async (article) => {
            const imageUrl = await fetchArticleImages(article.articleId);
            return { ...article, imageUrl };
          })
        );

        setArticles(articlesWithImages);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài viết:", error);
        alert("Không thể tải danh sách bài viết.");
      }
    };

    fetchArticles();
  }, []);

  // Lọc bài viết theo từ khóa tìm kiếm
  useEffect(() => {
    const filtered = articles.filter((article) => {
      const matchesSearchTerm =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearchTerm;
    });
    setFilteredArticles(filtered);
  }, [articles, searchTerm]);

  return (
    <div className="articles-management-container">
      <Sidebar />
      <div className="content">
        <div className="articles-header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            className="create-button"
            onClick={() => navigate("/create-article")}
          >
            Create
          </button>
        </div>
        <EnhancedTable
          rows={filteredArticles.map((article) => ({
            articleId: article.articleId,
            title: article.title,
            content:
              article.content.length > 100
                ? article.content.slice(0, 100) + "..."
                : article.content,
            authorName: article.authorName,
            imageUrl: article.imageUrl,
            status: article.status,
            moderateDate: article.moderateDate || "N/A",
          }))}
        />
      </div>
    </div>
  );
};

// Sidebar giữ nguyên
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

export default ArticlesManagement;
