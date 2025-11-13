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

        createInitialsAvatar(initials) {
            const safeInitials = (initials || "NA").substring(0, 2);
            const svg = [
                '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">',
                '<defs>',
                '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" stop-color="#4f46e5" />',
                '<stop offset="100%" stop-color="#7c3aed" />',
                "</linearGradient>",
                "</defs>",
                '<rect width="96" height="96" rx="48" fill="url(#grad)" />',
                `<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#ffffff">${safeInitials}</text>`,
                "</svg>",
            ].join("");

            return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        },
    };

    global.PhonebookUtils = utils;
})(window);

