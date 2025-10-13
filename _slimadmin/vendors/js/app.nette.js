'use strict';

(function(){

	// use jquery for adding Nette events
	Nette.addEvent = function(element, on, callback) {
		$(element).on(on, callback);
	};

	// custom method
	Nette.showInputError = function($input, result, message) {
		if ($input.attr('type') === 'checkbox') {
			$input = $input.parent();
		}

		let $parent = $input.closest('.parsley-input');
		if (!$parent.length) {
			$parent = $input.parent();
		}

		$parent.toggleClass('parsley-success', result);
		$parent.toggleClass('parsley-error', !result);

		if (!result && message) {
			if (!$input.next('ul.parsley-errors-list').length) {
				$input.after('<ul class="parsley-errors-list filled"><li class="parsley-required"></li></ul>');
			}
			$input.next('ul.parsley-errors-list').find('li').html(message);
		} else {
			$input.next('ul.parsley-errors-list').remove();
		}
	};

	// form submit validation - overrides netteForms fn
	Nette.showFormErrors = function(form, errors) {
		for (let i = 0; i < errors.length; i++) {
			let $input = $(errors[i].element);

			Nette.showInputError($input, false, errors[i].message);

			if (i === 0) {
				let isVisible = () => ($input.is(':visible') || $input.closest('.parsley-input').is(':visible'));

				if (!isVisible() && typeof window.switchToContainingTab === 'function') {
					window.switchToContainingTab($input);
				}
				if (!isVisible()) {
					alert(errors[i].message + '\n\n(Pole je skryté, prosím nahlaste potenciální chybu v systému)');
				}

				$input.focus();
			}
		}
	};

	// custom form validators
	Nette.validators.AppModulesBaseFormsControlsBirthNumberInput_validation = function(elem, args, val) {
		let $matches;

		// be liberal in what you receive
		if (($matches = val.match(/^\s*(\d\d)(\d\d)(\d\d)[ \/]*(\d\d\d)(\d?)\s*$/)) === null) {
			return false;
		}

		let $year = $matches[1];
		let $month = $matches[2];
		let $day = $matches[3];
		let $ext = $matches[4];
		let $c = $matches[5];

		if ($c === '') {
			$year = parseInt($year);
			$year += $year < 54 ? 1900 : 1800;
		} else {
			// kontrolní číslice
			var $mod = parseInt('' + $year + $month + $day + $ext) % 11;
			if ($mod === 10) {
				$mod = 0;
			}
			if ($mod !== parseInt($c)) {
				return false;
			}

			$year = parseInt($year);
			$year += $year < 54 ? 2000 : 1900;
		}

		$month = parseInt($month);
		$day = parseInt($day);

		// k měsíci může být připočteno 20, 50 nebo 70
		if ($month > 70 && $year > 2003) {
			$month -= 70;
		} else if ($month > 50) {
			$month -= 50;
		} else if ($month > 20 && $year > 2003) {
			$month -= 20;
		}

		$month--; // JS month is indexed from 0

		let date = new Date();
		date.setFullYear($year, $month, $day);

		if ((date.getFullYear() !== $year) || (date.getMonth() !== $month) || (date.getDate() !== $day)) {
			return false;
		}

		return true;
	};

	Nette.validators.AppModulesBaseFormsFormExt_validateContains = function(elem, args, val) {
		let selected = [...elem.selectedOptions].map(o => o.value);
		let required = Array.isArray(args) ? args : [args];
		return required.every(v => selected.indexOf(v) !== -1);
	};

	// snippets binding/unbinding UI handlers
	$.nette.ext('snippets').before(function($el) {
		window.uiHandlers.unbind($el);
	});

	$.nette.ext('snippets').after(function($el) {
		if ($el.is('[data-same-snippet]')) {
			$('[data-same-snippet="' + $el.data('same-snippet') + '"').html($el.html()).each(window.uiHandlers.bind);
		} else {
			window.uiHandlers.bind($el);
		}

		$('[data-nette-rules]', $el).each(function() {
			Nette.toggleControl(this, null, null, true);
		});
	});

	// disable button on submit, enable on AJAX response
	$.nette.ext({
		before: function(xhr, settings) {
			if (settings.nette && settings.nette.el) {
				if (settings.nette.el.hasClass('disabled-by-ajax')) {
					return false;
				}
				settings.nette.el.addClass('disabled-by-ajax disabled').prop('disabled', true).trigger('propDisabled');
			}
		},
		complete: function(data) {
			if (!data.redirect) {
				$('.disabled-by-ajax').removeClass('disabled-by-ajax disabled').prop('disabled', false).trigger('propDisabled');
			}
		}
	});


	// proxy click to _click event - because nette.ajax.js uses e.stopPropagation()
	$.nette.ext({
		before: function(xhr, settings) {
			if (settings.nette && settings.nette.e && settings.nette.e.type === 'click') {
				$(document).trigger('_click', settings.nette.e);
			}
		}
	});

})();
