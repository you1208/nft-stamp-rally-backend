const express = require('express');
const router = express.Router();
const compositeController = require('../controllers/compositeController');

router.post('/', compositeController.createComposite);
router.get('/user/:userId', compositeController.getUserComposites);

module.exports = router;
// 高解像度画像生成
router.post('/:compositeId/high-res', compositeController.generateHighResImage);