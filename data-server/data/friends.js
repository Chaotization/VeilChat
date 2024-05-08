import { friends } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const createFriend = async (userId1, userId2, status) => {
	if (!userId1 || !userId2 || !status) {
		throw new Error("All fields are required");
	}

	const friendsCollection = await friends();
	const newFriend = {
		userId1: new ObjectId(userId1),
		userId2: new ObjectId(userId2),
		status: status,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const result = await friendsCollection.insertOne(newFriend);
	if (result.insertedCount === 0) {
		throw new Error("Failed to create friend");
	}

	return result.insertedId;
};

const getFriendById = async (friendId) => {
	if (!friendId) {
		throw new Error("Friend ID is required");
	}

	const friendsCollection = await friends();
	const friend = await friendsCollection.findOne({
		_id: new ObjectId(friendId),
	});

	if (!friend) {
		throw new Error("Friend not found");
	}

	return friend;
};

const updateFriendStatus = async (friendId, newStatus) => {
	if (!friendId || !newStatus) {
		throw new Error("Friend ID and new status are required");
	}

	const friendsCollection = await friends();
	const updateResult = await friendsCollection.updateOne(
		{ _id: new ObjectId(friendId) },
		{ $set: { status: newStatus, updatedAt: new Date() } }
	);

	if (updateResult.modifiedCount === 0) {
		throw new Error("Failed to update friend status");
	}

	return true;
};

const deleteFriend = async (friendId) => {
	if (!friendId) {
		throw new Error("Friend ID is required");
	}

	const friendsCollection = await friends();
	const deleteResult = await friendsCollection.deleteOne({
		_id: new ObjectId(friendId),
	});

	if (deleteResult.deletedCount === 0) {
		throw new Error("Failed to delete friend");
	}

	return true;
};

const getFriendsByUserId = async (userId) => {
	if (!userId) {
		throw new Error("User ID is required");
	}

	const friendsCollection = await friends();
	const userFriends = await friendsCollection
		.find({
			$or: [
				{ userId1: new ObjectId(userId) },
				{ userId2: new ObjectId(userId) },
			],
		})
		.toArray();

	return userFriends;
};

export {
	createFriend,
	getFriendById,
	updateFriendStatus,
	deleteFriend,
	getFriendsByUserId,
};
