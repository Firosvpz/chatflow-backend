import mongoose from "mongoose";
import User from "../models/user.model.js"
import Conversation from "../models/conversation.model.js";

export const getSidebarUsers = async (req, res) => {
    try {
        const loggedInUserId = req.userId;

        // Get all users except the logged-in one
        const allUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("name image email phoneNumber isOnline lastSeen updatedAt");

        // Get conversations to include last message info
        const conversations = await Conversation.find({
            participants: loggedInUserId
        }).populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 },
            select: 'message createdAt'
        });

        // Map users with conversation data
        const usersWithChatData = allUsers.map(user => {
            const userConversation = conversations.find(conv =>
                conv.participants.some(p => p.equals(user._id)));

            const lastMessage = userConversation?.messages[0];

            return {
                id: user._id,
                name: user.name,
                image: user?.image || "/public/profile.png?height=40&width=40",
                status: user.isOnline ? "online" : "offline",
                lastMessage: lastMessage?.message || "No messages yet",
                lastSeen: user.lastSeen || user.updatedAt,
                unread: 0, // You'll need to implement unread count logic
                email: user.email,
                phone: user.phoneNumber,
                lastMessageTime: lastMessage?.createdAt || null
            };
        });
        usersWithChatData.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });

        res.status(200).json(usersWithChatData);
    } catch (error) {
        console.error("Error in getSidebarUsers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};