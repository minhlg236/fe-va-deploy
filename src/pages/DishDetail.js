import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Card,
  Descriptions,
  Image,
  Table,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  Typography,
  Row,
  Col,
  Spin,
  message,
} from "antd";

import {
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../components/MainLayout";

const { Option } = Select;

const DishDetail = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [nutrition, setNutrition] = useState({});
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientWeight, setIngredientWeight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const navigate = useNavigate();

  const [form] = Form.useForm();

  // Fetch dish details and ingredients
  useEffect(() => {
    const fetchDishDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        const [dishResponse, nutritionResponse, ingredientsResponse] =
          await Promise.all([
            axios.get(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/dishs/calculateNutrition/${id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

        setDish(dishResponse.data);
        setNutrition(nutritionResponse.data);

        const ingredientsDetails = await Promise.all(
          ingredientsResponse.data.map(async (ingredient) => {
            const ingredientDetailResponse = await axios.get(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${ingredient.ingredientId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...ingredientDetailResponse.data,
              weight: ingredient.weight,
            };
          })
        );

        setIngredients(ingredientsDetails);
      } catch (error) {
        console.error("Error fetching dish details:", error);
        message.error("Không thể tải thông tin món ăn.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishDetails();
  }, [id]);

  // Fetch all ingredients for adding new ones
  useEffect(() => {
    const fetchAllIngredients = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/allIngredient",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllIngredients(response.data);
      } catch (error) {
        console.error("Error fetching all ingredients:", error);
        message.error("Không thể tải danh sách nguyên liệu.");
      }
    };

    fetchAllIngredients();
  }, []);

  const handleUpdateDish = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/updateDishDetailByDishId`,
        dish,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Cập nhật món ăn thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating dish:", error);
      message.error("Không thể cập nhật món ăn.");
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedIngredient || !ingredientWeight) {
      message.warning("Vui lòng chọn nguyên liệu và nhập khối lượng.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/Dish/addIngredient`,
        {
          dishId: id,
          ingredientId: selectedIngredient,
          weight: parseFloat(ingredientWeight),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Thêm nguyên liệu thành công!");
      setIsAddingIngredient(false);
      setSelectedIngredient(null);
      setIngredientWeight(null);
      // Refresh dish details after adding ingredient
    } catch (error) {
      console.error("Error adding ingredient:", error);
      message.error("Không thể thêm nguyên liệu.");
    }
  };

  const ingredientColumns = [
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Khối lượng (g)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            danger
            onClick={() =>
              console.log(`Xóa nguyên liệu ID: ${record.ingredientId}`)
            }
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Spin tip="Đang tải chi tiết món ăn..." />;

  return (
    <MainLayout title="Chi tiết món ăn">
      <Row gutter={24} style={{ transition: "all 0.3s ease-in-out" }}>
        <Col
          span={showImage ? 16 : 24}
          style={{
            transition: "all 0.3s ease-in-out",
            paddingRight: showImage ? "20px" : "0px",
          }}
        >
          <Card
            title={
              <>
                {dish.name}
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
                {isEditing && (
                  <Button
                    type="primary"
                    onClick={handleUpdateDish}
                    style={{ marginLeft: 10 }}
                  >
                    Lưu
                  </Button>
                )}
              </>
            }
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên món">
                {isEditing ? (
                  <Input
                    value={dish.name}
                    onChange={(e) =>
                      setDish((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  dish.name
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Loại món">
                {isEditing ? (
                  <Input
                    value={dish.dishType}
                    onChange={(e) =>
                      setDish((prev) => ({ ...prev, dishType: e.target.value }))
                    }
                  />
                ) : (
                  dish.dishType
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                {isEditing ? (
                  <InputNumber
                    value={dish.price}
                    onChange={(value) =>
                      setDish((prev) => ({ ...prev, price: value }))
                    }
                    formatter={(value) => `${value} VNĐ`}
                  />
                ) : (
                  `${dish.price?.toLocaleString()} VNĐ`
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trường phái ăn uống">
                {isEditing ? (
                  <Input
                    value={dish.preferenceName}
                    onChange={(e) =>
                      setDish((prev) => ({
                        ...prev,
                        preferenceName: e.target.value,
                      }))
                    }
                  />
                ) : (
                  dish.preferenceName || "Không có thông tin"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {isEditing ? (
                  <Select
                    value={dish.status}
                    onChange={(value) =>
                      setDish((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
                ) : dish.status === "active" ? (
                  "Hoạt động"
                ) : (
                  "Không hoạt động"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {isEditing ? (
                  <Input.TextArea
                    value={dish.description}
                    onChange={(e) =>
                      setDish((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                ) : (
                  dish.description || "Không có mô tả"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Công thức">
                {isEditing ? (
                  <Input.TextArea
                    value={dish.recipe}
                    onChange={(e) =>
                      setDish((prev) => ({ ...prev, recipe: e.target.value }))
                    }
                  />
                ) : (
                  dish.recipe || "Không có công thức"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Calories">
                {nutrition.totalCalories || "Không có dữ liệu"} kcal
              </Descriptions.Item>
              <Descriptions.Item label="Protein">
                {nutrition.totalProtein || "Không có dữ liệu"} g
              </Descriptions.Item>
              <Descriptions.Item label="Carbs">
                {nutrition.totalCarbs || "Không có dữ liệu"} g
              </Descriptions.Item>
              <Descriptions.Item label="Fat">
                {nutrition.totalFat || "Không có dữ liệu"} g
              </Descriptions.Item>
              <Descriptions.Item label="Fiber">
                {nutrition.totalFiber || "Không có dữ liệu"} g
              </Descriptions.Item>
              <Descriptions.Item label="Sodium">
                {nutrition.totalSodium || "Không có dữ liệu"} mg
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        {showImage && (
          <Col
            span={8}
            style={{
              transition: "all 0.3s ease-in-out",
              maxHeight: "100%",
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Button
              type="default"
              onClick={() => setShowImage(false)}
              style={{ marginBottom: 16, alignSelf: "flex-end" }}
              icon={<RightOutlined />}
            >
              Ẩn ảnh
            </Button>
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              style={{ width: "100%", height: "auto" }}
            />
          </Col>
        )}
        {!showImage && (
          <Button
            type="default"
            onClick={() => setShowImage(true)}
            style={{ position: "absolute", right: 30, top: 95 }}
            icon={<LeftOutlined />}
          >
            Hiện ảnh
          </Button>
        )}
      </Row>
      <Card title="Nguyên liệu" style={{ marginTop: 24 }}>
        <Table
          dataSource={ingredients}
          columns={ingredientColumns}
          rowKey="ingredientId"
          pagination={false}
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsAddingIngredient(true)}
          style={{ marginTop: 16 }}
        >
          Thêm nguyên liệu
        </Button>
      </Card>
      <Modal
        visible={isAddingIngredient}
        title="Thêm nguyên liệu mới"
        onCancel={() => setIsAddingIngredient(false)}
        onOk={handleAddIngredient}
      >
        <Form layout="vertical">
          <Form.Item label="Nguyên liệu">
            <Select
              showSearch
              placeholder="Tìm kiếm nguyên liệu"
              onChange={(value) => setSelectedIngredient(value)}
            >
              {allIngredients.map((ingredient) => (
                <Option
                  key={ingredient.ingredientId}
                  value={ingredient.ingredientId}
                >
                  {ingredient.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Khối lượng (g)">
            <InputNumber
              min={1}
              value={ingredientWeight}
              onChange={(value) => setIngredientWeight(value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default DishDetail;
