/**
 * Add red asterisk (*) to required form fields
 * Runs on page load and after AJAX updates
 */
(function() {
    // Track which labels already have asterisks to prevent duplicates
    var processedLabels = new WeakSet();

    function addRequiredAsterisk() {
        // Find all required inputs
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(function(input) {
            // Find the label for this input
            var label = null;

            // Try to find label by 'for' attribute
            if (input.id) {
                label = document.querySelector('label[for="' + input.id + '"]');
            }

            // If not found, try to find label as previous sibling or parent
            if (!label) {
                var prev = input.previousElementSibling;
                if (prev && prev.tagName === 'LABEL') {
                    label = prev;
                }
            }

            if (!label) {
                var parent = input.parentElement;
                if (parent) {
                    label = parent.querySelector('label');
                }
            }

            // Add asterisk if label found and doesn't already have one
            if (label && !processedLabels.has(label) && !label.querySelector('.required-asterisk')) {
                var asterisk = document.createElement('span');
                asterisk.className = 'required-asterisk';
                asterisk.style.color = '#dc3545';
                asterisk.style.fontWeight = 'bold';
                asterisk.textContent = ' *';
                label.appendChild(asterisk);

                // Mark this label as processed
                processedLabels.add(label);
            }
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addRequiredAsterisk);
    } else {
        addRequiredAsterisk();
    }

    // Run after AJAX updates (for Nette AJAX)
    if (typeof $ !== 'undefined') {
        $(document).on('snippet-update', addRequiredAsterisk);
    }
})();
