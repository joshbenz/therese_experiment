const mongoose 	= require('mongoose');
const Schema	= mongoose.Schema;

const dataModel = new Schema({
    date:               { type: Date },
    dogName:            { type: String },
    orderOfBowls:       { type: String },
    chickenBowl:        { type: String },
    nBowlsVisited:      { type: Number },
    bowlsVisitedOrder:  { type: String },
    timeToChicken:      { type: Number },
    comments:           { type: String }
});

module.exports = mongoose.model('datapoint', dataModel);