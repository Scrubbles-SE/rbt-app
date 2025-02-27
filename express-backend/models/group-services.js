import mongoose from "mongoose";
import { GroupSchema, MemberSchema } from "./user.js";

import dotenv from "dotenv";
dotenv.config();

let dbConnection;

// Helper function to connect to the database

function getDbConnection() {
    if (!dbConnection) {
        dbConnection = mongoose.createConnection(
            process.env.MONGODB_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    }
    return dbConnection;
}

// Creates a group document

async function createGroup(group) {
    const groupModel = getDbConnection().model(
        "groups",
        GroupSchema
    );
    try {
        const groupToAdd = new groupModel(group);
        const savedGroup = await groupToAdd.save();
        return savedGroup;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Finds a group document from its group code

async function findGroupByCode(code) {
    const groupModel = getDbConnection().model(
        "groups",
        GroupSchema
    );
    return await groupModel.find({ group_code: code });
}

// Finds a group document from its ID

async function findGroupById(id) {
    const groupModel = getDbConnection().model(
        "groups",
        GroupSchema
    );
    return await groupModel.find({ _id: id });
}

// Adds a UserID to a group document's list of members
/*
async function joinGroup(userId, groupId) {
    const groupModel = getDbConnection().model(
        "groups",
        GroupSchema
    );

    try {
        await groupModel.findOneAndUpdate(
            { _id: groupId },
            {
                $push: { users: userId }
            }
        );
    } catch (error) {
        console.log(error);
        return false;
    }

    return await addGroupToUser(userId, groupId);
}
*/

async function joinGroup(userId, groupId, isAdmin) {
    const memberModel = getDbConnection().model(
        "members",
        MemberSchema
    );

    try {
        const memberObject = new memberModel({
            user_id: userId,
            group_id: groupId,
            isAdmin: isAdmin,
        });
        const savedMember = await memberObject.save();
        return savedMember;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getAllGroups(userId) {
    const memberModel = getDbConnection().model(
        "members",
        MemberSchema
    );
    try {
        return await memberModel.find({ user_id: userId });
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getAllUsers(groupId) {
    const memberModel = getDbConnection().model(
        "members",
        MemberSchema
    );
    try {
        return await memberModel.find({ group_id: groupId });
    } catch (err) {
        console.log(err);
        return false;
    }
}

// Add function to remove a member from a group
async function removeMember(userId, groupId) {
    const memberModel = getDbConnection().model(
        "members",
        MemberSchema
    );
    try {
        return await memberModel.findOneAndDelete({
            user_id: userId,
            group_id: groupId
        });
    } catch (err) {
        console.log(err);
        return false;
    }
}

export {
    createGroup,
    findGroupByCode,
    findGroupById,
    joinGroup,
    getAllGroups,
    getAllUsers,
    removeMember
};
