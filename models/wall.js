var mongoose = require('mongoose');
var Message = require('./message');
var QuestionSchema = require('./question').schema;
var Schema = mongoose.Schema;

// define the schema for our message model
var wallSchema = Schema({
    pin:            { type: String },
    label:          { type: String },
    createdAt:      { type: Date, default: Date.now },
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', default: null},
    questions:      [QuestionSchema]
});

wallSchema.pre('remove', function(next) {
    Message.find({ _id: { $in: this.questions.messages } }).exec(function(error, messages) {
        messages.forEach(function(m) {
            m.remove();
        });
        next();
    });
});

module.exports = mongoose.model('Wall', wallSchema);
