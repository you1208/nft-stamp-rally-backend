const express = require('express');
const router = express.Router();
const compositeController = require('../controllers/compositeController');

// NFT合成
router.post('/create', compositeController.createComposite);

// ユーザーの合成NFT一覧
router.get('/user/:userId', compositeController.getUserComposites);

// 高解像度画像生成
router.post('/:compositeId/high-res', compositeController.generateHighResImage);

module.exports = router;