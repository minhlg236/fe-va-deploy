import React, { useEffect, useState } from "react";
import "../styles/ArticlesManagement.css";
import SearchBar from "../components/SearchBar";
import EnhancedTable from "../components/ArticleTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Import Sidebar

const ArticlesManagement = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const navigate = useNavigate();

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
      return response.data.length > 0 ? response.data[0].imageUrl : null;
    } catch (error) {
      console.error(`Lỗi khi tải ảnh bài viết ${articleId}:`, error);
      return null;
    }
  };

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
      <Sidebar /> {/* Sử dụng Sidebar */}
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
            title: (
              <div
                style={{
                  fontSize: "14px",
                  fontFamily: "Arial, sans-serif",
                  color: "#333",
                  lineHeight: "1.5",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
                dangerouslySetInnerHTML={{ __html: article.title }}
              />
            ),
            content: (
              <div
                style={{
                  fontSize: "14px",
                  fontFamily: "Arial, sans-serif",
                  color: "#333",
                  lineHeight: "1.5",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "300px",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    article.content.length > 100
                      ? article.content.slice(0, 100) + "..."
                      : article.content,
                }}
              />
            ),
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

export default ArticlesManagement;
