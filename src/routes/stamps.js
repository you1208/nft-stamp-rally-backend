const express = require('express');
const router = express.Router();
const stampController = require('../controllers/stampController');

// 全スタンプ取得
router.get('/', stampController.getAllStamps);

// スタンプ獲得
router.post('/acquire', stampController.acquireStamp);

// ユーザーのスタンプ取得
router.get('/user/:userId', stampController.getUserStamps);

module.exports = router;