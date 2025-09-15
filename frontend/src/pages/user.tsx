import { notification, Descriptions } from "antd";
import { useContext, useEffect } from "react";
import { getUserApi} from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const UserPage = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserApi();
      if (!res.data) {
        notification.error({
          message: "Unauthorized",
          description: res.EM,
        });
      }
    };
    fetchUser();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      {user ? (
        <Descriptions bordered title="User Info">
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
        </Descriptions>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserPage;
