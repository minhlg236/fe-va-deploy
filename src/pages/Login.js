import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";

// Define Role IDs
const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  CUSTOMER: 3,
  MODERATOR: 4,
  NUTRITIONIST: 5,
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/login",
        { phoneNumber, password }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("roleId", user.roleId);
        localStorage.setItem("userId", user.userId);

        // Role-based Navigation
        switch (user.roleId) {
          case ROLES.ADMIN:
            navigate("/admin");
            break;
          case ROLES.STAFF:
            navigate("/orders-management");
            break;
          case ROLES.CUSTOMER:
            navigate("/dashboard");
            break;
          case ROLES.MODERATOR:
            navigate("/articleModerate-management");
            break;
          case ROLES.NUTRITIONIST:
            navigate("/dishes-management");
            break;
          default:
            setError("Vai trò người dùng không xác định!");
            break;
        }
      } else {
        setError("Số điện thoại hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container login-container">
      <div className="row justify-content-center align-items-center h-100">
        <div className="col-lg-6 col-md-8">
          <div className="card shadow-lg p-4">
            <div className="card-body">
              <h2 className="text-center mb-4">Đăng nhập</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    className="form-control"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-4">
                  Đăng nhập
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
