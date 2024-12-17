import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ArticleDetail.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Sidebar from "../components/Sidebar"; // Import Sidebar

const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ1NjYzOTksImp0aSI6IjljZTQyMjRmLTY0MjYtNDlmMS1hNzgxLTE5MmFhMTUwYmVjOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjI5ZDMwODkwIn0.Je5HgBk-GRD-e7Si-hqlsktyazVY1pEKf2_fqXtD_CNnKdKU4YeXbbTTIyDUxudX5Y8rEQJO976RmabxyQjZVA";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [moderateDate, setModerateDate] = useState(null);
  const navigate = useNavigate();
  const roleId = parseInt(localStorage.getItem("roleId"));
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // State và logic cho Article Body
  const [articleBodies, setArticleBodies] = useState([]);
  const [editingBodyIndex, setEditingBodyIndex] = useState(-1); // Chỉnh sửa nội dung bài viết
  const CLOUD_NAME = "dpzzzifpa";
  const UPLOAD_PRESET = "vegetarian assistant";

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ----------  Article Body Logic -----------
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
  class CustomUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    async upload() {
      const data = new FormData();
      const file = await this.loader.file;

      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      return {
        default: result.secure_url,
      };
    }

    abort() {
      console.log("Upload bị hủy");
    }
  }

  // ----------  End Article Body Logic -----------

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

  return (
    <div className="admin-container">
      <Sidebar activeTab="/articles-management" /> {/* Sử dụng Sidebar */}
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
                      config={{
                        licenseKey,
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "link",
                          "bulletedList",
                          "numberedList",
                          "blockQuote",
                          "|",
                          "imageUpload",
                          "undo",
                          "redo",
                        ],
                      }}
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
                      config={{
                        licenseKey,
                        extraPlugins: [
                          function CustomPlugin(editor) {
                            editor.plugins.get(
                              "FileRepository"
                            ).createUploadAdapter = (loader) => {
                              return new CustomUploadAdapter(loader);
                            };
                          },
                        ],
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "link",
                          "bulletedList",
                          "numberedList",
                          "blockQuote",
                          "|",
                          "imageUpload",
                          "undo",
                          "redo",
                        ],
                      }}
                      data={formData.content}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({ ...prev, content: data }));
                      }}
                    />
                  </div>
                  {/* Article Body Edit*/}
                  <div className="article-bodies">
                    <h3>Nội dung chi tiết</h3>
                    {articleBodies
                      .filter((body) => body.position !== 0)
                      .map((body, index) => (
                        <div key={body.bodyId} className="body-container">
                          <CKEditor
                            editor={ClassicEditor}
                            config={{
                              licenseKey,
                              extraPlugins: [
                                function CustomPlugin(editor) {
                                  editor.plugins.get(
                                    "FileRepository"
                                  ).createUploadAdapter = (loader) => {
                                    return new CustomUploadAdapter(loader);
                                  };
                                },
                              ],
                              toolbar: [
                                "heading",
                                "|",
                                "bold",
                                "italic",
                                "link",
                                "bulletedList",
                                "numberedList",
                                "blockQuote",
                                "|",
                                "imageUpload",
                                "undo",
                                "redo",
                              ],
                            }}
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
                  {/* Article Body Show */}
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
