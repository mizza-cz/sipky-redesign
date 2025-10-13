/**
 * Match form - dynamic captain loading based on team selection
 */
$(function () {
    // Home team change handler
    $('#frm-matchForm-home_team_id').on('change', function() {
        var teamId = $(this).val();
        var captainSelect = $('#frm-matchForm-home_captain_id');

        if (teamId) {
            loadCaptains(teamId, 'home', captainSelect);
        } else {
            // Clear select if no team selected
            captainSelect.empty().append('<option value="">-- Vyberte kapitána --</option>');
        }
    });

    // Away team change handler
    $('#frm-matchForm-away_team_id').on('change', function() {
        var teamId = $(this).val();
        var captainSelect = $('#frm-matchForm-away_captain_id');

        if (teamId) {
            loadCaptains(teamId, 'away', captainSelect);
        } else {
            // Clear select if no team selected
            captainSelect.empty().append('<option value="">-- Vyberte kapitána --</option>');
        }
    });

    /**
     * Load captains via AJAX
     */
    function loadCaptains(teamId, type, selectElement) {
        // Get current selected value to preserve it if possible
        var currentValue = selectElement.val();

        // Show loading state
        selectElement.prop('disabled', true);
        selectElement.empty().append('<option value="">Načítání...</option>');

        // Get the link to AJAX handler from parent div
        var baseLink = $('[data-load-captains-link]').data('load-captains-link');

        // Build URL with parameters
        var separator = baseLink.indexOf('?') !== -1 ? '&' : '?';
        var url = baseLink + separator + 'teamId=' + teamId + '&type=' + type;

        // Make AJAX request
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    // Clear and rebuild select options
                    selectElement.empty();
                    selectElement.append('<option value="">-- Vyberte kapitána --</option>');

                    $.each(response.captains, function(memberId, fullName) {
                        var option = $('<option></option>')
                            .attr('value', memberId)
                            .text(fullName);
                        selectElement.append(option);
                    });

                    // Restore previous value if it exists in new options
                    if (currentValue && selectElement.find('option[value="' + currentValue + '"]').length > 0) {
                        selectElement.val(currentValue);
                    }

                    selectElement.prop('disabled', false);
                } else {
                    console.error('Failed to load captains');
                    selectElement.empty().append('<option value="">Chyba načtení</option>');
                    selectElement.prop('disabled', false);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error:', error);
                selectElement.empty().append('<option value="">Chyba načtení</option>');
                selectElement.prop('disabled', false);
            }
        });
    }
});
