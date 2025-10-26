const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');

router.post('/mint-composite', nftController.mintCompositeToBlockchain);

module.exports = router;