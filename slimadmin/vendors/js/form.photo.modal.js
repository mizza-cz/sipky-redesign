(function() {

	let keyboardHandler;

	window.uiHandlers.onLoad(function() {
		let $this = $(this);
		let $form = $('#frm-editForm', this);
		if (!$form.length) {
			return;
		}

		// submit button enabled/disabled when values changed
		let $inputs = $form.find(':input:not(:disabled):not(:submit):not([type="hidden"])');
		let $submit = $form.find('.btn:submit');

		let caption = $submit.data('originalCaption') || $submit.val();
		let initialValues = $form.serialize();

		$submit.prop('disabled', true);

		$inputs.change(function() {
			let valuesChanged = $form.serialize() !== initialValues;

			$submit.prop('disabled', !valuesChanged);
			$submit.val(caption);
		});

		// left/right arrow keys
		keyboardHandler = function(event) {
			if ($(':focus').is(':input:not([type="checkbox"])')) {
				return;
			}
			if (event.code === 'ArrowLeft') {
				$this.find('.filemodal-prevfile').click();
			} else if(event.code === 'ArrowRight') {
				$this.find('.filemodal-nextfile').click();
			}
		};
		document.addEventListener('keydown', keyboardHandler);
	});

	window.uiHandlers.onUnload(function() {
		// left/right arrow keys
		if ($('#frm-editForm', this).length) {
			document.removeEventListener('keydown', keyboardHandler);
		}
	});

})();
