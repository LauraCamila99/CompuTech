const { User } = require("../../config/db");
const sendEmail = require("../../config/sendEmail");

const getAllUsers = async () => {
	const users = await User.findAll();
	return users;
};

module.exports = getAllUsers;