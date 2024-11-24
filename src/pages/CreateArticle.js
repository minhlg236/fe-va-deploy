import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateArticle.css";

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleImages, setArticleImages] = useState([]);
  const navigate = useNavigate();
  const authorId =
    parseInt(localStorage.getItem("roleId")) === 5
      ? localStorage.getItem("userId")
      : null;

  const handleCreateArticle = async (e) => {
    e.preventDefault();

    if (!authorId) {
      alert("Bạn không có quyền tạo bài viết!");
      return;
    }

    try {
      const payload = {
        articleId: 0, // API sẽ tự sinh ID
        title,
        content,
        status: "accepted", // Trạng thái cố định
        authorId: parseInt(authorId),
        authorName: localStorage.getItem("userName") || "Anonymous", // Có thể lấy tên từ localStorage
        articleImages, // Nếu có upload ảnh, truyền mảng URL ảnh
        likes: 0,
      };

      await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByNutritionist",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Tạo bài viết thành công!");
      navigate("/articles-management");
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      alert("Không thể tạo bài viết.");
    }
  };

  return (
    <div className="create-article-container">
      <h2>Tạo bài viết mới</h2>
      <form onSubmit={handleCreateArticle}>
        <div className="article-input-group">
          <label htmlFor="title">Tiêu đề bài viết</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết"
            required
          />
        </div>
        <div className="article-input-group">
          <label htmlFor="content">Nội dung bài viết</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung bài viết"
            required
          />
        </div>
        <div className="article-input-group">
          <label htmlFor="articleImages">URL Hình ảnh (tùy chọn)</label>
          <input
            type="text"
            id="articleImages"
            placeholder="Nhập URL hình ảnh cách nhau bởi dấu phẩy"
            onChange={(e) =>
              setArticleImages(
                e.target.value.split(",").map((img) => img.trim())
              )
            }
          />
        </div>
        <div className="article-create-button">
          <button type="submit">Tạo bài viết</button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;
