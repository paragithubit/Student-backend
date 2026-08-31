const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
    register,
    login,
    forgotPassword,
    getMe,
    resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);

//  ADD THESE
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);


module.exports = router;