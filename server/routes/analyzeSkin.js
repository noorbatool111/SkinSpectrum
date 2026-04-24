const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// storage config
const upload = multer({ dest: "uploads/" });

router.post("/analyze-skin", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // send image to Python API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      "http://127.0.0.1:8001/analyze",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // delete temp file
    fs.unlinkSync(filePath);

    return res.json(response.data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;