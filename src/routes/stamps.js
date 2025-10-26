const express = require('express');
const router = express.Router();
const stampController = require('../controllers/stampController');

router.get('/', stampController.getAllStamps);
router.get('/qr/:code', stampController.getStampByQRCode);
router.get('/:stampId/qrcode', stampController.generateQRCode);
router.post('/', stampController.createStamp);

module.exports = router;