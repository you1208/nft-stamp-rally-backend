const express = require('express');
const router = express.Router();
const compositeController = require('../controllers/compositeController');

router.post('/', compositeController.createComposite);
router.get('/user/:userId', compositeController.getUserComposites);

module.exports = router;