const mongoose 	= require('mongoose');
const queries 	= require('./../query');

const postdatapoint = async (request, response) => {
	try {
		const newDatapoint = await queries.createDatapoint(request.body.data);

		if(newDatapoint.errors) throw new Error('newDatapoint.errors');
		response.json({ success: true, message: 'Event Created', result: newDatapoint });
	} catch(error) {
		response.json({ success: false, message: 'Failed to Create dataPoint' });
		//return error;
	}
};

const getDatapoints = async (request, response) => {
	try {
		const dataPoints = await queries.getDatapoints();
		response.json({ success: true, result: dataPoints });
	} catch(error) {
		response.json({success: false, error: error, message: "Unable to get dataPoints"});
		//return error;
	}
};

const putDataPoint = async (request, response) => {
	try {
		const updatedDataPoint = await queries.updateDataPoint(request.body.data);
		response.json({ success: true, result: updatedDataPoint, message: "Successfully Updated Data point" });
	} catch(error) {
		response.json({ success: false, message: "Unsuccessfully Updated Data point" });
		return error;
	}
}

module.exports = {
    postdatapoint,
	getDatapoints,
	putDataPoint
};