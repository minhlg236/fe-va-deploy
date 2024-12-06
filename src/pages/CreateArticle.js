import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateArticle.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ1NjYzOTksImp0aSI6IjljZTQyMjRmLTY0MjYtNDlmMS1hNzgxLTE5MmFhMTUwYmVjOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjI5ZDMwODkwIn0.Je5HgBk-GRD-e7Si-hqlsktyazVY1pEKf2_fqXtD_CNnKdKU4YeXbbTTIyDUxudX5Y8rEQJO976RmabxyQjZVA"; // Thay "YOUR_LICENSE_KEY" bằng key của bạn.

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleImages, setArticleImages] = useState([]);
  const [articleBodies, setArticleBodies] = useState([]);
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

    if (!title || !content) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!");
      return;
    }

    const articlePayload = {
      articleId: 0,
      title,
      content,
      status: "accepted",
      authorId: parseInt(authorId),
      articleImages,
    };

    try {
      // Step 1: Tạo bài viết chính
      await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/createArticleByNutritionist",
        articlePayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Step 2: Lấy articleId bài viết vừa tạo
      const articleId = await fetchLatestArticleId();

      // Step 3: Tạo các phần nội dung phụ (article bodies)
      await Promise.all(
        articleBodies.map(async (body, index) => {
          if (!body.content) return; // Bỏ qua nếu nội dung trống

          const bodyPayload = {
            bodyId: 0,
            articleId, // Sử dụng articleId vừa lấy được
            content: body.content,
            imageUrl: body.imageUrl || "",
            position: index + 2,
            userId: parseInt(authorId),
          };

          await axios.post(
            "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/createArticleBody",
            bodyPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
        })
      );

      alert("Tạo bài viết thành công!");
      navigate("/articles-management");
    } catch (error) {
      console.error("Lỗi trong quá trình tạo bài viết:", error);

      if (error.response) {
        alert(
          `Lỗi từ server: ${error.response.data.message || "Không xác định"}`
        );
      } else {
        alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
      }
    }
  };

  const handleAddImage = () => setArticleImages([...articleImages, ""]);

  const handleImageChange = (index, value) => {
    setArticleImages((prev) =>
      prev.map((image, i) => (i === index ? value : image))
    );
  };

  // Step 2: Fetch all articles by the author to get the latest articleId
  const fetchLatestArticleId = async () => {
    try {
      const response = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/getArticleByAuthorId/${authorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const articles = response.data;
      if (articles.length === 0) {
        throw new Error("Không tìm thấy bài viết nào của tác giả.");
      }

      // Lấy bài viết mới nhất
      const latestArticle = articles[articles.length - 1];
      return latestArticle.articleId;
    } catch (error) {
      console.error("Lỗi khi lấy bài viết mới nhất:", error);
      throw new Error("Không thể lấy articleId.");
    }
  };

  const handleAddBody = () =>
    setArticleBodies([
      ...articleBodies,
      { content: "", imageUrl: "", position: articleBodies.length + 2 },
    ]);

  const handleBodyChange = (index, field, value) => {
    setArticleBodies((prev) =>
      prev.map((body, i) => (i === index ? { ...body, [field]: value } : body))
    );
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
          <label>Nội dung bài viết</label>
          <CKEditor
            editor={ClassicEditor}
            config={{
              licenseKey: licenseKey,
            }}
            data={content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
        </div>
        <div className="article-images">
          <h3>Hình ảnh chính</h3>
          {articleImages.map((image, index) => (
            <div key={index} className="article-image-group">
              <label htmlFor={`image-${index}`}>URL Hình ảnh:</label>
              <input
                type="text"
                id={`image-${index}`}
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`Nhập URL hình ảnh ${index + 1}`}
                required
              />
            </div>
          ))}
          <button type="button" onClick={handleAddImage}>
            Thêm hình ảnh
          </button>
        </div>
        <div className="article-bodies">
          <h3>Các phần nội dung khác</h3>
          {articleBodies.map((body, index) => (
            <div key={index} className="article-body-group">
              <h4>Phần {index + 2}</h4>
              <div>
                <label>Nội dung:</label>
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    licenseKey: licenseKey,
                  }}
                  data={body.content}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    handleBodyChange(index, "content", data);
                  }}
                />
              </div>
              <div>
                <label htmlFor={`body-image-${index}`}>URL Hình ảnh:</label>
                <input
                  type="text"
                  id={`body-image-${index}`}
                  value={body.imageUrl}
                  onChange={(e) =>
                    handleBodyChange(index, "imageUrl", e.target.value)
                  }
                  placeholder="Nhập URL hình ảnh (nếu có)"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddBody}>
            Thêm nội dung mới
          </button>
        </div>

        <div className="article-create-button">
          <button type="submit">Tạo bài viết</button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticle;
