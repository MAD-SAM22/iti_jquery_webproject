/* global window, PhonebookUtils */

(function (global, utils) {
    "use strict";

    if (!utils) {
        throw new Error("PhonebookUtils is required for PhonebookStore.");
    }

    const contacts = [];

    function normalizeGender(value) {
        return value === "Female" ? "Female" : "Male";
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
                id: utils.generateId(),
                name: utils.trim(data.name) || "",
                phone: utils.trim(data.phone) || "",
                email: utils.trim(data.email) || "",
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
                contact.name = utils.trim(updates.name) || "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "phone")) {
                contact.phone = utils.trim(updates.phone) || "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "email")) {
                contact.email = utils.trim(updates.email) || "";
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
})(window, window.PhonebookUtils);

