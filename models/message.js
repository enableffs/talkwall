var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our message model
var messageSchema = Schema({
    question_id:    { type: Schema.Types.ObjectId, ref: 'Question', default: null},
    createdAt:      { type: Date, default: Date.now },
    text:           { type: String, default: "" },
    creator:        { type: String }, // nickname
    deleted:        { type: Boolean, default: false },
    origin: [
        {
            nickname:   { type: String },
            message_id: { type: String, default: "" }
        }
    ],
    edits: [
        {
            date:   { type: Date },
            text:   { type: String }
        }
    ],
    board:          Schema.Types.Mixed

    /*
        board:  {
            nickname: {                         here, 'nickname' should be dynamically allocated
                xpos:   { type: Number },
                ypos:   { type: Number },
                highlighted: { type: Boolean, default: false }
            }
        }

     */
});

module.exports = mongoose.model('Message', messageSchema);
