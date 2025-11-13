/* global window, jQuery, PhonebookStore, PhonebookValidation */

(function (global, $, store, validation) {
    "use strict";

    if (!$ || !store || !validation) {
        throw new Error("PhonebookUI requires jQuery, PhonebookStore, and PhonebookValidation.");
    }

    let selectedContactId = null;
    let elements = {};

    function getInitials(name) {
        if (!name || typeof name !== "string") {
            return "NA";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join("") || "NA";
    }

    function makeAvatarSrc(initials) {
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
    }

    function sanitizePhoneNumber(phone) {
        if (typeof phone !== "string") {
            return "";
        }

        return phone.replace(/[^0-9+]/g, "");
    }

    function cacheElements() {
        elements = {
            contactList: $("#contact-list"),
            detailsPage: $("#contact-details-page"),
            detailsName: $("#details-name"),
            detailsInitials: $("#details-initials"),
            detailsPhone: $("#details-phone"),
            detailsEmail: $("#details-email"),
            detailsGender: $("#details-gender"),
            editContactButton: $("#edit-contact-button"),
            deleteContactButton: $("#delete-contact-button"),
            callContactButton: $("#call-contact-button"),
            confirmDeleteButton: $("#confirm-delete-button"),
            cancelDeleteButton: $("#cancel-delete-button"),
            deletePopup: $("#delete-contact-popup"),
            addContactForm: $("#add-contact-form"),
            editContactForm: $("#edit-contact-form"),
            addFields: {
                name: $("#add-name"),
                phone: $("#add-phone"),
                email: $("#add-email"),
                gender: $("input[name='gender']"),
            },
            editFields: {
                id: $("#edit-id"),
                name: $("#edit-name"),
                phone: $("#edit-phone"),
                email: $("#edit-email"),
                gender: $("input[name='edit-gender']"),
                genderMale: $("#edit-gender-male"),
                genderFemale: $("#edit-gender-female"),
            },
        };
    }

    function renderContacts() {
        const $list = elements.contactList;
        const contacts = store.getAll().sort((a, b) => a.name.localeCompare(b.name));

        $list.empty();

        if (contacts.length === 0) {
            $list.append(
                $("<li>")
                    .addClass("ui-li-static ui-body-inherit")
                    .text("No contacts yet. Tap + to add one!")
            );
        } else {
            contacts.forEach((contact) => {
                const initials = getInitials(contact.name);
                const avatarSrc = makeAvatarSrc(initials);
                const sanitizedTel = sanitizePhoneNumber(contact.phone);

                const $detailsLink = $("<a>")
                    .attr("href", "#contact-details-page")
                    .attr("data-contact-id", contact.id)
                    .addClass("contact-list-main")
                    .append(
                        $("<span>")
                            .addClass("contact-list-thumb-wrapper")
                            .append(
                                $("<img>")
                                    .attr("src", avatarSrc)
                                    .attr("alt", `${contact.name} avatar`)
                                    .addClass("contact-list-thumb")
                            )
                    )
                    .append(
                        $("<span>")
                            .addClass("contact-list-text")
                            .append($("<h2>").text(contact.name))
                            .append($("<p>").text(contact.phone))
                    );

                const $callLink = $("<a>")
                    .attr("aria-label", `Call ${contact.name}`)
                    .attr("data-icon", "phone")
                    .attr("data-iconpos", "notext")
                    .addClass("contact-list-call");

                if (sanitizedTel) {
                    $callLink.attr("href", `tel:${sanitizedTel}`);
                } else {
                    $callLink
                        .attr("href", "#")
                        .attr("tabindex", "-1")
                        .addClass("ui-state-disabled");
                }

                $("<li>").append($detailsLink).append($callLink).appendTo($list);
            });
        }

        try {
            $list.listview("refresh");
        } catch (error) {
            // Initial render before jQuery Mobile enhances the list.
        }
    }

    function showContactDetails(contact) {
        if (!contact) {
            return;
        }

        selectedContactId = contact.id;

        elements.detailsName.text(contact.name);
        elements.detailsInitials.text(getInitials(contact.name));
        elements.detailsPhone.text(contact.phone);
        elements.detailsEmail.text(contact.email);
        elements.detailsGender.text(contact.gender);

        elements.editContactButton.attr("data-contact-id", contact.id);
        elements.deleteContactButton.attr("data-contact-id", contact.id);
        elements.confirmDeleteButton.attr("data-contact-id", contact.id);
        elements.cancelDeleteButton.attr("data-contact-id", contact.id);
    }

    function fillEditForm(contact) {
        if (!contact) {
            return;
        }

        elements.editFields.id.val(contact.id);
        elements.editFields.name.val(contact.name);
        elements.editFields.phone.val(contact.phone);
        elements.editFields.email.val(contact.email);

        if (contact.gender === "Female") {
            elements.editFields.genderFemale.prop("checked", true);
            elements.editFields.genderMale.prop("checked", false);
        } else {
            elements.editFields.genderMale.prop("checked", true);
            elements.editFields.genderFemale.prop("checked", false);
        }
    }

    function resetAddForm() {
        validation.reset(elements.addContactForm);
    }

    function handleContactTap() {
        const id = $(this).data("contact-id");
        const contact = store.findById(id);

        if (!contact) {
            return;
        }

        selectedContactId = contact.id;
        showContactDetails(contact);
    }

    function ensureContactSelected() {
        if (!selectedContactId) {
            $.mobile.changePage("#contact-list-page", { changeHash: false });
            return null;
        }

        const contact = store.findById(selectedContactId);

        if (!contact) {
            selectedContactId = null;
            $.mobile.changePage("#contact-list-page", { changeHash: false });
            return null;
        }

        return contact;
    }

    function handleDetailsBeforeShow() {
        const contact = ensureContactSelected();
        if (contact) {
            showContactDetails(contact);
        }
    }

    function handleEditBeforeShow() {
        const id = elements.editContactButton.data("contact-id");
        const contact = store.findById(id);

        if (!contact) {
            $.mobile.changePage("#contact-list-page", { changeHash: false });
            return;
        }

        selectedContactId = contact.id;
        fillEditForm(contact);
    }

    function refreshEditRadioButtons() {
        elements.editFields.gender.each(function () {
            $(this).checkboxradio("refresh");
        });
    }

    function collectAddFormData() {
        return {
            name: elements.addFields.name.val(),
            phone: elements.addFields.phone.val(),
            email: elements.addFields.email.val(),
            gender: elements.addFields.gender.filter(":checked").val(),
        };
    }

    function collectEditFormData() {
        return {
            id: elements.editFields.id.val(),
            name: elements.editFields.name.val(),
            phone: elements.editFields.phone.val(),
            email: elements.editFields.email.val(),
            gender: elements.editFields.gender.filter(":checked").val(),
        };
    }

    function handleAddSubmit(event) {
        event.preventDefault();
        const $form = elements.addContactForm;

        if (!validation.validate($form)) {
            return;
        }

        store.add(collectAddFormData());
        renderContacts();
        selectedContactId = null;

        $.mobile.changePage("#contact-list-page", {
            reverse: true,
            changeHash: false,
        });
    }

    function handleEditSubmit(event) {
        event.preventDefault();
        const $form = elements.editContactForm;

        if (!validation.validate($form)) {
            return;
        }

        const data = collectEditFormData();
        const contact = store.update(data.id, data);

        if (!contact) {
            return;
        }

        renderContacts();
        selectedContactId = contact.id;
        showContactDetails(contact);

        $.mobile.changePage("#contact-details-page", { reverse: true });
    }

    function handleDeleteButtonClick(event) {
        event.preventDefault();
        const id = $(this).data("contact-id");
        elements.confirmDeleteButton.attr("data-contact-id", id);
        elements.deletePopup.popup("open");
    }

    function handleCancelDelete(event) {
        event.preventDefault();
        elements.deletePopup.popup("close");
    }

    function handleConfirmDelete(event) {
        event.preventDefault();
        const id = $(this).data("contact-id");

        if (store.remove(id)) {
            renderContacts();
            selectedContactId = null;
        }

        elements.deletePopup.popup("close");
        $.mobile.changePage("#contact-list-page", { changeHash: false });
    }

    function handleDeletePopupClose() {
        elements.confirmDeleteButton.removeAttr("data-contact-id");
    }

    function bindEvents() {
        elements.contactList.on("click", "a", handleContactTap);

        elements.detailsPage.on("pagebeforeshow", handleDetailsBeforeShow);
        $("#contact-list-page").on("pagebeforeshow", renderContacts);
        $("#add-contact-page").on("pagebeforeshow", resetAddForm);
        $("#edit-contact-page").on("pagebeforeshow", handleEditBeforeShow);
        $("#edit-contact-page").on("pageshow", refreshEditRadioButtons);

        elements.addContactForm.on("submit", handleAddSubmit);
        elements.editContactForm.on("submit", handleEditSubmit);

        elements.deleteContactButton.on("click", handleDeleteButtonClick);
        elements.cancelDeleteButton.on("click", handleCancelDelete);
        elements.confirmDeleteButton.on("click", handleConfirmDelete);
        elements.deletePopup.on("popupafterclose", handleDeletePopupClose);
    }

    function init() {
        cacheElements();
        renderContacts();
        bindEvents();
    }

    global.PhonebookUI = {
        init,
    };
})(window, jQuery, window.PhonebookStore, window.PhonebookValidation);

