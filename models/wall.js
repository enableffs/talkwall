var mongoose = require('mongoose');
var Question = require('./question');
var QuestionSchema = Question.schema;
var Schema = mongoose.Schema;

// define the schema for our message model
var wallSchema = Schema({
    pin:            { type: String },
    label:          { type: String },
    createdAt:      { type: Date, default: Date.now },
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    closed:         { type: Boolean, default: false },
    questions:      [QuestionSchema]
});

wallSchema.pre('remove', function(next) {
    Question.find({ _id: { $in: this.questions } }).exec(function(error, questions) {
        questions.forEach(function(q) {
            q.remove();
        });
        next();
    });
});

module.exports = mongoose.model('Wall', wallSchema);
