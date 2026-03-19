const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
// Add more route imports here as your project grows:
// const userRoutes = require("./user.routes");
// const productRoutes = require("./product.routes");

router.use("/auth", authRoutes);
// router.use("/users", userRoutes);
// router.use("/products", productRoutes);

module.exports = router;
