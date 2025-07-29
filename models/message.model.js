import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
         recieverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        message:{
            type:String,
        },
        file:{
          type:String
        },
        type:{
            type:String,enum:["text","image"],default:"text"
        }

    },
    {
        timestamps:true
    }
)

const Message = mongoose.model('Message',messageSchema)
export default Message;