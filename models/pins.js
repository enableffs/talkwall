var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Message schema
var PinSchema = new Schema({
    pnumber:            { type: Number, unique: true }
});

// Export Models
module.exports = mongoose.model('Pin', PinSchema);