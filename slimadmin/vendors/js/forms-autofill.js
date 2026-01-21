/**
 * Auto-fill form functions for dynamic member selection
 * Author: Claude Code
 * Date: 2025-11-14
 */

/**
 * Toggle birth number field visibility based on nationality selection
 */
function toggleBirthNumber(selectElement) {
    const birthNumberWrapper = document.getElementById('birth-number-wrapper');
    const birthNumberInput = document.getElementById('birth-number-input');

    if (!birthNumberWrapper || !birthNumberInput) {
        return;
    }

    // Find the label for birth number input - search in wrapper's parent structure
    let birthNumberLabel = document.querySelector('label[for="frm-memberForm-birth_number"]');
    if (!birthNumberLabel) {
        // Try different naming conventions
        birthNumberLabel = document.querySelector('label[for="birth-number-input"]');
    }
    if (!birthNumberLabel) {
        // Try to find label within wrapper
        birthNumberLabel = birthNumberWrapper.querySelector('label');
    }

    if (selectElement.value === 'CZE') {
        // Show for Czech nationality
        birthNumberWrapper.style.display = 'block';
        birthNumberInput.style.display = '';
        birthNumberInput.removeAttribute('hidden'); // Remove hidden attribute from Nette
        birthNumberInput.required = true;

        // Add 'required' class to label for CSS asterisk
        if (birthNumberLabel) {
            birthNumberLabel.classList.add('required');
            // Also ensure label is visible
            birthNumberLabel.style.display = '';
        }
    } else {
        // Hide for other nationalities
        birthNumberWrapper.style.display = 'none';
        birthNumberInput.style.display = 'none';
        birthNumberInput.setAttribute('hidden', '');
        birthNumberInput.required = false;
        birthNumberInput.value = '';

        // Remove 'required' class from label
        if (birthNumberLabel) {
            birthNumberLabel.classList.remove('required');
        }
    }
}

/**
 * Fill chairman data in club form
 */
function fillChairmanData(selectElement, membersData) {
    const memberId = selectElement.value;
    const phoneInput = document.getElementById('chairman-phone');
    const emailInput = document.getElementById('chairman-email');

    if (memberId && membersData[memberId]) {
        if (phoneInput) phoneInput.value = membersData[memberId].phone || '';
        if (emailInput) emailInput.value = membersData[memberId].email || '';
    } else {
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
    }
}

/**
 * Fill region chairman data
 */
function fillRegionChairmanData(selectElement, membersData) {
    const memberId = selectElement.value;
    const mobileInput = document.getElementById('chairman-mobile');
    const phoneInput = document.getElementById('chairman-phone');

    if (memberId && membersData[memberId]) {
        const phone = membersData[memberId].phone || '';
        if (mobileInput) mobileInput.value = phone;
        if (phoneInput) phoneInput.value = phone;
    } else {
        if (mobileInput) mobileInput.value = '';
        if (phoneInput) phoneInput.value = '';
    }
}

/**
 * Fill region secretary data
 */
function fillRegionSecretaryData(selectElement, membersData) {
    const memberId = selectElement.value;
    const mobileInput = document.getElementById('secretary-mobile');
    const phoneInput = document.getElementById('secretary-phone');

    if (memberId && membersData[memberId]) {
        const phone = membersData[memberId].phone || '';
        if (mobileInput) mobileInput.value = phone;
        if (phoneInput) phoneInput.value = phone;
    } else {
        if (mobileInput) mobileInput.value = '';
        if (phoneInput) phoneInput.value = '';
    }
}

/**
 * Fill region discipline chairman data
 */
function fillRegionDisciplineChairmanData(selectElement, membersData) {
    const memberId = selectElement.value;
    const mobileInput = document.getElementById('discipline-chairman-mobile');
    const phoneInput = document.getElementById('discipline-chairman-phone');

    if (memberId && membersData[memberId]) {
        const phone = membersData[memberId].phone || '';
        if (mobileInput) mobileInput.value = phone;
        if (phoneInput) phoneInput.value = phone;
    } else {
        if (mobileInput) mobileInput.value = '';
        if (phoneInput) phoneInput.value = '';
    }
}

/**
 * Fill team leader data
 */
function fillLeaderData(selectElement, membersData) {
    const memberId = selectElement.value;
    const phoneInput = document.getElementById('leader-phone');
    const emailInput = document.getElementById('leader-email');

    if (memberId && membersData[memberId]) {
        if (phoneInput) phoneInput.value = membersData[memberId].phone || '';
        if (emailInput) emailInput.value = membersData[memberId].email || '';
    } else {
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize birth number visibility on page load
    const nationalitySelect = document.getElementById('nationality-select');
    if (nationalitySelect) {
        toggleBirthNumber(nationalitySelect);

        // Add change listener - use both native and jQuery for select2 compatibility
        nationalitySelect.addEventListener('change', function() {
            toggleBirthNumber(this);
        });

        // Also listen for select2 change event if select2 is used
        if (window.jQuery && jQuery(nationalitySelect).data('select2')) {
            jQuery(nationalitySelect).on('change', function() {
                toggleBirthNumber(this);
            });
        }
    }
});
