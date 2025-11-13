/* global window */

(function (global) {
    "use strict";

    const contacts = [];
    let nextId = 1;

    function normalizeGender(value) {
        return value === "Female" ? "Female" : "Male";
    }

    function generateId() {
        const id = `contact-${Date.now()}-${nextId}`;
        nextId += 1;
        return id;
    }

    function trimValue(value) {
        return typeof value === "string" ? value.trim() : value;
    }

    const store = {
        getAll() {
            return contacts.slice();
        },

        isEmpty() {
            return contacts.length === 0;
        },

        findById(id) {
            return contacts.find((contact) => contact.id === id) || null;
        },

        add(data) {
            const contact = {
                id: generateId(),
                name: trimValue(data.name) || "",
                phone: trimValue(data.phone) || "",
                email: trimValue(data.email) || "",
                gender: normalizeGender(data.gender),
            };

            contacts.push(contact);
            return contact;
        },

        update(id, updates) {
            const contact = store.findById(id);

            if (!contact) {
                return null;
            }

            if (Object.prototype.hasOwnProperty.call(updates, "name")) {
                contact.name = trimValue(updates.name) || "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "phone")) {
                contact.phone = trimValue(updates.phone) || "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "email")) {
                contact.email = trimValue(updates.email) || "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "gender")) {
                contact.gender = normalizeGender(updates.gender);
            }

            return contact;
        },

        remove(id) {
            const index = contacts.findIndex((contact) => contact.id === id);

            if (index === -1) {
                return false;
            }

            contacts.splice(index, 1);
            return true;
        },

        clear() {
            contacts.length = 0;
        },
    };

    global.PhonebookStore = store;
})(window);

