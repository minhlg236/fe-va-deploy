import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ArticleDetail.css";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articleImages, setArticleImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [moderateDate, setModerateDate] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const navigate = useNavigate();
  const roleId = parseInt(localStorage.getItem("roleId"));

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !roleId) {
      alert("Bạn cần đăng nhập để truy cập trang này!");
      navigate("/");
      return;
    }
  }, [navigate, roleId]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticle(response.data);
        setFormData({
          title: response.data.title,
          content: response.data.content,
          authorId: response.data.authorId,
          authorName: response.data.authorName,
        });
        setModerateDate(response.data.moderateDate); // Lấy moderateDate từ API
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài viết:", error);
        alert("Không thể tải thông tin bài viết.");
        navigate("/articles-management");
      }
    };

    fetchArticle();
  }, [id, navigate]);

  useEffect(() => {
    const fetchArticleImages = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticleImages(response.data);
      } catch (error) {
        console.error("Lỗi khi tải ảnh bài viết:", error);
      }
    };

    fetchArticleImages();
  }, [id]);

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/deleteArticleImageByArticleImageId/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setArticleImages(
        articleImages.filter((img) => img.articleImageId !== imageId)
      );
      alert("Xóa ảnh thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      alert("Không thể xóa ảnh.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        articleId: article.articleId,
        title: formData.title,
        content: formData.content,
        status: "accepted",
        authorId: article.authorId,
        authorName: article.authorName,
        articleImages: articleImages.map((img) => img.imageUrl),
        likes: article.likes,
      };

      await axios.post(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/editArticle`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Cập nhật bài viết thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      alert("Không thể cập nhật bài viết.");
    }
  };

  const handleModerateArticle = async (status) => {
    try {
      // Cập nhật trạng thái bài viết
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/updateArticleStatusByArticleId/${article.articleId}?newStatus=${status}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (status === "accepted") {
        // Nếu trạng thái là "accepted", gọi API cộng điểm
        await axios.put(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer/membership/changePoint/${article.authorId}/10`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        alert("Bài viết đã được duyệt và điểm đã được cộng cho tác giả!");
      } else {
        alert("Bài viết đã bị từ chối!");
      }

      // Tải lại thông tin bài viết sau khi cập nhật
      const response = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setArticle(response.data); // Cập nhật bài viết với trạng thái mới
      setModerateDate(response.data.moderateDate); // Cập nhật ngày duyệt nếu có
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật trạng thái bài viết hoặc cộng điểm:",
        error
      );
      alert("Không thể cập nhật trạng thái bài viết hoặc cộng điểm.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  return (
    <div className="admin-container">
      {/* Sidebar hiển thị theo roleId */}
      {roleId === 5 ? (
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
      ) : roleId === 4 ? (
        <div className="sidebar">
          <div
            className="sidebar-item"
            onClick={() => navigate("/articleModerate-management")}
          >
            Quản lý phê duyệt bài viết
          </div>
          <div
            className="sidebar-item"
            onClick={() => navigate("/moderated-articles")}
          >
            Bài viết đã được xử lí
          </div>
          <div className="sidebar-item logout" onClick={handleLogout}>
            Đăng xuất
          </div>
        </div>
      ) : (
        <div className="sidebar">
          <p>Không có quyền truy cập.</p>
        </div>
      )}

      {/* Content */}
      <div className="content">
        <div className="article-detail-container">
          <h2>Thông tin chi tiết của Bài viết</h2>

          {/* Nút quay lại và chỉnh sửa */}
          <div className="top-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Quay lại
            </button>

            {roleId === 5 && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            )}
          </div>

          {/* Hiển thị thông tin bài viết */}
          {/* Hiển thị thông tin bài viết */}
          {article ? (
            <div className="article-info">
              {isEditing ? (
                <>
                  <div>
                    <label>Tác giả:</label>
                    <p>{formData.authorName}</p>
                  </div>

                  <div>
                    <label>ID Tác giả:</label>
                    <p>{formData.authorId}</p>
                  </div>

                  <div>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label>Nội dung:</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div>
                    <label>Ngày phê duyệt:</label>
                    <p>
                      {moderateDate
                        ? new Date(moderateDate).toLocaleString()
                        : "Chưa được phê duyệt"}
                    </p>
                  </div>

                  <div>
                    <label>Ảnh bài viết:</label>
                    <div className="article-images">
                      {articleImages.map((image) => (
                        <div key={image.articleImageId}>
                          <img
                            src={image.imageUrl}
                            alt={`Article Image ${image.articleImageId}`}
                            className="article-image"
                          />
                          <button
                            onClick={() =>
                              handleDeleteImage(image.articleImageId)
                            }
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="save-button" onClick={handleSaveChanges}>
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label>Tiêu đề:</label>
                    <p>{article.title}</p>
                  </div>

                  <div>
                    <label>Nội dung:</label>
                    <p>{article.content}</p>
                  </div>

                  <div>
                    <label>Ngày phê duyệt:</label>
                    <p>
                      {moderateDate
                        ? new Date(moderateDate).toLocaleDateString()
                        : "Chưa được phê duyệt"}
                    </p>
                  </div>

                  <div>
                    <label>Tác giả:</label>
                    <p>{formData.authorName}</p>
                  </div>
                  <div>
                    <label>ID Tác giả:</label>
                    <p>{formData.authorId}</p>
                  </div>

                  <div>
                    <label>Ảnh bài viết:</label>
                    <div className="article-images">
                      {articleImages.map((image) => (
                        <img
                          key={image.articleImageId}
                          src={image.imageUrl}
                          alt={`Article Image ${image.articleImageId}`}
                          className="article-image"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Nút Duyệt và Từ chối bài viết (chỉ roleId === 4) */}
              {roleId === 4 && article.status === "pending" && (
                <div className="moderate-buttons">
                  <button
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      marginRight: "10px",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                    }}
                    onClick={() => handleModerateArticle("accepted")}
                  >
                    Duyệt bài viết
                  </button>
                  <button
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                    }}
                    onClick={() => handleModerateArticle("rejected")}
                  >
                    Từ chối bài viết
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>Đang tải thông tin bài viết...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
