import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true,
  },
  languages: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userSince: {
    type: Date,
    default: Date.now,
  },
  profilePictureLocation: {
    type: String,
    default: "",
  },
  friends: [{
    friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
  }],
  role: {
    type: String,
    default: "user",
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;
