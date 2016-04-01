var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExampleSchema = new Schema({
    _id: {type: String, required: true}
});

module.exports = mongoose.model('Example', ExampleSchema);