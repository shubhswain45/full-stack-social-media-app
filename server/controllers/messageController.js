import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

const sendMessage = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        let { img } = req.body;
        const senderId = req.user._id;

        // Check if the recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found." });
        }

        // Check if sender and recipient are the same
        if (senderId === recipientId) {
            return res.status(400).json({ error: "Cannot send a message to yourself." });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        });


        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        // Create and save new message with initial null conversationId
        const newMessage = new Message({
            conversationId: conversation ? conversation._id : null,
            sender: senderId,
            text: message,
            img: img || ""
        });

        await newMessage.save();

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: message || "Send a photo",
                    sender: senderId,
                    sendingTime: newMessage.createdAt, // Use createdAt for sendingTime
                    seen: false
                },
            });
            await conversation.save();

            // Update conversationId in the newly created message
            newMessage.conversationId = conversation._id;
            await newMessage.save();
        } else {
            // Update the last message in the existing conversation
            await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    text: message || "Send a photo",
                    sender: senderId,
                    sendingTime: newMessage.createdAt, // Use createdAt for sendingTime
                    seen: false
                },
            });

            // Update conversationId in the message
            newMessage.conversationId = conversation._id;
            await newMessage.save();
        }

        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    const { otherUserId } = req.params;
    const userId = req.user._id;
    try {
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] }
        })

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" })
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getConversations = async (req, res) => {
    const userId = req.user._id;
    try {
        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic"
        })

        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(participant => participant._id.toString() !== userId.toString())
        })
        res.status(200).json(conversations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
// write a fucntion to sum two num
export { sendMessage, getMessages, getConversations }