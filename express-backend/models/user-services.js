import mongoose from "mongoose";
import {
    userSchema,
    entrySchema,
    userEntriesSchema,
    TagSchema,
    MemberSchema,
    GroupSchema
} from "./user.js";

import dotenv from "dotenv";
dotenv.config();

const uSchema = userSchema;
const eSchema = entrySchema;
const ueSchema = userEntriesSchema;

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

// Adding a newly created user to the database

async function addUser(user) {
    const userModel = getDbConnection().model("users", uSchema);
    try {
        // check for valid entries format
        if (
            user.entries &&
            (!Array.isArray(user.entries) ||
                !user.entries.every((id) =>
                    mongoose.Types.ObjectId.isValid(id)
                ))
        ) {
            throw new Error(
                "Entry(s) format not valid or contains an invalid ObjectId"
            );
        }

        const userToAdd = new userModel(user);
        userToAdd.entries = await addUserEntries(userToAdd._id);
        const savedUser = await userToAdd.save();
        return savedUser;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Adding an entry to the database

async function addEntry(entry) {
    const entryModel = getDbConnection().model(
        "rbt_entries",
        eSchema
    );
    try {
        const entryToAdd = new entryModel(entry);
        const savedEntry = await entryToAdd.save();
        addEntryToEntries(savedEntry._id, entry.user_id);
        return savedEntry;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Adding an entry to the user's userEntries document

async function addEntryToEntries(id, userid) {
    const userEntriesModel = getDbConnection().model(
        "user_entries",
        ueSchema
    );

    const finalEntries =
        await userEntriesModel.findOneAndUpdate(
            { user_id: userid },
            {
                $push: { entries: id }
            }
        );

    return finalEntries;
}

// Creates a new document in userEntries for a given user

async function addUserEntries(id) {
    const userEntriesModel = getDbConnection().model(
        "user_entries",
        ueSchema
    );

    const defaultEntries = {
        user_id: id
    };

    const userEntriesToAdd = new userEntriesModel(
        defaultEntries
    );
    const savedEntries = await userEntriesToAdd.save();
    return savedEntries._id;
}

// Searches for a specific user in DB

async function findUserByUsername(username) {
    const userModel = getDbConnection().model("users", uSchema);
    return await userModel.find({ username: username });
}

// Finds a specific user in DB by ID

async function findUserById(id) {
    const userModel = getDbConnection().model("users", uSchema);
    return await userModel.find({ _id: id });
}

// Finds all entries in DB from a given user

async function getAllEntries(userid) {
    console.log("Getting entries for user:", userid);
    const entryModel = getDbConnection().model(
        "rbt_entries",
        eSchema
    );

    // Convert string ID to MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(userid);
    console.log("Converted ObjectId:", objectId);

    const entries = await entryModel.find({
        user_id: objectId
    });
    console.log("Found entries:", entries);
    return entries;
}

// Finds the UserEntries document for a given user

async function getUserEntriesByUserId(userId) {
    const userEntriesModel = getDbConnection().model(
        "user_entries",
        ueSchema
    );
    return await userEntriesModel.find({ user_id: userId });
}

// Finds an entry by its ID

async function getEntryById(entryId) {
    const entryModel = getDbConnection().model(
        "rbt_entries",
        eSchema
    );
    return await entryModel.find({ _id: entryId });
}

// Adds a reaction object to an Entry document

async function addReactionToEntry(entryId, reactionObject) {
    const entryModel = getDbConnection().model(
        "rbt_entries",

        eSchema
    );

    try {
        // Find the entry object in the database and push the reaction
        return await entryModel.findOneAndUpdate(
            { _id: entryId },
            {
                $push: { reactions: reactionObject }
            }
        );
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Create a tag object and add to tags list

async function addTagObject(tagObject) {
    const tagModel = getDbConnection().model("tags", TagSchema);

    try {
        // CHECK IF TAG ALREADY EXISTS

        const existingTag = await tagModel.findOne({
            user_id: tagObject.user_id,
            tag_name: tagObject.tag_name
        });

        // IF IT DOES, THEN JUST PUSH ENTRY ID

        if (existingTag != null) {
            const updatedTag = await tagModel.findOneAndUpdate(
                { _id: existingTag._id },
                {
                    $push: { entries: tagObject.entries[0] }
                }
            );

            return updatedTag._id;
        } else {
            const tagToAdd = new tagModel(tagObject);
            const savedTag = await tagToAdd.save();
            return savedTag._id;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateTagObject(tagObject) {
    const tagModel = getDbConnection().model("tags", TagSchema);

    const existingTag = await tagModel.findOne({
        user_id: tagObject.user_id,
        tag_name: tagObject.tag_name
    });
    if (existingTag != null) {
        // IF THE TAG EXISTS AND ALREADY HAS THE ENTRY ID, JUST RETURN
        if (
            existingTag.entries.includes(tagObject.entries[0])
        ) {
            return;
        }
    }

    return await addTagObject(tagObject);
}

// Get a tag by its Id
/*async function findTagById(tagId) {
    const tagModel = getDbConnection().model(
        "tags",
        TagSchema
    );
    return await tagModel.find({ _id: tagId });

}*/

// Get all tags by userid

async function getAllTagsByUserId(userId) {
    const tagModel = getDbConnection().model("tags", TagSchema);
    return await tagModel.find({ user_id: userId });
}

/*async function getAllTagsByEntryId(entryId) {
    const tagModel = getDbConnection().model("tags", TagSchema);
    return await tagModel.find({entries: { $in: [entryId]}});
}*/

/* async function deleteEntriesByEntryId(entryId) {
    const entryModel = getDbConnection().model(
        "rbt_entries",
        entrySchema
    );

    await entryModel.findOneAndUpdate(
        { _id: entryId },
        { tags: [] }
    );

    const tagModel = getDbConnection().model("tags", TagSchema);
    const allTagObjects = await tagModel.find({
        entries: { $in: [entryId] }
    });

    for (let i = 0; i < allTagObjects.length; i++) {
        if (allTagObjects[i].entries.length == 1) {
            // if the length of all entries is 1, we can delete the Tag Object itself
            const deletedTag = await tagModel.findOneAndDelete({
                _id: allTagObjects[i]._id
            });
        } else {
            // Otherwise, we can just delete the entry from it
            const removedEntryTag =
                await tagModel.findOneAndUpdate(
                    { _id: allTagObjects[i]._id },
                    {
                        $pull: {
                            entries: entryId
                        }
                    }
                );
        }
    }
} */

// Add tags to entry
async function addTagToEntry(tagId, entryId) {
    const entryModel = getDbConnection().model(
        "rbt_entries",
        eSchema
    );

    try {
        // Find the entry object in the database and push the tag
        return await entryModel.findOneAndUpdate(
            { _id: entryId },
            {
                $push: { tags: tagId }
            }
        );
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateUser(userId, updates) {
    const userModel = getDbConnection().model("users", uSchema);
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                ...(updates.email && {
                    username: updates.email
                }),
                ...(updates.name && {
                    first_name: updates.name
                })
            },
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// Define the entry model
const EntryModel = getDbConnection().model(
    "rbt_entries",
    eSchema
);

async function removeGroupFromUser(userId, groupId) {
    const userModel = getDbConnection().model("users", uSchema);
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: { groups: groupId }
            },
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        console.log(error);
        return false;
    }
}



export {
    addUser,
    findUserByUsername,
    addEntry,
    getAllEntries,
    findUserById,
    getUserEntriesByUserId,
    getEntryById,
    addReactionToEntry,
    EntryModel,
    updateUser,
    removeGroupFromUser,
    getAllTagsByUserId,
    addTagToEntry,
    addTagObject,
    updateTagObject
};
