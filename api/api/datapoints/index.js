const express 			= require('express');
const router	 		= express.Router();
const controller 		= require('./controller');

router.route('/').post(controller.postEvent);
router.route('/').get(controller.getEvents);

module.exports = router;