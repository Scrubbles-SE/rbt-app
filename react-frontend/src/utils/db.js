/*
 * IndexedDB Interface for RBT App
 * Provides offline-first data access and synchronization capabilities
 */
import { openDB } from "idb";

// Database configuration
const DB_NAME = "rbtApp";
const DB_VERSION = 6;

/**
 * Initializes and sets up the IndexedDB database schema
 * Must include all object stores and indexes required by the application
 */
export const initDB = async () => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Users store
            if (!db.objectStoreNames.contains("users")) {
                const userStore = db.createObjectStore(
                    "users",
                    { keyPath: "_id" }
                );
                userStore.createIndex("username", "username", {
                    unique: true
                });
            }

            // Entries store - stores Rose/Bud/Thorn entries
            if (!db.objectStoreNames.contains("entries")) {
                const entryStore = db.createObjectStore(
                    "entries",
                    { keyPath: "_id" }
                );
                entryStore.createIndex("user_id", "user_id");
                entryStore.createIndex("date", "date");
                entryStore.createIndex("tags", "tags", {
                    multiEntry: true
                });
            }

            // Groups store - stores group information
            if (!db.objectStoreNames.contains("groups")) {
                const groupStore = db.createObjectStore(
                    "groups",
                    { keyPath: "_id" }
                );
                groupStore.createIndex(
                    "group_code",
                    "group_code",
                    { unique: true }
                );
                groupStore.createIndex("name", "name");
            }

            // Tags store - stores tag information
            if (!db.objectStoreNames.contains("tags")) {
                const tagStore = db.createObjectStore("tags", {
                    keyPath: "_id"
                });
                tagStore.createIndex("user_id", "user_id");
                tagStore.createIndex("tag_name", "tag_name");
            }

            // Members store - maps users to groups
            if (!db.objectStoreNames.contains("members")) {
                const memberStore = db.createObjectStore(
                    "members",
                    {
                        keyPath: "_id"
                    }
                );
                memberStore.createIndex("user_id", "user_id");
                memberStore.createIndex("group_id", "group_id");
            }
        }
    });
    return db;
};

/**
 * Clears all application data from IndexedDB
 * Used during logout to protect user privacy
 */
export const clearDB = async () => {
    const db = await initDB();
    const tx = db.transaction(
        ["users", "entries", "groups", "tags", "members"],
        "readwrite"
    );

    // Clear all data from the database
    await Promise.all([
        tx.objectStore("users").clear(),
        tx.objectStore("entries").clear(),
        tx.objectStore("groups").clear(),
        tx.objectStore("tags").clear(),
        tx.objectStore("members").clear()
    ]);

    await tx.done;
};

/* Database Access Objects */

// User operations
export const userDB = {
    async get(userId) {
        const db = await initDB();
        return db.get("users", userId);
    },

    async update(user) {
        const db = await initDB();
        // If user has a name, store it in localStorage for quick access
        if (user && user.name) {
            localStorage.setItem("userName", user.name);
        }
        return db.put("users", user);
    },

    // Get user name from localStorage or fallback to IndexedDB
    getUserName() {
        // Try to get from localStorage first (synchronous, fast)
        const cachedName = localStorage.getItem("userName");
        if (cachedName) {
            return cachedName;
        }
        // If not in localStorage, return a placeholder
        // The actual component will update it from IndexedDB asynchronously
        return "User";
    },

    async getAll() {
        const db = await initDB();
        const tx = db.transaction("users", "readonly");
        return tx.objectStore("users").getAll();
    }
};

// Entries operations
export const entriesDB = {
    async getAll(userId) {
        const db = await initDB();
        const tx = db.transaction("entries", "readonly");
        const index = tx.store.index("user_id");
        return index.getAll(userId);
    },

    async getAllOverall() {
        const db = await initDB();
        const tx = db.transaction("entries", "readonly");
        const index = tx.store.index("user_id");
        return index.getAll();
    },

    async getMostRecent(userId) {
        const entries = await this.getAll(userId);
        return (
            entries.sort((a, b) => b.date - a.date)[0] || null
        );
    },

    async add(entry) {
        const db = await initDB();
        return db.add("entries", entry);
    },

    async update(entry) {
        const db = await initDB();
        return db.put("entries", entry);
    },

    async getByDate(userId, date = new Date()) {
        const entries = await this.getAll(userId);
        return entries.find(
            (entry) =>
                new Date(entry.date).toDateString() ===
                date.toDateString()
        );
    },

    async getTodaysEntry(userId) {
        return this.getByDate(userId, new Date());
    },

    async getById(entryId) {
        const db = await initDB();
        return db.get("entries", entryId);
    },

    async getMostRecentByUserId(userId) {
        const entries = await this.getAllOverall(userId);

        const filteredEntries = entries.filter(
            (entry) => entry.user_id === userId
        );

        let maxDateEntry =
            filteredEntries.length > 0
                ? filteredEntries[0]
                : null;

        for (let i = 0; i < filteredEntries.length; i++) {
            if (filteredEntries[i].date > maxDateEntry)
                maxDateEntry = filteredEntries[i];
        }

        return maxDateEntry;
    },

    // Adds an entry only if it doesn't already exist (used during sync)
    async addIfNotPresent(entry) {
        const entries = await this.getAllOverall();
        if (!entries.some((e) => e._id === entry._id)) {
            return this.add(entry);
        }

        return;
    }
};

// Groups operations
export const groupsDB = {
    async getById(groupId) {
        const db = await initDB();
        const tx = db.transaction("groups", "readonly");
        const store = tx.store;
        const groups = await store.getAll();
        return groups.filter((group) => group._id === groupId);
    },

    async add(group) {
        const db = await initDB();
        return db.add("groups", group);
    },

    async update(group) {
        const db = await initDB();
        return db.put("groups", group);
    },

    async delete(groupId) {
        const db = await initDB();
        return db.delete("groups", groupId);
    }
};

// Membership relations between users and groups
export const membersDB = {
    async getGroupIds(userId) {
        const db = await initDB();
        const tx = db.transaction("members", "readonly");
        const store = tx.store;
        const members = await store.getAll();
        return members.filter(
            (memberObject) => memberObject.user_id === userId
        );
    },

    async getUserIds(groupId) {
        const db = await initDB();
        const tx = db.transaction("members", "readonly");
        const store = tx.store;
        const members = await store.getAll();
        return members.filter(
            (memberObject) => memberObject.group_id === groupId
        );
    },

    async add(memberObject) {
        const db = await initDB();
        return db.add("members", memberObject);
    },

    async delete(memberId) {
        const db = await initDB();
        return db.delete("members", memberId);
    }
};

// Tags operations
export const tagsDB = {
    async getAll(userId) {
        const db = await initDB();
        const tx = db.transaction("tags", "readonly");
        const index = tx.store.index("user_id");
        return index.getAll(userId);
    },

    async add(tag) {
        const db = await initDB();
        return db.add("tags", tag);
    },

    async update(tags) {
        const db = await initDB();
        return db.put("tags", tags);
    }
};
