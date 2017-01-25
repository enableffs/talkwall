var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = Schema({
    q_id:           { type: Schema.Types.ObjectId, ref: 'Question', default: null},
    type:           { type: String },
    itemid:         { type: String },
    nick:           { type: String },
    text:           { type: String },
    stamp:          { type: Date },
    diff:           { x: { type: Number }, y: { type: Number } },
    basedOn:    {
        itemid: { type: String },
        nick:   { type: String },
        text:   { type: String }
    }
});

module.exports = mongoose.model('Log', logSchema);
