import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seen: {
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema)

export default Message

