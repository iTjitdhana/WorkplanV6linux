  const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/', async (req, res) => {
  try {
    console.log("[Proxy] ส่งข้อมูลไป Google Sheet:", req.body);
    console.log("[Proxy] Sheet Name:", req.body.sheetName);
    console.log("[Proxy] Sheet Name length:", req.body.sheetName ? req.body.sheetName.length : 0);
    console.log("[Proxy] Sheet Name bytes:", req.body.sheetName ? Buffer.from(req.body.sheetName).toString('hex') : 'null');
    console.log("[Proxy] Rows count:", req.body.rows ? req.body.rows.length : 0);
    
    const response = await fetch('https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    
    console.log("[Proxy] Google Sheet response status:", response.status);
    const result = await response.text();
    console.log("[Proxy] Google Sheet response:", result);
    
    if (!response.ok) {
      console.error("[Proxy] Google Sheet error status:", response.status);
      throw new Error(`Google Sheet error: ${response.status}`);
    }
    
    res.status(200).send(result);
  } catch (err) {
    console.error("[Proxy] Google Sheet proxy error:", err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router; 