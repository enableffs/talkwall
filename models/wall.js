var mongoose = require('mongoose');
var Message = require('./message');
var Question = require('./question').schema;
var Schema = mongoose.Schema;

// define the schema for our message model
var wallSchema = Schema({
    pin:            { type: String },
    label:          { type: String },
    theme:          { type: String },
    createdAt:      { type: Date, default: Date.now },
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    organisers:     [ { type: Schema.Types.ObjectId, ref: 'User', default: null } ],
    closed:         { type: Boolean, default: false },
    questions:      [Question]
});

wallSchema.pre('remove', function(next) {

    for(var i=0; i< this.questions.length; i++) {
        Message.remove({ _id: { $in: this.questions[i].messages } }).exec(function(error, result) {
        });
    }
    next();


});

module.exports = mongoose.model('Wall', wallSchema);
