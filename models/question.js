var mongoose = require('mongoose');
var Message = require('./message');
var Schema = mongoose.Schema;

// define the schema for our message model
var questionSchema = Schema({
    createdAt:      { type: Date, default: Date.now },
    label:          { type: String },
    grid:           { type: String, default: 'none' },  // 'none', 'horizontal', 'vertical', 'both'
    participants:   [ { type: String } ],
    messages:       [ { type: Schema.Types.ObjectId, ref: 'Message', default: null } ]
});

questionSchema.pre('remove', function(next) {
    Message.find({ _id: { $in: this.messages } }).exec(function(error, messages) {
        messages.forEach(function(m) {
            m.remove();
        });
        next();
    });
});

module.exports = mongoose.model('Question', questionSchema);
