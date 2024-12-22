import React from "react";
import { Table, Button, Space, Image } from "antd";
import { useNavigate } from "react-router-dom";

const ArticleTable = ({ rows }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "ID",
      dataIndex: "articleId",
      key: "articleId",
      sorter: (a, b) => a.articleId - b.articleId,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <div
          style={{
            maxWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <div
          style={{
            maxWidth: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (src) =>
        src ? (
          <Image
            src={src}
            alt="Article"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "Không có ảnh"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "pending"
          ? "Đang chờ duyệt"
          : status === "accepted"
          ? "Đã duyệt"
          : "Bị từ chối",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => navigate(`/article-detail/${record.articleId}`)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rows}
      rowKey="articleId"
      pagination={{ pageSize: 5 }}
    />
  );
};

export default ArticleTable;
