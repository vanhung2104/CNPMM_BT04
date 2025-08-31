import { useContext, useState } from "react";
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useContext(AuthContext);

  const [current, setCurrent] = useState("home");

  // Xử lý khi click menu
  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  // Danh sách item cho Menu
  const items: MenuProps["items"] = [
    {
      label: <Link to="/">Home</Link>,
      key: "home",
      icon: <HomeOutlined />,
    },
    ...(isAuthenticated
      ? [
          {
            label: <Link to="/user">Users</Link>,
            key: "user",
            icon: <UsergroupAddOutlined />,
          },
        ]
      : []),
    {
      label: `Welcome ${user?.email ?? "Guest"}`,
      key: "SubMenu",
      icon: <SettingOutlined />,
      children: isAuthenticated
        ? [
            {
              label: (
                <span
                  onClick={() => {
                    localStorage.removeItem("access_token"); // 👈 sửa từ clear() sang removeItem()
                    setCurrent("home");
                    setAuth({
                      isAuthenticated: false,
                      user: { email: "", name: "" },
                    });
                    navigate("/");
                  }}
                >
                  Đăng xuất
                </span>
              ),
              key: "logout",
            },
          ]
        : [
            {
              label: <Link to="/login">Đăng nhập</Link>,
              key: "login",
            },
          ],
    },
  ];

  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;
