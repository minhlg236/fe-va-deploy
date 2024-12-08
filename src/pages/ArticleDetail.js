import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import Lightbox from "react-image-lightbox"; // Thêm thư viện Lightbox
// import "react-image-lightbox/style.css";
import "../styles/ArticleDetail.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ1NjYzOTksImp0aSI6IjljZTQyMjRmLTY0MjYtNDlmMS1hNzgxLTE5MmFhMTUwYmVjOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjI5ZDMwODkwIn0.Je5HgBk-GRD-e7Si-hqlsktyazVY1pEKf2_fqXtD_CNnKdKU4YeXbbTTIyDUxudX5Y8rEQJO976RmabxyQjZVA";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articleImages, setArticleImages] = useState([]);
  const [articleBodies, setArticleBodies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBodyIndex, setEditingBodyIndex] = useState(-1); // Chỉnh sửa nội dung bài viết
  const [newImages, setNewImages] = useState([]); // Lưu ảnh mới được thêm
  const [newBodyContent, setNewBodyContent] = useState(""); // Nội dung mới
  const [newBodyImage, setNewBodyImage] = useState(""); // Ảnh của nội dung mới

  const [moderateDate, setModerateDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(""); // URL ảnh được chọn

  const CLOUD_NAME = "dpzzzifpa";
  const UPLOAD_PRESET = "vegetarian assistant";

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
        console.error("Lỗi khi lấy danh sách hình ảnh:", error);
      }
    };

    fetchArticleImages();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý upload ảnh mới
  const handleUploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      // Upload ảnh lên Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.secure_url) {
        console.log("Ảnh đã upload thành công:", response.data.secure_url);

        // Gọi API để lưu thông tin ảnh vào DB
        await axios.post(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/createArticleImage`,
          {
            articleId: id, // ID bài viết
            imageUrl: response.data.secure_url, // URL ảnh từ Cloudinary
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        alert("Ảnh đã được upload và lưu vào cơ sở dữ liệu thành công!");

        // Lấy lại danh sách ảnh mới nhất
        const updatedImages = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/getArticleImageByArticleId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setArticleImages(updatedImages.data);
      }
    } catch (error) {
      console.error(
        "Lỗi upload ảnh lên Cloudinary hoặc lưu vào database:",
        error.response?.data || error.message
      );
      alert("Không thể upload ảnh. Vui lòng kiểm tra lại.");
    }
  };

  const handleDeleteBodyImage = async (bodyId, imageUrl) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const updatedBody = {
        ...articleBodies.find((body) => body.bodyId === bodyId),
        imageUrl: "", // Xóa URL ảnh
      };

      // Cập nhật thông tin body lên server
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/updateArticleBodyByBodyId/${bodyId}`,
        updatedBody,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Xóa ảnh thành công!");
      setArticleBodies((prev) =>
        prev.map((body) =>
          body.bodyId === bodyId ? { ...body, imageUrl: "" } : body
        )
      );
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      alert("Không thể xóa ảnh. Vui lòng thử lại.");
    }
  };

  const handleHideBody = async (bodyId) => {
    try {
      const bodyToUpdate = articleBodies.find((body) => body.bodyId === bodyId);

      if (!bodyToUpdate) {
        alert("Không tìm thấy nội dung cần ẩn.");
        return;
      }

      // Cập nhật position của body thành 0
      const updatedBody = {
        ...bodyToUpdate,
        position: 0,
      };

      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/updateArticleBodyByBodyId/${bodyId}`,
        updatedBody,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Ẩn nội dung thành công!");
      setArticleBodies((prev) =>
        prev.map((body) =>
          body.bodyId === bodyId ? { ...body, position: 0 } : body
        )
      );
    } catch (error) {
      console.error("Lỗi khi ẩn nội dung:", error);
      alert("Không thể ẩn nội dung. Vui lòng thử lại.");
    }
  };

  // Khi nhấn lưu thay đổi
  const handleSaveChanges = async () => {
    try {
      const payload = {
        articleId: article.articleId,
        title: formData.title,
        content: formData.content,
        status: "accepted",
        authorId: article.authorId,
      };

      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/updateArticleByArticleId`,
        payload,
        {
          headers: {
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

  const handleUpdateImage = async (imageId, newImageUrl) => {
    try {
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleImages/updateArticleImageByImageId/${imageId}`,
        null,
        {
          params: { newImage: newImageUrl },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Cập nhật hình ảnh thành công!");
      const updatedImages = articleImages.map((img) =>
        img.articleImageId === imageId ? { ...img, imageUrl: newImageUrl } : img
      );
      setArticleImages(updatedImages);
    } catch (error) {
      console.error("Lỗi khi cập nhật hình ảnh:", error);
      alert("Không thể cập nhật hình ảnh.");
    }
  };

  const uniqueImages = [
    ...new Map(
      [...articleImages, ...newImages].map((img) => [img.imageUrl, img])
    ).values(),
  ];

  // Xóa ảnh (xử lý độc lập với ảnh mới và ảnh cũ)
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

      alert("Xóa hình ảnh thành công!");
      setArticleImages((prev) =>
        prev.filter((image) => image.articleImageId !== imageId)
      );
    } catch (error) {
      console.error("Lỗi khi xóa hình ảnh:", error);
      alert("Không thể xóa hình ảnh.");
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articles/updateArticleStatusByArticleId/${article.articleId}?newStatus=${newStatus}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (newStatus === "accepted") {
        // Gọi API để tăng điểm
        await axios.put(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer/membership/changePoint/${article.authorId}/20`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        alert("Bài viết đã được chấp nhận và cộng 20 điểm cho tác giả!");
      } else {
        alert("Bài viết đã bị từ chối!");
      }

      // Refresh the article data after status change
      const response = await axios.get(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Article/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setArticle(response.data);
    } catch (error) {
      console.error("Error changing article status:", error);
      alert("Không thể thay đổi trạng thái bài viết. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    const fetchArticleBodies = async () => {
      try {
        const response = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/getArticleBodyByArticleId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response.data); // Kiểm tra dữ liệu API
        setArticleBodies(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách body:", error);
      }
    };

    fetchArticleBodies();
  }, [id]);

  const handleUploadBodyImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      // Upload image to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.secure_url) {
        console.log(
          "Body image uploaded successfully:",
          response.data.secure_url
        );
        return response.data.secure_url; // Return the image URL
      }
    } catch (error) {
      console.error(
        "Error uploading body image to Cloudinary:",
        error.response?.data || error.message
      );
      alert("Failed to upload the image. Please try again.");
      return ""; // Return an empty string if an error occurs
    }
  };

  const getNextPosition = () => {
    if (articleBodies.length === 0) {
      return 2; // Nếu chưa có body nào, vị trí bắt đầu từ 1
    }
    const maxPosition = Math.max(...articleBodies.map((body) => body.position));
    return maxPosition + 1; // Thêm 1 so với vị trí lớn nhất
  };

  const handleUpdateBodyImage = async (bodyId, newFile) => {
    try {
      const newImageUrl = await handleUploadBodyImage(newFile);
      if (!newImageUrl) {
        alert("Upload ảnh thất bại. Vui lòng thử lại!");
        return;
      }

      const updatedBody = {
        ...articleBodies.find((b) => b.bodyId === bodyId),
        imageUrl: newImageUrl,
      };

      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/updateArticleBodyByBodyId/${bodyId}`,
        updatedBody,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Cập nhật ảnh trong nội dung thành công!");
      setArticleBodies((prev) =>
        prev.map((b) => (b.bodyId === bodyId ? updatedBody : b))
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh:", error);
      alert("Không thể cập nhật ảnh.");
    }
  };

  const handleAddNewBody = async (content, file) => {
    try {
      let imageUrl = ""; // Initialize the image URL

      if (file) {
        imageUrl = await handleUploadBodyImage(file); // Use the new upload function
        if (!imageUrl) {
          alert("Image upload failed. Cancelling new body addition.");
          return;
        }
      }

      const payload = {
        articleId: id, // Article ID
        content: content, // New body content
        imageUrl: imageUrl || "", // Image URL (if any)
        position: getNextPosition(), // Calculate next position
        userId: parseInt(localStorage.getItem("userId")), // Current user's ID
      };

      const response = await axios.post(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/createArticleBody`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        alert("New body content added successfully!");

        // Refresh the list of bodies
        const updatedBodies = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/getArticleBodyByArticleId/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        setArticleBodies(updatedBodies.data); // Update the body list
      }
    } catch (error) {
      console.error(
        "Error adding new body content:",
        error.response?.data || error.message
      );
      alert("Unable to add new body content. Please try again.");
    }
  };

  const handleEditBody = (index) => {
    setEditingBodyIndex(index);
  };

  const handleSaveBody = async (index) => {
    const body = articleBodies[index];
    try {
      let imageUrl = body.imageUrl;

      // If a new file is selected, upload it to Cloudinary
      if (body.newFile) {
        imageUrl = await handleUploadBodyImage(body.newFile);
        if (!imageUrl) {
          alert("Failed to upload the image. Please try again.");
          return;
        }
      }

      const updatedBody = {
        ...body,
        imageUrl: imageUrl, // Use the uploaded image URL
      };

      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/articleBodies/updateArticleBodyByBodyId/${body.bodyId}`,
        updatedBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      alert("Content updated successfully!");
      setEditingBodyIndex(-1);

      // Update the articleBodies state with the new changes
      setArticleBodies((prev) =>
        prev.map((b, i) => (i === index ? updatedBody : b))
      );
    } catch (error) {
      console.error("Error updating body content:", error);
      alert("Unable to update content. Please try again.");
    }
  };

  //zoom , out image
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl); // Lưu URL ảnh được chọn
    setIsModalOpen(true); // Mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Đóng modal
  };

  const replaceOembedWithIframe = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    const div = document.createElement("div");
    div.innerHTML = htmlContent;

    const oembedElements = div.querySelectorAll("oembed");
    oembedElements.forEach((oembed) => {
      const url = oembed.getAttribute("url");
      if (url && url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        const iframe = document.createElement("iframe");
        iframe.setAttribute("width", "560");
        iframe.setAttribute("height", "315");
        iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        );
        iframe.setAttribute("allowfullscreen", "true");

        oembed.replaceWith(iframe);
      }
    });

    return div.innerHTML;
  };

  // // Hiển thị hình ảnh trong Lightbox
  // const handleImageClick = (imageUrl) => {
  //   setLightboxImage(imageUrl);
  // };

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
          {article ? (
            <div className="body-container">
              {isEditing ? (
                <>
                  <div>
                    <label>Ngày phê duyệt:</label>
                    <p>
                      {moderateDate
                        ? new Date(moderateDate).toLocaleString()
                        : "Chưa được phê duyệt"}
                    </p>
                  </div>
                  <div>
                    <h2>Tiêu đề:</h2>
                    <CKEditor
                      editor={ClassicEditor}
                      config={{ licenseKey: licenseKey }}
                      data={formData.title}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({ ...prev, title: data }));
                      }}
                    />
                  </div>

                  <div>
                    <label>Nội dung:</label>
                    <CKEditor
                      editor={ClassicEditor}
                      config={{ licenseKey: licenseKey }}
                      data={formData.content}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({ ...prev, content: data }));
                      }}
                    />
                  </div>

                  <div>
                    <label>Ảnh bài viết:</label>
                    <div className="article-images">
                      {articleImages.map((image) => (
                        <div
                          key={image.articleImageId}
                          className="image-wrapper"
                        >
                          <img
                            src={image.imageUrl}
                            alt={`Article Image ${image.articleImageId}`}
                            className="thumbnail"
                            onClick={() => handleImageClick(image.imageUrl)} // Mở popup
                          />
                          {isEditing && (
                            <div className="image-actions">
                              <button
                                onClick={() =>
                                  handleUpdateImage(
                                    image.articleImageId,
                                    prompt("Nhập URL hình ảnh mới:")
                                  )
                                }
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteImage(image.articleImageId)
                                }
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div>
                      <label htmlFor="uploadImage">Tải ảnh mới:</label>
                      <input
                        type="file"
                        id="uploadImage"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleUploadImage(file); // Hàm upload ảnh mới
                          }
                        }}
                      />
                    </div>
                  )}

                  {isModalOpen && (
                    <div className="popup-overlay" onClick={handleCloseModal}>
                      <div className="popup-content">
                        <img
                          src={currentImage}
                          alt="Zoomed"
                          className="popup-image"
                        />
                        <button
                          className="popup-close-button"
                          onClick={handleCloseModal}
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="article-bodies">
                    <h3>Nội dung chi tiết</h3>
                    {articleBodies
                      .filter((body) => body.position !== 0)
                      .map((body, index) => (
                        <div key={body.bodyId} className="body-container">
                          <CKEditor
                            editor={ClassicEditor}
                            config={{ licenseKey: licenseKey }}
                            data={body.content}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setArticleBodies((prev) =>
                                prev.map((b, i) =>
                                  i === index ? { ...b, content: data } : b
                                )
                              );
                            }}
                          />
                          <div>
                            <label>Image:</label>
                            {body.imageUrl && (
                              <img
                                src={body.imageUrl}
                                alt="Body"
                                className="thumbnail"
                                onClick={() => handleImageClick(body.imageUrl)} // Mở popup
                              />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handleUpdateBodyImage(body.bodyId, file);
                              }}
                            />
                          </div>

                          <button onClick={() => handleSaveBody(index)}>
                            Save
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteBodyImage(body.bodyId, body.imageUrl)
                            }
                          >
                            Xóa ảnh
                          </button>
                          <button
                            onClick={() => handleHideBody(body.bodyId)}
                            className="hide-button"
                          >
                            Ẩn nội dung
                          </button>
                        </div>
                      ))}

                    {isEditing && (
                      <div className="add-new-body">
                        <h3>Add New Body Content</h3>
                        <textarea
                          placeholder="Enter new body content..."
                          rows="4"
                          onChange={(e) => setNewBodyContent(e.target.value)}
                        ></textarea>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setNewBodyImage(file); // Save the file to be uploaded later
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!newBodyContent.trim()) {
                              alert("Please enter content!");
                              return;
                            }
                            handleAddNewBody(newBodyContent, newBodyImage); // Pass the content and image file
                            setNewBodyContent(""); // Reset content
                            setNewBodyImage(null); // Reset image
                          }}
                        >
                          Add Content
                        </button>
                      </div>
                    )}
                  </div>

                  <button className="save-button" onClick={handleSaveChanges}>
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <>
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
                    <h3>Tiêu đề:</h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: article.title }}
                      className="article-content"
                    ></div>
                  </div>

                  <div>
                    <label>Nội dung:</label>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: replaceOembedWithIframe(article.content),
                      }}
                      className="article-content"
                    ></div>
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
                          onClick={() => handleImageClick(image.articleImageId)} // Mở popup
                        />
                      ))}
                    </div>
                  </div>

                  <div className="article-bodies">
                    {articleBodies
                      .sort((a, b) => a.position - b.position) // Sắp xếp theo position
                      .map((body, index) => (
                        <div key={body.bodyId} className="body-container">
                          <p>
                            <strong>Vị trí:</strong> {body.position}
                          </p>
                          <div
                            dangerouslySetInnerHTML={{ __html: body.content }}
                          ></div>
                          <div>
                            <label>Image:</label>
                            {body.imageUrl && (
                              <img
                                src={body.imageUrl}
                                alt="Body"
                                className="thumbnail"
                                onClick={() => handleImageClick(body.imageUrl)} // Mở popup
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Đang tải thông tin bài viết...</p>
          )}
          {roleId === 4 && (
            <div className="moderator-actions">
              <button
                className="accept-button"
                onClick={() => handleChangeStatus("accepted")}
              >
                Chấp nhận bài viết
              </button>
              <button
                className="reject-button"
                onClick={() => handleChangeStatus("rejected")}
              >
                Từ chối bài viết
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
