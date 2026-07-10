const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Use existing uploads directory
const upload = multer({ dest: "uploads/" });

router.post("/analyze-melanoma", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const filePath = req.file.path;

    // Send image to Python ML server
    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));

    // Python server runs on port 5001 by default in main.py
    const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://127.0.0.1:5001";

    const response = await axios.post(
      `${PYTHON_SERVER_URL}/analyze-melanoma`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    // Clean up temp file
    fs.unlinkSync(filePath);

    return res.json(response.data);

  } catch (error) {
    console.error("Melanoma Analysis Error:", error.message);
    
    // Clean up file if it exists and error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ 
      error: "Melanoma analysis failed", 
      details: error.response ? error.response.data : error.message 
    });
  }
});

module.exports = router;
