import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'; // Correct import
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { Post } from "../models/postModel.js";

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        if (!name || !email || !username || !password) {
            return res.status(400).json({ error: "Please Fill All The Fields" });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });
        await newUser.save();

        // Generate token and set cookie
        generateTokenAndSetCookie(newUser._id, res); // Ensure this function is properly defined

        // Respond with user details
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            bio: newUser.bio,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        // Error handling
        res.status(500).json({ error: error.message });
        console.log("Error in signupUser: ", error.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Please Fill Both Fields" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "User Does't Exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Password Is Incorrect" });
        }

        if(user.isFrozen){
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};

const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};

const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString())
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in followUnFollowUser: ", error.message);
    }
};

const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId)
        if (!user) return res.status(400).json({ error: "User not found" });

        const userAlreadyExist = await User.findOne({ username })
        if (userAlreadyExist && (user.username !== userAlreadyExist.username)) return res.status(400).json({ error: "User Already Exist" });

        if (req.params.id !== userId.toString())
            return res.status(400).json({ error: "You cannot update other user's profile" });

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        // to update the comment with new username and img
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.getUserProfile,
                }
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        )
        user.password = null;

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in updateUser: ", error.message);
    }
}

const getUserProfile = async (req, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    const { query } = req.params;

    try {
        let user;

        // query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        // Exclude the current user and the users that currentuser already follow;
        const userId = req.user._id;

        // Step 1: Get the list of users that the current user is following
        const userFollowByYou = await User.findById(userId).select("following");

        // Step 2: Aggregate users excluding those already followed by the current user
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }, // Exclude the current user
                }
            },
            {
                $sample: { size: 10 } // Randomly sample 10 users
            }
        ]);

        const suggestedUsers = users.filter(user => !userFollowByYou.following.includes(user._id))
        // for doing password null in users not in DataBase
        suggestedUsers.forEach(user => user.password = null)
        res.status(200).json(suggestedUsers.slice(0, 5))

        console.log(userFollowByYou);
    } catch (error) {
        console.log("Error in getSuggestedUsers controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.isFrozen = true;
        await user.save()

        res.status(200).json({ messages: "Account freezed successfully" })
    } catch (error) {
        console.log("Error in freezeAccount controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile, getMe, getSuggestedUsers, freezeAccount };
