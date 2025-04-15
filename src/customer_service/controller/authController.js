const { loginSuccessService } = require('../services/authService');

const loginSuccess = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Missing Input',
            });
        }

        let response = await loginSuccessService(id);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in auth controller:', error);
        res.status(500).json({
            status: 'ERR',
            message: 'Fail at auth controller',
        });
    }
};

module.exports = {
    loginSuccess,
};
