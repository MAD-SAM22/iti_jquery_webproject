/* global PhonebookUI */

(function ($, PhonebookUI) {
    "use strict";

    $(document).on("mobileinit", function () {
        $.mobile.defaultPageTransition = "slide";
        $.mobile.pageLoadErrorMessage = "Page load failed. Check your connection.";
    });

    $(document).ready(function () {
        if (PhonebookUI && typeof PhonebookUI.init === "function") {
            PhonebookUI.init();
        } else {
            throw new Error("PhonebookUI is not available. Ensure scripts load in the correct order.");
        }
    });
})(jQuery, window.PhonebookUI);

