/*
IMPORTS
*/

// Libraries
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";

// Models
import {
    addUser,
    findUserByUsername,
    addEntry,
    getAllEntries,
    findUserById,
    getUserEntriesByUserId,
    getEntryById,
    EntryModel,
    addReactionToEntry,
    updateUser,
    getAllTagsByUserId,
    addTagObject,
    addTagToEntry,
    deleteEntriesByEntryId
} from "./models/user-services.js";

// Services
import {
    createGroup,
    findGroupByCode,
    joinGroup,
    findGroupById,
    getAllGroups,
    getAllUsers,
    removeMember
} from "./models/group-services.js";

// JWT Utils
import {
    createToken,
    setTokenCookie
} from "./utils/jwt-utils.js";

// Auth Middleware
import { authMiddleware } from "./middleware/auth.js";

// File Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment Variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Express App
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(
    cors({
        origin:
            process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

// After dotenv.config()
console.log("MongoDB URI:", process.env.MONGODB_URI);

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) =>
        console.error("MongoDB connection error:", err)
    );

/* 
HTML ROUTES
*/

/*
ACCOUNT
*/

// REGISTER
/*
 * Need first name, email, and password
 * Checks if email is already in use
 * Hashes password
 * Adds user to database
 */
app.post("/api/register", async (req, res) => {
    const { email, password, first_name } = req.body;

    try {
        const existingUser = await findUserByUsername(email);
        if (existingUser.length > 0) {
            return res.status(400).json({
                message: "This email is already in use!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username: email,
            password: hashedPassword,
            first_name
        };

        const savedUser = await addUser(newUser);
        if (!savedUser) {
            return res.status(500).json({
                message: "Error creating user"
            });
        }

        // Create and set JWT token
        const token = createToken(savedUser._id);
        setTokenCookie(res, token);

        res.status(201).json({
            message: "Success!"
        });
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        res.status(500).json({
            message:
                "There was an error registering, please try again."
        });
    }
});

// CHECK IF USER EXISTS
/*
 * Need email
 * Checks if email is registered
 * Returns boolean indicating existence
 */
app.get("/api/user-exists/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const users = await findUserByUsername(email);
        if (users.length === 0) {
            return res.status(200).json({
                exists: false
            });
        }

        res.status(200).json({
            exists: true,
            firstName: users[0].first_name
        });
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        res.status(500).json({
            message:
                "Error checking user existence. Please try again."
        });
    }
});

// LOGIN
/*
 * Need email and password
 * Checks if email is registered
 * Checks if password is correct
 * Returns user ID
 */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await findUserByUsername(email);
        if (users.length === 0) {
            return res.status(400).json({
                message:
                    "Account with this email address is not registered"
            });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        // Create and set JWT token
        const token = createToken(user._id);
        setTokenCookie(res, token);

        res.status(200).json({
            message: "Success"
        });
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        res.status(500).json({
            message: "Error logging you in. Please try again"
        });
    }
});

// Updates user's name and email (settings call)
app.put("/api/user", authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.userId;

        // If trying to update email, check if new email is already in use
        if (email) {
            const existingUser =
                await findUserByUsername(email);
            if (
                existingUser.length > 0 &&
                existingUser[0]._id.toString() !== userId
            ) {
                return res.status(400).json({
                    message: "This email is already in use!"
                });
            }
        }

        const updatedUser = await updateUser(userId, {
            name,
            email
        });
        if (!updatedUser) {
            return res.status(500).json({
                message: "Error updating user"
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: {
                name: updatedUser.first_name,
                email: updatedUser.username
            }
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message:
                "There was an error updating your information"
        });
    }
});

/*
ENTRIES
*/

// CREATE ENTRY
/*
 * Need user_id, rose_text, bud_text, thorn_text, and is_public
 * Adds entry to database
 */
app.post("/api/entries", authMiddleware, async (req, res) => {
    try {
        const {
            rose_text,
            bud_text,
            thorn_text,
            is_public,
            tags
        } = req.body;
        const userId = new mongoose.Types.ObjectId(req.userId);

        const finalTagString = tags.join(", ");

        if (!rose_text || !bud_text || !thorn_text) {
            return res
                .status(400)
                .json({ error: "All fields are required" });
        }

        const entry = {
            user_id: userId,
            rose_text,
            bud_text,
            thorn_text,
            is_public,
            tag_string: finalTagString,
            date: Date.now()
        };

        const newEntry = await addEntry(entry);
        if (!newEntry) {
            return res
                .status(500)
                .json({ error: "Error creating entry" });
        }

        // ADD TAGS

        const tagStrings = req.body.tags; // array of strings
        const tagIdArray = [];

        // call addTagObject on each given tag -> automatically checks if it exists or not
        for (let i = 0; i < tagStrings.length; i++) {
            let tempTagObject = {
                tag_name: tagStrings[i],
                user_id: userId,
                entries: [newEntry._id]
            };
            const tagId = await addTagObject(tempTagObject);
            const tempEntry = await addTagToEntry(
                tagId,
                newEntry._id
            );
            tagIdArray.push(tagId);
        }

        res.status(201).json(newEntry);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Error creating journal entry"
        });
    }
});

// UPDATE ENTRY
/*
 * Updates an existing entry with new rose, bud, and thorn text & public status
 */
app.patch(
    "/api/entries/:entryId",
    authMiddleware,
    async (req, res) => {
        try {
            const { entryId } = req.params;
            const {
                rose_text,
                bud_text,
                thorn_text,
                is_public,
                tags
            } = req.body;
            const userId = new mongoose.Types.ObjectId(
                req.userId
            );

            const initialTagString = tags.join(", ");
            console.log("TAG STRING:");
            console.log(initialTagString);

            // Verify the entry belongs to the user
            const entry = await EntryModel.findById(entryId);
            if (!entry) {
                return res
                    .status(404)
                    .json({ error: "Entry not found" });
            }

            if (
                entry.user_id.toString() !== userId.toString()
            ) {
                return res.status(403).json({
                    error: "Not authorized to edit this entry"
                });
            }

            const updatedEntry =
                await EntryModel.findByIdAndUpdate(
                    entryId,
                    {
                        rose_text,
                        bud_text,
                        thorn_text,
                        is_public,
                        tag_string: initialTagString
                    },
                    { new: true }
                );

            // UPDATE TAG TABLE

            const updatedTags = req.body.tags;

            await deleteEntriesByEntryId(entryId);

            // Compare each tag and see if it already exists in the database
            const tagIdArray = [];

            for (let i = 0; i < updatedTags.length; i++) {
                let tempTagObject = {
                    tag_name: updatedTags[i],
                    user_id: userId,
                    entries: [entryId]
                };
                const tagId = await addTagObject(tempTagObject);
                const tempEntry = await addTagToEntry(
                    tagId,
                    entryId
                );
                tagIdArray.push(tagId);
            }

            res.status(200).json({
                message: "Entry updated successfully",
                entry: updatedEntry
            });
        } catch (error) {
            console.error("Error updating entry:", error);
            res.status(500).json({
                error: "Error updating entry"
            });
        }
    }
);

// GET USER ENTRIES
/*
 * Need user_id
 * Returns all entries for user
 */
app.get("/api/entries", authMiddleware, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);
        console.log("Fetching entries for userId:", userId);

        const entries = await getAllEntries(userId);
        console.log("Retrieved entries:", entries);
        res.json(entries);
    } catch (err) {
        console.error("Error fetching entries:", err);
        res.status(500).json({
            error: "Error fetching entries"
        });
    }
});

/*
GROUPS
*/

// JOIN GROUP
/*
 * Need group_code and user_id
 * Adds user to group
 * Returns updated group data
 */
app.put(
    "/api/groups/:groupCode",
    authMiddleware,
    async (req, res) => {
        try {
            // Get userId from middleware
            const userId = new mongoose.Types.ObjectId(
                req.userId
            );

            console.log("Join group attempt:", {
                groupCode: req.params.groupCode,
                userId: userId
            });

            // Find group by code
            const foundGroup = await findGroupByCode(
                req.params.groupCode
            );
            console.log("Found group:", foundGroup);

            // Group doesn't exist
            if (!foundGroup || foundGroup.length === 0) {
                console.log(
                    "Group not found with code:",
                    req.params.groupCode
                );
                return res
                    .status(404)
                    .json({ error: "Group not found" });
            }

            const group = foundGroup[0];

            // Check if user is already in group (using toString() for comparison)
            if (
                group.users.some(
                    (id) => id.toString() === userId.toString()
                )
            ) {
                console.log("User already in group:", userId);
                return res.status(409).json({
                    error: "You're already a member of this group"
                });
            }

            // Join group
            const updatedGroup = await joinGroup(
                userId,
                group._id
            );

            if (!updatedGroup) {
                console.error("Failed to join group");
                return res.status(500).json({
                    error: "Failed to join group"
                });
            }

            console.log(
                "Successfully joined group:",
                updatedGroup
            );
            res.status(200).json({
                message: "Successfully joined group",
                group: updatedGroup
            });
        } catch (err) {
            // Enhanced error logging
            console.error("Error in join group:", {
                error: err,
                message: err.message,
                stack: err.stack
            });
            res.status(500).json({
                error:
                    err.message ||
                    "Server error while joining group"
            });
        }
    }
);

// VERIFY GROUP CODE
/*
 * Checks if group code is already in use
 * Returns true if code is available, false if taken
 */
app.get("/api/groups/verify/:code", async (req, res) => {
    try {
        console.log("Verifying group code:", req.params.code);
        const existingGroup = await findGroupByCode(
            req.params.code
        );

        console.log(
            "Verification result:",
            existingGroup.length === 0 ? "available" : "taken"
        );
        res.json({ isAvailable: existingGroup.length === 0 });
    } catch (err) {
        console.error("Error verifying group code:", err);
        res.status(500).json({
            error: "Error verifying group code"
        });
    }
});

// CREATE GROUP
/*
 * Need group_code, name, and user_id
 * Creates group and adds user to group
 */
app.post("/api/groups", authMiddleware, async (req, res) => {
    try {
        const { group_code, name } = req.body;
        // Get userId from middleware and convert to ObjectId
        const userId = new mongoose.Types.ObjectId(req.userId);

        console.log("Creating group:", {
            name,
            group_code,
            userId
        });

        if (!group_code || !name) {
            return res.status(400).json({
                error: "Group code and name are required"
            });
        }

        // Verify code is still available
        const existingGroup = await findGroupByCode(group_code);
        if (existingGroup.length > 0) {
            console.log(
                "Group code already in use:",
                group_code
            );
            return res.status(409).json({
                error: "Group code already in use"
            });
        }

        const group = {
            group_code,
            name
        };

        const newGroup = await createGroup(group);
        const newMember = await joinGroup(userId, newGroup._id);
        console.log("Group created successfully:", newGroup);
        console.log("Owner has joined group:", newMember);

        if (!newGroup) {
            return res
                .status(500)
                .json({ error: "Error creating group" });
        }

        res.status(201).json(newGroup);
    } catch (err) {
        console.error("Error in create group:", err);
        res.status(500).json({
            error: "Error creating group"
        });
    }
});

// GET USER GROUPS
/*
 * Need user_id
 * Returns all groups user is in
 */
app.get("/api/groups", authMiddleware, async (req, res) => {
    try {
        console.log("Fetching groups for userId:", req.userId);

        // Convert string ID to MongoDB ObjectId
        const userId = new mongoose.Types.ObjectId(req.userId);

        // Find user to get their groups
        const user = await findUserById(userId);
        if (!user || user.length === 0) {
            return res
                .status(404)
                .json({ error: "User not found" });
        }

        // Get full group details for each group ID
        const userGroups = await getAllGroups(userId); // ONLY HAS ONE ID

        /*
        const userGroups = await Promise.all(
            user[0].groups.map((groupId) =>
                findGroupById(groupId)
            )
        );
        */

        const groups = await Promise.all(
            userGroups.map((member) =>
                findGroupById(member.group_id)
            )
        );

        console.log("Retrieved groups:", groups);
        res.json(groups);
    } catch (err) {
        console.error("Error in /api/groups:", err);
        res.status(500).json({
            error: "Error fetching groups"
        });
    }
});

// GET USER'S MOST RECENT PUBLIC POST
/*
 * Need user_id
 * Returns most recent public entry for user
 */
app.get("/users/:userId/recent", async (req, res) => {
    try {
        console.log(
            "Fetching most recent post for userId: ",
            req.params.userId
        );

        const userId = new mongoose.Types.ObjectId(
            req.params.userId
        );
        const userEntries =
            await getUserEntriesByUserId(userId);

        if (!userEntries) {
            return res
                .status(404)
                .json({ error: "user not found" });
        }

        const listOfEntries = userEntries[0].entries;
        console.log(userEntries);
        const userInfo = await findUserById(userId);
        const name = userInfo[0].first_name;

        // Handle case with no entries
        if (listOfEntries.length == 0) {
            return res.json({
                userName: name,
                noEntries: true
            });
        }

        for (let i = listOfEntries.length - 1; i >= 0; i--) {
            const currentEntryId = listOfEntries[i];
            const currentEntry =
                await getEntryById(currentEntryId);

            if (currentEntry[0] && currentEntry[0].is_public) {
                currentEntry[0].userName = name;
                return res.json({
                    userName: name,
                    currentEntry: currentEntry[0]
                });
            }
        }

        // No public entries found
        return res.json({
            userName: name,
            noPublicEntries: true
        });
    } catch (err) {
        console.log("Error in /users/:userId/recent", err);
        res.status(500).json({
            error: "Error fetching most recent entry"
        });
    }
});

// GET SINGULAR ENTRY BY ID
app.get(
    "/api/entries/:entryId",
    authMiddleware,
    async (req, res) => {
        try {
            const entryId = req.params.entryId;
            const entries = await getEntryById(entryId);
            console.log(entries);
            res.json(entries[0]);
        } catch (err) {
            console.error("Error fetching entry:", err);
            res.status(500).json({
                error: "Error fetching entry"
            });
        }
    }
);

// GET GROUP ENTRIES
app.get(
    "/api/groups/:groupId/entries",
    authMiddleware,
    async (req, res) => {
        try {
            // Get group and verify it exists
            const groupId = new mongoose.Types.ObjectId(
                req.params.groupId
            );
            const group = await findGroupById(groupId);

            if (!group || group.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Group not found" });
            }

            const allUsers = await getAllUsers(groupId); // LIST OF MEMBER OBJECTS

            // Get recent entries for all users in one query
            const recentEntries = await Promise.all(
                allUsers.map(async (currentUser) => {
                    const userEntries =
                        await getUserEntriesByUserId(
                            currentUser.user_id
                        );

                    const userInfo = await findUserById(
                        currentUser.user_id
                    );

                    if (
                        !userEntries ||
                        !userEntries[0] ||
                        !userEntries[0].entries
                    ) {
                        return null;
                    }

                    const listOfEntries =
                        userEntries[0].entries;
                    const name = userInfo[0].first_name;

                    // Find most recent public entry
                    for (
                        let i = listOfEntries.length - 1;
                        i >= 0;
                        i--
                    ) {
                        const currentEntry = await getEntryById(
                            listOfEntries[i]
                        );
                        if (
                            currentEntry[0] &&
                            currentEntry[0].is_public
                        ) {
                            return {
                                userId: currentUser.user_id,
                                userName: name,
                                ...currentEntry[0]._doc
                            };
                        }
                    }
                    return null;
                })
            );

            // Filter out null entries and send
            res.json(
                recentEntries.filter((entry) => entry !== null)
            );
        } catch (error) {
            console.error(
                "Error fetching group entries:",
                error
            );
            res.status(500).json({
                error: "Failed to fetch group entries"
            });
        }
    }
);

// LOGOUT
app.post("/api/logout", authMiddleware, async (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0), // Expire immediately
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            message: "Logged out successfully"
        });
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        res.status(500).json({ message: "Error logging out" });
    }
});

// ADD REACTION TO ENTRY
app.put(
    "/entries/reaction",
    authMiddleware,
    async (req, res) => {
        try {
            console.log("Received reaction request:", {
                body: req.body,
                userId: req.userId
            });

            const { entry_id, group_id, reaction_string } =
                req.body;
            // Get user_id from middleware instead of request body
            const user_id = req.userId;

            console.log("Parsed data:", {
                entry_id,
                group_id,
                reaction_string,
                user_id
            });

            if (!entry_id || !group_id || !reaction_string) {
                console.log("Missing required fields:", {
                    hasEntryId: !!entry_id,
                    hasGroupId: !!group_id,
                    hasReactionString: !!reaction_string
                });
                return res.status(400).json({
                    error: "All fields are required",
                    missing: {
                        entry_id: !entry_id,
                        group_id: !group_id,
                        reaction_string: !reaction_string
                    }
                });
            }

            const reaction = {
                group_id: group_id,
                user_reacting_id: user_id,
                reaction: reaction_string
            };

            const updatedEntry = await addReactionToEntry(
                entry_id,
                reaction
            );
            if (!updatedEntry) {
                return res
                    .status(500)
                    .json({ error: "Error creating entry" });
            }

            res.status(201).json(updatedEntry);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: "Error creating journal entry"
            });
        }
    }
);

// GET ALL TAGS BY USER

app.get(
    "/api/entries/tags/:userId",
    authMiddleware,
    async (req, res) => {
        try {
            console.log("TESTING");
            const userId = new mongoose.Types.ObjectId(
                req.params.userId
            );
            console.log(
                "Fetching all tags for userId:",
                userId
            );
            const tags = await getAllTagsByUserId(userId);
            console.log("Retrieved entries:", tags);
            res.json(tags);
        } catch (err) {
            console.error("Error fetching tags:", err);
            res.status(500).json({
                error: "Error fetching tags"
            });
        }
    }
);

// VERIFY AUTH
app.get("/api/auth/verify", authMiddleware, (req, res) => {
    res.json({ userId: req.userId });
});

// Get current user
app.get("/api/user/current", authMiddleware, (req, res) => {
    res.json({ userId: req.userId });
});

// Get user details
app.get(
    "/api/user/details",
    authMiddleware,
    async (req, res) => {
        try {
            const user = await findUserById(req.userId);
            if (!user || user.length === 0) {
                return res
                    .status(404)
                    .json({ message: "User not found" });
            }

            res.status(200).json({
                name: user[0].first_name,
                email: user[0].username
            });
        } catch (error) {
            console.error(
                "Error fetching user details:",
                error
            );
            res.status(500).json({
                message: "Error fetching user details"
            });
        }
    }
);

// Leave group
app.delete(
    "/api/groups/:groupId/leave",
    authMiddleware,
    async (req, res) => {
        try {
            const groupId = new mongoose.Types.ObjectId(
                req.params.groupId
            );
            const userId = req.userId;

            const result = await removeMember(userId, groupId);

            if (!result) {
                return res.status(500).json({
                    message: "Error leaving group"
                });
            }

            res.status(200).json({
                message: "Successfully left group"
            });
        } catch (error) {
            console.error("Error leaving group:", error);
            res.status(500).json({
                message: "Error leaving group"
            });
        }
    }
);

// LISTEN
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
