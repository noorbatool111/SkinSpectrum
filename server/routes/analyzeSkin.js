const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:5001";

router.post("/analyze-skin", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath)); // ✅ was "file", Flask expects "image"

    const response = await axios.post(
      `${PYTHON_API_URL}/analyze`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000, // 60s — TTA takes time
      }
    );

    fs.unlinkSync(filePath);
    return res.json(response.data);

  } catch (error) {
    console.error("analyzeSkin error:", error.message);
    if (error.response) {
      // Python server responded with an error
      console.error("Python server response:", error.response.status, error.response.data);
      return res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error("Python ML server is not running on", PYTHON_API_URL);
      return res.status(503).json({ error: "ML server is not running. Start python main.py" });
    }
    return res.status(500).json({ error: "Analysis failed", detail: error.message });
  }
});

module.exports = router;