import mongoose from "mongoose";

// USER SCHEMA

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    first_name: String,
    entries: mongoose.Types.ObjectId
});

// ENTRY SCHEMA

const EntrySchema = new mongoose.Schema({
    user_id: mongoose.Types.ObjectId,
    date: Number,
    is_public: Boolean,
    rose_text: String,
    bud_text: String,
    thorn_text: String,
    reactions: [
        {
            group_id: mongoose.Types.ObjectId,
            user_reacting_id: mongoose.Types.ObjectId,
            reaction: String
        }
    ],
    tags: [mongoose.Types.ObjectId],
    tag_string: String
});

// USER ENTRIES SCHEMA

const UserEntriesSchema = new mongoose.Schema({
    user_id: mongoose.Types.ObjectId,
    entries: [mongoose.Types.ObjectId]
});

// GROUP SCHEMA

const GroupSchema = new mongoose.Schema({
    group_code: String,
    name: String
});

// MEMBER SCHEMA

const MemberSchema = new mongoose.Schema({
    user_id: mongoose.Types.ObjectId,
    group_id: mongoose.Types.ObjectId,
    isAdmin: Boolean
});

// TAG SCHEMA

const TagSchema = new mongoose.Schema({
    tag_name: String,
    user_id: mongoose.Types.ObjectId,
    entries: [mongoose.Types.ObjectId]
});


// export all schemas
export {
    UserSchema as userSchema,
    EntrySchema as entrySchema,
    UserEntriesSchema as userEntriesSchema,
    GroupSchema,
    TagSchema,
    MemberSchema
};
