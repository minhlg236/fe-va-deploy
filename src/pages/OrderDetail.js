import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import axios from "axios";
import "../styles/OrderDetail.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("roleId");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => navigate("/orders-management")}
      >
        Quản lý đơn hàng
      </div>
      <div className="sidebar-item logout" onClick={handleLogout}>
        Đăng xuất
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate();
  const location = useLocation(); // Lấy state từ navigate
  const [order, setOrder] = useState(location.state?.order || null); // Lấy dữ liệu từ state hoặc null
  const [orderDetails, setOrderDetails] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderDetailByOrderId/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const paymentResponse = await axios.get(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrderDetails(orderResponse.data);
        if (paymentResponse.data && paymentResponse.data.length > 0) {
          setPaymentDetails(paymentResponse.data[0]);
        } else {
          setPaymentDetails(null);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        alert("Không thể tải thông tin chi tiết đơn hàng.");
        navigate("/orders-management");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, token, navigate]);

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="content">
        <div className="order-detail-container">
          <h2>Thông tin chi tiết của Đơn hàng</h2>

          {order && (
            <div className="order-info">
              <p>
                <strong>Địa chỉ giao hàng:</strong>{" "}
                {order.deliveryAddress || "Không có dữ liệu"}
              </p>
              <p>
                <strong>Tổng giá:</strong>{" "}
                {order.totalPrice
                  ? `${order.totalPrice} VND`
                  : "Không có dữ liệu"}
              </p>
              <p>
                <strong>Ghi chú:</strong> {order.note || "Không có dữ liệu"}
              </p>
              <p>
                <strong>Phí giao hàng:</strong>{" "}
                {order.deliveryFee
                  ? `${order.deliveryFee} VND`
                  : "Không có dữ liệu"}
              </p>
            </div>
          )}

          <div className="order-section">
            <h2>Thông tin món ăn</h2>
            {orderDetails.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Tên món</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((item) => (
                    <tr key={item.orderDetailId}>
                      <td>{item.dishName}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Không có món ăn nào trong đơn hàng.</p>
            )}
          </div>

          <div className="payment-section">
            <h2>Thông tin thanh toán</h2>
            {paymentDetails ? (
              <ul>
                <li>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {paymentDetails.paymentMethod || "Không có dữ liệu"}
                </li>
                <li>
                  <strong>Trạng thái:</strong>{" "}
                  {paymentDetails.paymentStatus || "Không có dữ liệu"}
                </li>
                <li>
                  <strong>Thời gian thanh toán:</strong>{" "}
                  {paymentDetails.paymentDate
                    ? new Date(paymentDetails.paymentDate).toLocaleString(
                        "vi-VN"
                      )
                    : "Không có dữ liệu"}
                </li>
              </ul>
            ) : (
              <p>Không có thông tin thanh toán.</p>
            )}
          </div>

          <div className="top-buttons">
            <button
              className="back-button"
              onClick={() => navigate("/orders-management")}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
