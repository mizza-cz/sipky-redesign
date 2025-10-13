window.uiHandlers.onLoad(function() {

	let $grids = $('tbody', this).has('.handle-sort');
	let sortUrl = $grids.find('.handle-sort').attr('href');

	$grids.each(function(){
		$(this).sortable({
			connectWith: $grids,
			handle: '.handle-sort',
			tolerance: 'pointer',
			stop: function(event, ui) {
				let urlParams = {
					item_id: ui.item.data('id'),
					prev_id: ui.item.prev().data('id') || '',
					next_id: ui.item.next().data('id') || '',
					type: ui.item.closest('[data-menu-type]').attr('data-menu-type'),
				};

				$.ajax({
					url: sortUrl + '&' + jQuery.param(urlParams),
					fail: function() {
						alert('Při řazení nastala chyba. Stránka bude aktualizována.');
						location.reload();
					}
				});
			}
		});
	});
	$grids.find('.handle-sort').click(() => false);

});
