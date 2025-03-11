// example partial testing suite using Mockingoose
import mongoose, { model } from "mongoose";
import mockingoose from "mockingoose";
import * as UserServices from "../models/user-services.js";

// schemas
import { userSchema, entrySchema } from "../models/user.js";

let userModel;
let entryModel;

// initialize user and entry schemas
beforeAll(async () => {
    userModel = mongoose.model("User", userSchema);
    entryModel = mongoose.model("Entry", entrySchema);
});

beforeEach(async () => {
    mockingoose.resetAll();
});

// make sure no leftover mocks affect other testss
// afterEach(() => {
//     mockingoose.restoreAllMocks();
// });

afterAll(async () => {
    await mongoose.connection.close();
});

//
// USER SERVICE TESTS
//
describe("User Service Tests", () => {
    // tests adding a user
    test("Adding user -- successful path", async () => {
        const mockEntryId = new mongoose.Types.ObjectId();

        // example user to add
        const addedUser = {
            username: "jackie_chan",
            password: "password",
            first_name: "Jackie",
            entries: mockEntryId,
            groups: [new mongoose.Types.ObjectId()]
        };

        // for comparison
        const toBeAdded = {
            username: "Jackie Chan",
            first_name: "Jackie"
        };

        // mock addUserEntries to return the mockEntryId
        // mockingoose(userModel).toReturn(mockEntryId, 'addUserEntries');

        // mock save method
        mockingoose(userModel).toReturn(addedUser, "save");

        const result = await UserServices.addUser(toBeAdded);

        // check assertions
        expect(result).toBeTruthy();
        expect(result.username).toBe(toBeAdded.username);
        expect(result.first_name).toBe(toBeAdded.first_name);
        expect(result).toHaveProperty("_id");




    });

    // tests adding user with empty groups array
    test("User with empty groups array", async () => {
        const mockEntryId = new mongoose.Types.ObjectId();
        const addedUser = {
            username: "solana_rowe",
            password: "password1",
            first_name: "Solana",
            entries: mockEntryId,
            groups: []
        };

        const toBeAdded = {
            username: "solana_rowe",
            first_name: "Solana"
        };

        // mockingoose(userModel).toReturn(mockEntryId, 'addUserEntries');

        // mock save method
        mockingoose(userModel).toReturn(addedUser, "save");

        const result = await UserServices.addUser(toBeAdded);

        expect(result.username).toBe(toBeAdded.username);
        expect(result.first_name).toBe(toBeAdded.first_name);
        expect(result).toHaveProperty("_id"); // ensure there's an _id
    });

    test("Fetching by valid id and not finding", async () => {
        // example id
        const anyId = "6132b9d47cefd0cc1916b6a9";

        // find returns an empty array in this case
        mockingoose(userModel).toReturn([], "find");

        const user = await UserServices.findUserById(anyId);

        // should be empty
        expect(user).toEqual([]);
    });
});

describe("Entry Service Tests", () => {
    test("Add new entry", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        const mockEntryId = new mongoose.Types.ObjectId();

        const entry = {
            _id: mockEntryId,
            user_id: testUserId,
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        };

        // mock save method
        mockingoose(userModel).toReturn(entry, "save");

        const result = await UserServices.addEntry(entry);

        expect(result).toBeTruthy();
        expect(result.user_id).toBe(entry.user_id);
        expect(result.rose_text).toBe(entry.rose_text);
        expect(result).toHaveProperty("_id"); // ensure there's an _id
    });

    // adding an entry with invalid user ID
    test("Add entry - Invalid user ID", async () => {
        const invalidEntry = {
            user_id: "invalid_id", // Invalid format
            date: Date.now(),
            is_public: true,
            rose_text: "Test rose",
            bud_text: "Test bud",
            thorn_text: "Test thorn"
        };

        mockingoose(entryModel).toReturn(null, "save");

        const result =
            await UserServices.addEntry(invalidEntry);

        expect(result).toBeFalsy();
    });
});

//
// API ENDPOINTS TESTS (supertests - testing real http endpoints)
//
// added below
// describe("API Endpoint Tests (Supertest)", () => {
// fetching user by ID
// test("GET /users/:id - Fetch user by ID", async () => {
//     const userId = new mongoose.Types.ObjectId();
//     const mockUser = {
//         _id: userId,
//         username: "john_doe",
//         first_name: "John",
//         last_name: "Doe"
//     };
//     mockingoose(userModel).toReturn(mockUser, "findOne");
//     const res = await request(app)
//         .get(`/users/${userId}`)
//         .expect(200);
//     expect(res.body).toBeTruthy();
//     expect(res.body.username).toBe(mockUser.username);
// });

// fetching a non-existing user
// test("GET /users/:id - Fetch non-existing user", async () => {
//     const userId = new mongoose.Types.ObjectId();
//     mockingoose(userModel).toReturn(null, "findOne");
//     const res = await request(app)
//         .get(`/users/${userId}`)
//         .expect(404);
//     expect(res.body.message).toBe("User not found");
// });

// creating a new user
// test("POST /users - Create new user", async () => {
//     const newUser = {
//         username: "new_user",
//         first_name: "New",
//         last_name: "User",
//         password: "password123"
//     };
//     jest.spyOn(UserServices, "addUser").mockResolvedValue({
//         ...newUser,
//         _id: new mongoose.Types.ObjectId()
//     });
//     const res = await request(app)
//         .post("/users")
//         .send(newUser)
//         .expect(201);
//     expect(res.body).toBeTruthy();
//     expect(res.body.username).toBe(newUser.username);
// });

// trys to create a user with missing fields
// test("POST /users - Missing required fields", async () => {
//     const newUser = { first_name: "New" }; // no username
//     jest.spyOn(UserServices, "addUser").mockResolvedValue(
//         null
//     );
//     const res = await request(app)
//         .post("/users")
//         .send(newUser)
//         .expect(400);
//     expect(res.body.message).toBe(
//         "Missing required fields"
//     );
// });
// });
