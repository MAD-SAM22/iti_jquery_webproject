/* global window */

(function (global) {
    "use strict";

    const utils = {
        generateId() {
            if (global.crypto && typeof global.crypto.randomUUID === "function") {
                return global.crypto.randomUUID();
            }

            const timestamp = Date.now().toString(36);
            const randomSegment = Math.random().toString(36).slice(2, 10);
            return `id-${timestamp}-${randomSegment}`;
        },

        getInitials(name) {
            return name
                .split(" ")
                .filter(Boolean)
                .map((part) => part[0].toUpperCase())
                .slice(0, 2)
                .join("") || "NA";
        },

        sanitizeTel(phone) {
            return phone.replace(/[^0-9+]/g, "");
        },

        trim(value) {
            return typeof value === "string" ? value.trim() : value;
        },
    };

    global.PhonebookUtils = utils;
})(window);

