import mongoose from "mongoose";

// Define and export the reply schema
const replySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    userProfilePic: {
      type: String,
    },
    username: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const Reply = mongoose.model("Reply", replySchema); // Export Reply model

// Define and export the post schema
const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      // Array of user IDs
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [], // Ensure default value is an empty array
    },
    replies: [replySchema], // Use the reply schema here
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields for the post
  }
);

const Post = mongoose.model("Post", postSchema); // Export Post model

export { Post, Reply };


//https://social-media-app-l3y5.onrender.com/auth