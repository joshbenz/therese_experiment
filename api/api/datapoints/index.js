const express 			= require('express');
const router	 		= express.Router();
const controller 		= require('./controller');

router.route('/').post(controller.postdatapoint);
router.route('/').get(controller.getDatapoints);

module.exports = router;