const bcrypt = require("bcryptjs");

// hash password if it exists
const hashPassword = async (req) => {
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 8);
    }
};

module.exports = hashPassword;
