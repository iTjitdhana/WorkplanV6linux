const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/send-to-google-sheet', async (req, res) => {
  try {
    console.log("[Proxy] ส่งข้อมูลไป Google Sheet:", req.body);
    const response = await fetch('https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const result = await response.text();
    console.log("[Proxy] Google Sheet response:", result);
    res.status(200).send(result);
  } catch (err) {
    console.error("[Proxy] Google Sheet proxy error:", err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router; 