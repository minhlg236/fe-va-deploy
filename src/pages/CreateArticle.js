import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateArticle.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ1NjYzOTksImp0aSI6IjljZTQyMjRmLTY0MjYtNDlmMS1hNzgxLTE5MmFhMTUwYmVjOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjI5ZDMwODkwIn0.Je5HgBk-GRD-e7Si-hqlsktyazVY1pEKf2_fqXtD_CNnKdKU4YeXbbTTIyDUxudX5Y8rEQJO976RmabxyQjZVA";

const CLOUD_NAME = "dpzzzifpa";
const UPLOAD_PRESET = "vegetarian assistant";

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleImages, setArticleImages] = useState([]);
  const navigate = useNavigate();

  const authorId =
    parseInt(localStorage.getItem("roleId")) === 5
      ? localStorage.getItem("userId")
      : null;

  const uploadImageToCloudinary = async (file) => {
    if (!file) return "";
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      alert("Không thể upload ảnh. Vui lòng thử lại.");
      return "";
    }
  };

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

    const uploadedImages = await Promise.all(
      articleImages.map((file) => uploadImageToCloudinary(file))
    );

    const articlePayload = {
      articleId: 0,
      title,
      content,
      status: "accepted",
      authorId: parseInt(authorId),
      articleImages: uploadedImages.filter((url) => url),
    };

    try {
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

      alert("Tạo bài viết thành công!");
      navigate("/articles-management");
    } catch (error) {
      console.error("Lỗi trong quá trình tạo bài viết:", error);
      alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
    }
  };

  const handleAddImage = (file) => setArticleImages([...articleImages, file]);

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

  return (
    <div className="create-article-container">
      <h2>Tạo bài viết mới</h2>
      <form onSubmit={handleCreateArticle}>
        <div className="article-input-group">
          <label>Tiêu đề bài viết</label>
          <CKEditor
            editor={ClassicEditor}
            config={{ licenseKey }}
            data={title}
            onChange={(event, editor) => setTitle(editor.getData())}
          />
        </div>
        <CKEditor
          editor={ClassicEditor}
          config={{
            licenseKey,
            extraPlugins: [
              function CustomPlugin(editor) {
                editor.plugins.get("FileRepository").createUploadAdapter = (
                  loader
                ) => {
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
          data={content}
          onChange={(event, editor) => setContent(editor.getData())}
        />

        <div className="article-images">
          <h3>Hình ảnh chính</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAddImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Tạo bài viết</button>
      </form>
    </div>
  );
};

export default CreateArticle;
