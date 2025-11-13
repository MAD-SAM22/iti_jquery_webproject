/* global window, jQuery */

(function (global, $) {
    "use strict";

    if (!$) {
        throw new Error("jQuery is required for PhonebookValidation.");
    }

    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const CLASS_NAMES = {
        error: "ui-state-error",
        message: "validation-message",
    };
    const SELECTORS = {
        message: ".validation-message",
    };
    const DEFAULT_MESSAGES = {
        required: "This field is required.",
        pattern: "Please provide a valid value.",
        email: "Email address is invalid.",
    };

    const FIELD_RULES = {
        phone: {
            sanitize(value) {
                return typeof value === "string" ? value.replace(/\D/g, "") : value;
            },
            validate(value) {
                return /^\d{11}$/.test(value);
            },
            messages: {
                pattern: "Phone number must be exactly 11 digits.",
                custom: "Phone number must be exactly 11 digits.",
            },
        },
    };

    function clearFieldState($input) {
        $input.removeClass(CLASS_NAMES.error);
        $input.next(SELECTORS.message).remove();
    }

    function renderError($input, message) {
        $input.addClass(CLASS_NAMES.error);
        $("<div>").addClass(CLASS_NAMES.message).text(message).insertAfter($input);
    }

    function trimValue(value) {
        return typeof value === "string" ? value.trim() : value;
    }

    function getFieldName($input) {
        return $input.attr("name") || $input.attr("id") || "";
    }

    function sanitizeValue(fieldName, value) {
        const rule = FIELD_RULES[fieldName];
        if (rule && typeof rule.sanitize === "function") {
            return rule.sanitize(value);
        }
        return value;
    }

    function prepareValue($input) {
        clearFieldState($input);

        const fieldName = getFieldName($input);
        const originalValue = $input.val();
        let value = trimValue(originalValue);
        value = sanitizeValue(fieldName, value);

        if (typeof originalValue === "string" && originalValue !== value) {
            $input.val(value);
        }

        return { value, fieldName };
    }

    function validatePattern($input, value, fieldName) {
        const pattern = $input.attr("pattern");
        if (!pattern) {
            return true;
        }

        try {
            const regex = new RegExp(pattern);

            if (regex.test(value)) {
                return true;
            }

            const message =
                (FIELD_RULES[fieldName] && FIELD_RULES[fieldName].messages && FIELD_RULES[fieldName].messages.pattern) ||
                DEFAULT_MESSAGES.pattern;
            renderError($input, message);
            return false;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Invalid pattern attribute:", pattern, error);
            return true;
        }
    }

    function validateEmail($input, value) {
        if ($input.attr("type") !== "email") {
            return true;
        }

        if (EMAIL_PATTERN.test(value)) {
            return true;
        }

        renderError($input, DEFAULT_MESSAGES.email);
        return false;
    }

    function validateCustomRule(fieldName, value, $input) {
        const rule = FIELD_RULES[fieldName];
        if (!rule || typeof rule.validate !== "function") {
            return true;
        }

        if (rule.validate(value)) {
            return true;
        }

        const message = (rule.messages && rule.messages.custom) || DEFAULT_MESSAGES.pattern;
        renderError($input, message);
        return false;
    }

    function validateField($input) {
        const { value, fieldName } = prepareValue($input);

        if (!value) {
            renderError($input, DEFAULT_MESSAGES.required);
            return false;
        }

        const patternValid = validatePattern($input, value, fieldName);
        const emailValid = patternValid && validateEmail($input, value);
        const customValid = emailValid && validateCustomRule(fieldName, value, $input);

        return patternValid && emailValid && customValid;
    }

    function forEachRequiredField($form, callback) {
        $form.find("input[required]").each(function () {
            callback($(this));
        });
    }

    function resetForm($form) {
        if (!$form || !$form.length) {
            return;
        }

        $form[0].reset();
        $form.find("." + CLASS_NAMES.error).removeClass(CLASS_NAMES.error);
        $form.find(SELECTORS.message).remove();
    }

    function validateForm($form) {
        const invalidFields = [];

        forEachRequiredField($form, function ($input) {
            const isFieldValid = validateField($input);
            if (!isFieldValid) {
                invalidFields.push($input);
            }
        });

        if (invalidFields.length > 0) {
            invalidFields[0].focus();
            return false;
        }

        return true;
    }

    global.PhonebookValidation = {
        reset: resetForm,
        validate: validateForm,
    };
})(window, jQuery);

