import mongoose from "mongoose";
import {
    userSchema,
    entrySchema,
    userEntriesSchema
} from "./user.js";
import { GroupSchema } from "./user.js";
import * as UserServices from "./user-services.js";
import * as GroupServices from "./group-services.js";
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
