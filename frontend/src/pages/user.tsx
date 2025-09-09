import { notification, Descriptions } from "antd";
import { useEffect, useState } from "react";
import { getUserApi} from "../util/api";
import type { User } from "../util/api";

const UserPage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserApi();
      if (res.data) {
        setUser(res.data); // res.data là User
      } else {
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
