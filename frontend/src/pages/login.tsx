import React, { useContext } from "react";
import { Button, Col, Divider, Form, Input, notification, Row } from "antd";
import { loginApi } from "../util/api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";
import { ArrowLeftOutlined } from "@ant-design/icons";

// Kiểu dữ liệu form login
interface LoginFormValues {
  email: string;
  password: string;
}

// Kiểu dữ liệu trả về từ loginApi
interface LoginResponse {
  EC: number;
  EM?: string;
  token?: string;
  user?: {
    email?: string;
    name?: string;
  };
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const onFinish = async (values: LoginFormValues) => {
    try {
      const { email, password } = values;
      const res = (await loginApi(email, password)) as unknown as LoginResponse;

      if (res && res.EC === 0) {
        // Lưu token
        if (res.token) {
          localStorage.setItem("access_token", res.token);
        }

        // Lưu user data
        const userData = {
          email: res?.user?.email ?? "",
          name: res?.user?.name ?? "",
        };
        localStorage.setItem("user_data", JSON.stringify(userData));

        setAuth({
          isAuthenticated: true,
          user: userData,
        });

        notification.success({
          message: "Login successfully",
          description: `Welcome back ${res?.user?.name ?? ""}`,
        });

        navigate("/");
      } else {
        notification.error({
          message: "Login failed",
          description: res?.EM ?? "Something went wrong",
        });
      }
    } catch{
      notification.error({
        message: "Login failed",
        description: "Unexpected error occurred",
      });
    }
  };

  return (
    <Row justify="center" style={{ marginTop: "30px" }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset
          style={{
            padding: "15px",
            margin: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <legend>Đăng nhập</legend>
          <Form<LoginFormValues>
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Link to="/">
            <ArrowLeftOutlined /> Back to home
          </Link>

          <Divider />

          <div style={{ textAlign: "center" }}>
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </fieldset>
      </Col>
    </Row>
  );
};

export default LoginPage;
