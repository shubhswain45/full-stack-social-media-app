import { Post, Reply } from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy) {
			return res.status(400).json({ error: "Please Provide PostedBy UserId" });
		}
		if (!text) {
			return res.status(400).json({ error: "text field are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);

	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const currentUserId = req.user._id;
		const { id: postId } = req.params;

		if (!postId) {
			return res.status(404).json({ error: "Post not found" });
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const isAlreadyLike = post.likes.includes(currentUserId);

		if (isAlreadyLike) {
			// Unlike Post
			await Post.updateOne({ _id: postId }, { $pull: { likes: currentUserId } });
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			// Like Post
			await Post.updateOne({ _id: postId }, { $push: { likes: currentUserId } });
			res.status(200).json({ message: "Post liked successfully" });
		}

	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		// Validate input
		if (!text) {
			return res.status(400).json({ error: "Please write something before sending" });
		}

		// Find the post
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// Create a new reply
		const reply = new Reply({
			userId,
			text,
			userProfilePic,
			username,
		});

		// Push the new reply to the post's replies
		post.replies.push(reply);

		// Save the post with the new reply
		await post.save();

		// Fetch the reply from the database to get the createdAt field
		const newReply = post.replies.find(r => r._id.equals(reply._id));

		// Send success response with the new reply including createdAt
		res.status(200).json(newReply);
	} catch (err) {
		// Handle errors
		res.status(500).json({ error: err.message });
	}
};


const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username })
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 })
		res.status(200).json(posts)
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts }


