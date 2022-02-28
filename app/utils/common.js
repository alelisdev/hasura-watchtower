const bcrypt = require("bcryptjs");

const hashPassword = async (plain) => {
    return await bcrypt.hash(plain, 8);
};

module.exports = {
    hashPassword
}