/* global window, jQuery */

(function (global, $) {
    "use strict";

    if (!$) {
        throw new Error("jQuery is required for PhonebookValidation.");
    }

    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showValidationError($input, message) {
        $input.addClass("ui-state-error");
        $("<div>")
            .addClass("validation-message")
            .text(message)
            .insertAfter($input);
    }

    function prepareField($input) {
        $input.removeClass("ui-state-error");
        $input.next(".validation-message").remove();

        const originalValue = $input.val();
        const trimmedValue = typeof originalValue === "string" ? originalValue.trim() : originalValue;

        if (typeof originalValue === "string" && originalValue !== trimmedValue) {
            $input.val(trimmedValue);
        }

        return trimmedValue;
    }

    const validation = {
        reset($form) {
            if (!$form || !$form.length) {
                return;
            }

            $form[0].reset();
            $form.find(".ui-state-error").removeClass("ui-state-error");
            $form.find(".validation-message").remove();
        },

        validate($form) {
            let isValid = true;

            $form.find("input[required]").each(function () {
                const $input = $(this);
                const value = prepareField($input);
                const pattern = $input.attr("pattern");

                if (!value) {
                    showValidationError($input, "This field is required.");
                    isValid = false;
                    return;
                }

                if (pattern) {
                    try {
                        const regex = new RegExp(pattern);
                        if (!regex.test(value)) {
                            showValidationError($input, "Please provide a valid value.");
                            isValid = false;
                        }
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.warn("Invalid pattern attribute:", pattern, error);
                    }
                }

                if ($input.attr("type") === "email" && !EMAIL_PATTERN.test(value)) {
                    showValidationError($input, "Email address is invalid.");
                    isValid = false;
                }
            });

            return isValid;
        },
    };

    global.PhonebookValidation = validation;
})(window, jQuery);

