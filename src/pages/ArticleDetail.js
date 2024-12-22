import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Spin,
  message,
  Descriptions,
  Space,
  Tag,
  Avatar,
  Image,
  Divider,
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import MainLayout from "../components/MainLayout";

const { Title, Text } = Typography;
const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzU5NDg3OTksImp0aSI6IjU3OGU5Mjc0LTU0ODMtNGFjZC1hYzFjLWVjZTM2NjgxMjY3MiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjkxYTUyZTA5In0.lXiLIzvr3j5KQrDrMFd9KBCvaObv75SByOxGRTY-Oram1GoHafQOso7MuRp2BEi8JwxIgSppQywbk8DnqsofaA";

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articleImages, setArticleImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [moderateDate, setModerateDate] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const roleId = parseInt(localStorage.getItem("roleId"));
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !roleId) {
      message.error("Bạn cần đăng nhập để truy cập trang này!");
      return;
    }
  }, [roleId]);

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
        console.error("Error fetching article images:", error);
      }
    };
    fetchArticleImages();
  }, [id]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
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
        setModerateDate(response.data.moderateDate);
        setCurrentStatus(response.data.status || "pending");
      } catch (error) {
        console.error("Lỗi khi tải thông tin bài viết:", error);
        message.error("Không thể tải thông tin bài viết.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSaveChanges = async () => {
    try {
      const payload = {
        articleId: article.articleId,
        title: formData.title,
        content: formData.content,
        status: currentStatus,
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

      message.success("Cập nhật bài viết thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      message.error("Không thể cập nhật bài viết.");
    }
  };

  const handleChangeStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
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

      setCurrentStatus(newStatus);

      message.success(`Trạng thái bài viết đã được cập nhật: ${newStatus}`);
    } catch (error) {
      console.error("Error changing article status:", error);
      message.error("Không thể thay đổi trạng thái bài viết.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) return <Spin tip="Đang tải chi tiết bài viết..." />;

  return (
    <MainLayout title="Chi tiết bài viết">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            title={
              <Space align="center">
                <Title level={3}>Chi tiết bài viết</Title>
                {roleId === 5 && (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                  </Button>
                )}
              </Space>
            }
            extra={
              roleId === 4 && (
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleChangeStatus("accepted")}
                    loading={isUpdatingStatus}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    type="danger"
                    icon={<CloseOutlined />}
                    onClick={() => handleChangeStatus("rejected")}
                    loading={isUpdatingStatus}
                  >
                    Từ chối
                  </Button>
                </Space>
              )
            }
          >
            {article ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space align="start">
                      <Avatar size={64} icon={<UserOutlined />} />
                      <div>
                        <Text strong>{formData.authorName}</Text>
                        <br />
                        <Text type="secondary">ID: {formData.authorId}</Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
                <Descriptions bordered column={1} style={{ marginTop: 20 }}>
                  <Descriptions.Item label="Ngày phê duyệt">
                    {moderateDate
                      ? new Date(moderateDate).toLocaleString()
                      : "Chưa được phê duyệt"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        currentStatus === "accepted"
                          ? "green"
                          : currentStatus === "rejected"
                          ? "red"
                          : "orange"
                      }
                    >
                      {currentStatus === "accepted"
                        ? "Đã chấp nhận"
                        : currentStatus === "rejected"
                        ? "Đã từ chối"
                        : "Đang chờ duyệt"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                <Divider style={{ marginTop: 20 }} />
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Tiêu đề">
                    {isEditing ? (
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
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: article.title }}
                      />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung">
                    {isEditing ? (
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
                        data={formData.content}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({ ...prev, content: data }));
                        }}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    )}
                  </Descriptions.Item>
                </Descriptions>
                <Divider style={{ marginBottom: 20 }} />
                <Row gutter={[16, 16]}>
                  {articleImages.map((img) => (
                    <Col key={img.articleImageId} xs={24} sm={12} md={8} lg={6}>
                      <Image
                        src={img.imageUrl}
                        alt="Article Image"
                        style={{
                          width: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 16,
                        }}
                      />
                    </Col>
                  ))}
                </Row>
                {isEditing && (
                  <Button
                    type="primary"
                    style={{ marginTop: 20 }}
                    onClick={handleSaveChanges}
                  >
                    Lưu thay đổi
                  </Button>
                )}
              </>
            ) : (
              <p>Đang tải thông tin bài viết...</p>
            )}
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default ArticleDetail;
