import { CrownOutlined } from "@ant-design/icons";
import { Result } from "antd";

const HomePage = () => {
    return (
        <div style={{ padding: 20 }} >
            <Result
                icon={<CrownOutlined />}
                title="Welcome to the Home Page"
            />
        </div>
    )
};

export default HomePage;