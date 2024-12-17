import React, { useEffect, useState } from "react";
import "../styles/ModeratedArticles.css";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/ModeratedArticleTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Import Sidebar

const ModeratedArticles = () => {
  const [articles, setArticles] = useState([]); // Danh sách bài viết từ API
  const [activeTab, setActiveTab] = useState("accepted"); // Tab hiện tại
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [filteredArticles, setFilteredArticles] = useState([]); // Bài viết đã lọc
  const navigate = useNavigate();

  // Gọi API để lấy danh sách bài viết
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/allArticleByRoleId/3",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticles(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài viết:", error);
        alert("Không thể tải danh sách bài viết.");
      }
    };

    fetchArticles();
  }, []);

  // Lọc bài viết theo tab hiện tại và từ khóa tìm kiếm
  useEffect(() => {
    const filtered = articles.filter((article) => {
      const isAccepted =
        activeTab === "accepted" && article.status === "accepted";
      const isRejected =
        activeTab === "rejected" && article.status === "rejected";
      const matchesSearchTerm =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      return (isAccepted || isRejected) && matchesSearchTerm;
    });
    setFilteredArticles(filtered);
  }, [articles, activeTab, searchTerm]);

  // Xử lý sự kiện khi bấm vào một hàng trong bảng
  const handleRowClick = (articleId) => {
    navigate(`/article-detail/${articleId}`);
  };

  return (
    <div className="moderated-articles-container">
      <Sidebar />
      <div className="content">
        <div className="moderated-tabs">
          <button
            className={`moderated-tab ${
              activeTab === "accepted" ? "active" : ""
            }`}
            onClick={() => setActiveTab("accepted")}
          >
            Đã Duyệt
          </button>
          <button
            className={`moderated-tab ${
              activeTab === "rejected" ? "active" : ""
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Đã Từ Chối
          </button>
        </div>
        <div className="moderated-header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <EnhancedTable
          rows={filteredArticles.map((article) => ({
            articleId: article.articleId,
            title: article.title,
            authorName: article.authorName,
            status: article.status,
            moderateDate: article.moderateDate || "N/A",
          }))}
        />
      </div>
    </div>
  );
};

export default ModeratedArticles;
