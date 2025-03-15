import mongoose from "mongoose";
import {
    userSchema,
    entrySchema,
    userEntriesSchema,
    GroupSchema
} from "../models/user.js";
import * as UserServices from "../models/user-services.js";
import * as GroupServices from "../models/group-services.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

/*
 * Test Database Connection Setup
 */
let testUserId;

beforeAll(async () => {
    await mongoose
        .connect(process.env.MONGODB_URI)
        .then(() =>
            console.log("MongoDB connected for testing")
        )
        .catch((err) =>
            console.error("MongoDB connection error:", err)
        );

    // Create test user that will be used across all tests
    const newUser = {
        username: "testUser",
        password: "testPass",
        first_name: "Test"
    };
    const result = await UserServices.addUser(newUser);
    testUserId = result._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

/*
 * USER SCHEMA TESTS
 */
describe("User Schema Validation", () => {
    const User = mongoose.model("User", userSchema);

    test("Valid user creation", () => {
        const validUser = new User({
            username: "testUser",
            password: "password123",
            first_name: "Test",
            entries: new mongoose.Types.ObjectId(),
            groups: [new mongoose.Types.ObjectId()]
        });
        const validationError = validUser.validateSync();
        expect(validationError).toBeUndefined();
    });

    test("User with empty groups array", () => {
        const userNoGroups = new User({
            username: "testUser",
            password: "password123",
            first_name: "Test",
            entries: new mongoose.Types.ObjectId(),
            groups: []
        });
        const validationError = userNoGroups.validateSync();
        expect(validationError).toBeUndefined();
    });
});

describe("Entry Schema Validation", () => {
    const Entry = mongoose.model("Entry", entrySchema);

    test("Valid entry creation", () => {
        const validEntry = new Entry({
            user_id: new mongoose.Types.ObjectId(),
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        });
        const validationError = validEntry.validateSync();
        expect(validationError).toBeUndefined();
    });
});

describe("UserEntries Schema Validation", () => {
    const UserEntries = mongoose.model(
        "UserEntries",
        userEntriesSchema
    );

    test("Valid user entries creation", () => {
        const validUserEntries = new UserEntries({
            user_id: new mongoose.Types.ObjectId(),
            entries: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ]
        });
        const validationError = validUserEntries.validateSync();
        expect(validationError).toBeUndefined();
    });
});

/*
 * GROUP SCHEMA TESTS
 */
describe("Group Schema Validation", () => {
    const Group = mongoose.model("Group", GroupSchema);

    test("Valid group creation", () => {
        const validGroup = new Group({
            group_code: "TEST123",
            name: "Test Group",
            users: [new mongoose.Types.ObjectId()]
        });
        const validationError = validGroup.validateSync();
        expect(validationError).toBeUndefined();
    });

    test("Group with empty users array", () => {
        const emptyGroup = new Group({
            group_code: "TEST123",
            name: "Test Group",
            users: []
        });
        const validationError = emptyGroup.validateSync();
        expect(validationError).toBeUndefined();
    });
});

/*
 * USER SERVICES TESTS
 */
describe("User Services", () => {
    test("Find user by username", async () => {
        const username = "testUser";
        const user =
            await UserServices.findUserByUsername(username);
        expect(user).toBeTruthy();
        expect(user[0].username).toBe(username);
    });

    test("Find user by id", async () => {
        const foundUser =
            await UserServices.findUserById(testUserId);
        expect(foundUser).toBeTruthy();
        expect(foundUser[0]._id.toString()).toEqual(
            testUserId.toString()
        );
    });

    test("Add and get entry", async () => {
        const entry = {
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        };

        const addedEntry = await UserServices.addEntry(entry);
        expect(addedEntry).toBeTruthy();

        const userEntries =
            await UserServices.getUserEntriesByUserId(
                testUserId
            );
        expect(userEntries).toBeTruthy();
        expect(userEntries).toBeInstanceOf(Array);
    });

    test("Add entry error handling", async () => {
        const invalidEntry = {
            user_id: "invalid_id" // This should cause an error
        };
        const result =
            await UserServices.addEntry(invalidEntry);
        expect(result).toBe(false);
    });

    test("Get all entries", async () => {
        const entries =
            await UserServices.getAllEntries(testUserId);
        expect(entries).toBeTruthy();
        expect(Array.isArray(entries)).toBe(true);
    });

    test("Get entry by id", async () => {
        // First create an entry to get its ID
        const entry = {
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        };
        const addedEntry = await UserServices.addEntry(entry);

        const foundEntry = await UserServices.getEntryById(
            addedEntry._id
        );
        expect(foundEntry).toBeTruthy();
        expect(Array.isArray(foundEntry)).toBe(true);
    });

    // addGroupToUser no longer a function
    // test("Add group to user error handling", async () => {
    //     const result = await UserServices.addGroupToUser(
    //         "invalid_id", // This should cause an error
    //         new mongoose.Types.ObjectId()
    //     );
    //     expect(result).toBe(false);
    // });

    test("Add and verify reaction to entry", async () => {
        const entry = {
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        };

        const addedEntry = await UserServices.addEntry(entry);
        expect(addedEntry).toBeTruthy();

        const reaction = {
            group_id: new mongoose.Types.ObjectId(),
            user_reacting_id: testUserId,
            reaction: "like"
        };

        const result = await UserServices.addReactionToEntry(
            addedEntry._id,
            reaction
        );
        expect(result).toBeTruthy();

        const updatedEntry = await UserServices.getEntryById(
            addedEntry._id
        );
        expect(updatedEntry[0].reactions).toBeDefined();

        // Check that at least one reaction matches our expected properties
        const matchingReaction = updatedEntry[0].reactions.find(
            (r) =>
                r.user_reacting_id.toString() ===
                    reaction.user_reacting_id.toString() &&
                r.reaction === reaction.reaction
        );
        expect(matchingReaction).toBeTruthy();
    });

    test("Add reaction error handling - invalid entry id", async () => {
        const reaction = {
            group_id: new mongoose.Types.ObjectId(),
            user_reacting_id: testUserId,
            reaction: "like"
        };

        const result = await UserServices.addReactionToEntry(
            "invalid_id",
            reaction
        );
        expect(result).toBe(false);
    });

    test("Add new tag", async () => {
        const entryId = new mongoose.Types.ObjectId(); // Simulate an entry ID

        const tag = {
            tag_name: "tag",
            user_id: testUserId,
            entries: [entryId]
        };

        const tagId = await UserServices.addTagObject(tag);
        expect(tagId).toBeTruthy(); // Should return a valid ID
    });

    test("Add tag error handling - invalid tag", async () => {
        const tag = {
            tag_name: "tag",
            user_id: "invald_id",
            entries: [new mongoose.Types.ObjectId()]
        };

        const tagId = await UserServices.addTagObject(tag);
        expect(tagId).toBe(false);
    });

    test("Add tag to entry", async () => {
        const entry = {
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn",
            tags: []
        };

        const createdEntry = await UserServices.addEntry(entry);
        expect(createdEntry).toBeTruthy();

        const tag = {
            tag_name: "tag",
            user_id: testUserId,
            entries: []
        };

        const tagId = await UserServices.addTagObject(tag);
        expect(tagId).toBeTruthy();

        const result = await UserServices.addTagToEntry(
            tagId,
            createdEntry._id
        );
        expect(result).toBeTruthy();
    });

    test("Add tag to entry error handling - invalid user id", async () => {
        const tag = {
            tag_name: "tag",
            user_id: testUserId,
            entries: []
        };

        const tagId = await UserServices.addTagObject(tag);
        expect(tagId).toBeTruthy();

        const result = await UserServices.addTagToEntry(
            tagId,
            "invalid_id"
        );
        expect(result).toBe(false);
    });

    test("Update tag", async () => {
        const entry = {
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn",
            tags: []
        };

        const createdEntry = await UserServices.addEntry(entry);
        expect(createdEntry).toBeTruthy();

        const tag = {
            tag_name: "tag",
            user_id: testUserId,
            entries: []
        };

        const tagId = await UserServices.addTagObject(tag);
        expect(tagId).toBeTruthy();

        const tagObjectToUpdate = {
            tag_name: "tag",
            user_id: testUserId,
            entries: [createdEntry._id]
        };

        const result = await UserServices.updateTagObject(
            tagObjectToUpdate
        );
        expect(result).toBeTruthy();
    });

    test("Get tags by user", async () => {
        const tag_1 = {
            tag_name: "tag_1",
            user_id: testUserId,
            entries: [new mongoose.Types.ObjectId()]
        };

        const tag_2 = {
            tag_name: "tag_2",
            user_id: testUserId,
            entries: [new mongoose.Types.ObjectId()]
        };

        await UserServices.addTagObject(tag_1);
        await UserServices.addTagObject(tag_2);

        const tags =
            await UserServices.getAllTagsByUserId(testUserId);

        expect(tags).toBeTruthy();
        expect(Array.isArray(tags)).toBe(true);
        expect(
            tags.some((tag) => tag.tag_name === "tag_1")
        ).toBe(true);
        expect(
            tags.some((tag) => tag.tag_name === "tag_2")
        ).toBe(true);
    });

    test("Update user info", async () => {
        const user = {
            username: "email@email.com",
            password: "!Q2w3e4r",
            first_name: "Name"
        };

        const addedUser = await UserServices.addUser(user);
        expect(addedUser).toBeTruthy();

        const newInfo = {
            email: "new_email@example.com",
            name: "NewName"
        };
        const updatedUser = await UserServices.updateUser(
            addedUser._id,
            newInfo
        );

        expect(updatedUser).toBeTruthy();
        expect(updatedUser.username).toBe(newInfo.email);
        expect(updatedUser.first_name).toBe(newInfo.name);
    });

    test("Remove group from user", async () => {
        const user = {
            username: "email@email.com",
            password: "!Q2w3e4r",
            first_name: "Name"
        };

        const createdUser = await UserServices.addUser(user);
        expect(createdUser).toBeTruthy();

        const group =
            await GroupServices.findGroupByCode("TEST123");

        const result = await GroupServices.joinGroup(
            createdUser._id,
            group[0]._id
        );
        expect(result).toBeTruthy();

        const res = await UserServices.removeGroupFromUser(
            createdUser._id,
            group[0]._id
        );
        expect(res).toBeTruthy();
        expect(user.groups).toBe(undefined);
    });
});

describe("User Services Error Handling", () => {
    test("addUser error handling - invalid schema", async () => {
        const invalidUser = {
            username: "testUser",
            password: "testPass",
            first_name: "Test",
            entries: "invalid_id" // Invalid ObjectId
            // groups: ["invalid_id"] // Invalid ObjectId array
        };
        const result = await UserServices.addUser(invalidUser);
        expect(result).toBe(false);
    });

    test("addEntry error handling - invalid schema", async () => {
        const invalidEntry = {
            user_id: "invalid_id", // Invalid ObjectId
            date: "not a date", // Invalid date
            is_public: "not a boolean", // Invalid boolean
            rose_text: "",
            bud_text: "",
            thorn_text: ""
        };
        const result =
            await UserServices.addEntry(invalidEntry);
        expect(result).toBe(false);
    });

    test("addUserEntries error handling - invalid id", async () => {
        const result = await UserServices.addEntry({
            user_id: "invalid_id",
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        });
        expect(result).toBe(false);
    });
});

/*
 * GROUP SERVICES TESTS
 */
describe("Group Services", () => {
    let testGroupId;

    test("Create group", async () => {
        const newGroup = {
            group_code: "TEST123",
            name: "Test Group",
            users: [testUserId]
        };

        const result =
            await GroupServices.createGroup(newGroup);
        testGroupId = result._id;
        expect(result).toBeTruthy();
        expect(result.group_code).toBe(newGroup.group_code);
    });

    // test("Create group error handling", async () => {
    //     const invalidGroup = {
    //         users: ["invalid_id"] // This should cause an error
    //     };
    //     const result =
    //         await GroupServices.createGroup(invalidGroup);
    //     expect(result).toBe(false);
    // });

    test("Create group error handling", async () => {
        // this should cause an error due to type
        const invalidGroup = {
            group_code: 123,
            name: 123
        };
        const result =
            await GroupServices.createGroup(invalidGroup);
        expect(result).toBe(false);
    });

    test("Find group by id", async () => {
        const group =
            await GroupServices.findGroupById(testGroupId);
        expect(group).toBeTruthy();
        expect(Array.isArray(group)).toBe(true);
        expect(group[0]._id.toString()).toBe(
            testGroupId.toString()
        );
    });

    test("Find group by code", async () => {
        const groups =
            await GroupServices.findGroupByCode("TEST123");
        expect(groups).toBeTruthy();
        expect(groups.length).toBeGreaterThan(0);
        expect(groups[0].group_code).toBe("TEST123");
    });

    test("Join group", async () => {
        const groups =
            await GroupServices.findGroupByCode("TEST123");
        const result = await GroupServices.joinGroup(
            testUserId,
            groups[0]._id
        );
        expect(result).toBeDefined();
    });

    // getAllGroups

    test("Get all members of a group", async() => {
        const memberObjects =
            await GroupServices.getAllUsers("67d4ba5d5860f7296b55c1a2");

        const expectedResult = [{"_id": "67d4bab95860f7296b55c1a3", "user_id": "67d304ee72b3353e97bd983a", "group_id": "67d4ba5d5860f7296b55c1a2"}];

        expect(memberObjects["user_id"]).toBe(expectedResult["user_id"]);
        expect(memberObjects["group_id"]).toBe(expectedResult["group_id"]);

    });

    test("Get all groups of a user", async() => {
        const memberObjects = await GroupServices.getAllGroups("67d304ee72b3353e97bd983a");

        const expectedResult = [{"_id": "67d4bab95860f7296b55c1a3", "user_id": "67d304ee72b3353e97bd983a", "group_id": "67d4ba5d5860f7296b55c1a2"}];
        expect(memberObjects["user_id"]).toBe(expectedResult["user_id"]);
        expect(memberObjects["group_id"]).toBe(expectedResult["group_id"]);

    });


    test("Remove user from group", async() => {
        const groups =
            await GroupServices.findGroupByCode("TEST123");
        
        
        const result = await GroupServices.removeMember(testUserId, groups[0]._id);

        const groupMembers = await GroupServices.getAllUsers(groups[0]._id);

        const expectedResult = {"user_id: ": testUserId, "group_id": groups[0]._id};

        expect(result["user_id"]).toEqual(testUserId);
        expect(result["group_id"]).toEqual(groups[0]._id);

        expect(groupMembers).not.toHaveProperty('user_id', testUserId);

    });

    test("Check if user is admin (is admin)", async() => {

        const checkAdmin = await GroupServices.checkIfUserIsAdmin("67d304ee72b3353e97bd983a", "67d4ba5d5860f7296b55c1a2")
        expect(checkAdmin).toEqual(true);

    });

    test("Check if user is admin (is not admin)", async() => {

        const checkAdmin = await GroupServices.checkIfUserIsAdmin("67d4b77a826559af64e2bdea", "67d22dac66bca1749d04e04e")
        expect(checkAdmin).toEqual(false);

    });



    test("Join group error handling - invalid user", async () => {
        const result = await GroupServices.joinGroup(
            "invalid_id",
            testGroupId
        );
        expect(result).toBe(false);
    });

    test("Join group error handling - invalid group", async () => {
        const result = await GroupServices.joinGroup(
            testUserId,
            "invalid_id"
        );
        expect(result).toBe(false);
    });

    test("Join non-existent group", async () => {
        const nonExistentGroupId =
            new mongoose.Types.ObjectId();
        const result = await GroupServices.joinGroup(
            testUserId,
            nonExistentGroupId,
            false
        );
        // expect(result.groups).not.toContain(
        //     nonExistentGroupId.toString()
        // );
        expect(result).toBe(false);
    });
});
