const jwt 		= require('jsonwebtoken');
const config 	= require('./../../../database/config'); 

const createToken = user => {
	return jwt.sign({
		sub					: user._id,
		email				: user.email,
		iss			: 'api.euriditionlabs.com',
		aud			: 'api.euriditionlabs.com'
	},
		config.secret, //////////////////////////////////////change this
		{ algorithm: 'HS256', expiresIn: '1h' }
	);
};

module.exports = { createToken };
