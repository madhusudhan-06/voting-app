const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/electionRoutes");
const faceRecognitionRoutes = require("./routes/faceRecognitionRoutes");
const multer = require("multer");
dotenv.config();

const User = require("./models/User");

const app = express();

app.use(cors({origin:"*"}));


app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
app.use(fileUpload());

app.use(multer().single("faceImage")); 

mongoose.connect(process.env.MONGO_URI)
.then(async () =>{
     console.log("MongoDB connected");
     await User.init();
})
.catch((error) => console.error("MongoDB connection error:", error));

app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/face", faceRecognitionRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});