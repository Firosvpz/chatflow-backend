import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
let io;

export const setSocketServerInstance = (socketInstance) => {
    io = socketInstance;
}

export const sendMessage = async (req, res) => {
    try {
        const { userId: recieverId } = req.params
        const senderId = req.userId
        const { message } = req.body

        let conversation = await Conversation.findOne(
            {
                participants: {
                    $all:
                        [
                            senderId, recieverId
                        ]
                }
            }
        )

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId]
            })
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            message,
        })
        // console.log('new', newMessage);


        if (newMessage) {
            conversation.messages.push(newMessage._id)
        }
        // await conversation.save()
        // await newMessage.save()

        // This for run in parellel
        await Promise.all([conversation.save(), newMessage.save()])

        io.to(recieverId).emit('sendMessage', newMessage)
        io.to(senderId).emit('sendMessage', newMessage)
        res.status(201).json({ message: "message sent successfully", newMessage })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId: userToChat } = req.params
        const senderId = req.userId

        if (!userToChat || !senderId) {
            return res.status(400).json({
                success: false,
                message: 'Both user IDs are required'
            });
        }


        const conversation = await Conversation.findOne(
            {
                participants: {
                    $all: [senderId, userToChat]
                }
            }
        ).populate('messages')

        if (!conversation) return res.status(400).json([])

        const messages = conversation.messages
        res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const sendMessageWIthFile = async (req, res) => {
    try {


        const { recieverId } = req.params
        const senderId = req.userId
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const message = await Message.create({
            senderId,
            recieverId,
            file: req.file.path,
            type: "image"
        });
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recieverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recieverId],
                messages: [message._id]
            });
        } else {
            conversation.messages.push(message._id);
            await conversation.save();
        }

        io.to(recieverId).emit('sendMessage', message)
        io.to(senderId).emit('sendMessage', message)
        return res.status(200).json(message);

    } catch (error) {
        console.error("Error sending file:", error);
        return res.status(500).json({ error: error.message });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { recieverId } = req.params
        const senderId = req.userId
        const { message } = req.body


    } catch (error) {

    }
}