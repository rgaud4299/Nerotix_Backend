const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Import Middlewares
const requestContext = require('./middleware/requestContext');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productManagementRoutes = require('./routes/productManagementRoutes');
const settingManagementRoutes = require('./routes/settingManagements');
const msgManagementRoutes = require('./routes/msgManagementRoutes');
const devloperAPi= require('./routes/devloperApiRoutes');
const walletRoutes = require("./routes/walletApiRoutes")

const path = require("path");
const app = express();
const HOST = "0.0.0.0";
// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestContext);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', authRoutes, userRoutes);
app.use('/api/v1/developer-api',devloperAPi);
app.use('/api/v1/product-management', productManagementRoutes);
app.use('/api/v1/setting-management', settingManagementRoutes);
app.use('/api/v1/msg-management', msgManagementRoutes);
app.use('/api/v1/wallet-management', walletRoutes )

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, HOST,() => {
  console.log(` Server running at http://${HOST}:${PORT}`);
});




