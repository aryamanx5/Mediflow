require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");
const { seedDemoUser } = require("./src/config/demo");

const PORT = process.env.PORT || 3000;

// Connect to Database, then make sure the demo account exists
connectDB().then(seedDemoUser);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Access the server at http://localhost:${PORT}`);
});