const {createUserService, loginService, getUserService} = require('../services/userService');

const createUser = async (req, res) => {
    const { email, name, password } = req.body;
    const data = await createUserService(email, name, password);
    return res.status(200).json(data);
}

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                EC: 1,
                EM: 'Email và password không được để trống'
            });
        }

        const data = await loginService(email, password);

        // Kiểm tra nếu service trả về null (lỗi server)
        if (!data) {
            return res.status(500).json({
                EC: 3,
                EM: 'Lỗi server, vui lòng thử lại sau'
            });
        }

        // Kiểm tra mã lỗi từ service
        if (data.EC === 1) {
            // Email không tồn tại
            return res.status(404).json(data);
        }
        
        if (data.EC === 2) {
            // Sai mật khẩu
            return res.status(401).json(data);
        }

        // Login thành công
        return res.status(200).json(data);

    } catch (error) {
        console.error('Login controller error:', error);
        return res.status(500).json({
            EC: 3,
            EM: 'Lỗi server không xác định'
        });
    }
}

const getUsers = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = (req, res) => {
    return res.status(200).json(req.user);
}

module.exports = {
    createUser,
    handleLogin,
    getUsers,
    getAccount
}