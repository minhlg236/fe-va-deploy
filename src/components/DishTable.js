import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Avatar } from "antd";
import { useNavigate } from "react-router-dom";

const DishTable = ({ dishes, handleDeleteClick }) => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "dishId",
      key: "dishId",
      sorter: (a, b) => a.dishId - b.dishId,
    },
    {
      title: "Tên món",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <Avatar
          shape="square"
          size={48}
          src={imageUrl}
          alt="Dish"
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Loại món",
      dataIndex: "dishType",
      key: "dishType",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} VNĐ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Trường phái",
      dataIndex: "preferenceName",
      key: "preferenceName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <span style={{ color: "green" }}>Hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Không hoạt động</span>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => navigate(`/dish/${record.dishId}`)}
          >
            Xem chi tiết
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa món ăn này?"
            onConfirm={() => handleDeleteClick(record.dishId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dishes}
      rowKey="dishId"
      pagination={pagination}
      onChange={(pagination) => setPagination(pagination)}
    />
  );
};

export default DishTable;
