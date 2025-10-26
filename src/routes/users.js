const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/acquire', userController.acquireStamp);
router.get('/:userId/info', userController.getUserInfo);
router.get('/:userId/stamps', userController.getUserStamps);

module.exports = router;