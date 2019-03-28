const datapoint = require('./../model');

const createDatapoint = async (data) => {
	try {
		const newDataPoint = new datapoint(data);
		return await newDataPoint.save();
	} catch(error) {
		console.log(error);
		return error;
	}
};

const getDatapoints = async () => {
	try {
		let datapoints = await Event.find({});

		return datapoints;
	} catch(error) {
		return error;
	}
};

module.exports = {
    createDatapoint,
    getDatapoints
};