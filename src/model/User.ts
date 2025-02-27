import mongoose, { Document, Schema } from "mongoose";


export interface Message extends Document{
    Content: string;
    createdAt : Date
}




export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    isVerified: boolean;

}
const UserSchema:Schema<User> = new Schema({
    username:{
        type: String,
        required:true,
        unique:true
        },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verifyCode:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }

    

})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",UserSchema)
export default UserModel ;

