'use strict';

(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {

    // Extends plugins for adding hello.
    //  - plugin is external module for customizing.
    $.extend($.summernote.plugins, {
        /**
         * @param {Object} context - context object has status of editor.
         */
        'addclass': function (context) {
            var self = this;
            if (typeof context.options.addclass === 'undefined') {
                context.options.addclass = {};
            }
            if (typeof context.options.addclass.classTags === 'undefined') {
                context.options.addclass.classTags = ["jumbotron", "lead","img-rounded","img-circle", "img-responsive","btn", "btn btn-success","btn btn-danger","text-muted", "text-primary", "text-warning", "text-danger", "text-success", "table-bordered", "table-responsive", "alert", "alert alert-success", "alert alert-info", "alert alert-warning", "alert alert-danger", "visible-sm", "hidden-xs", "hidden-md", "hidden-lg", "hidden-print"];
                //  console.log("Please define your summernote.options.addclass.classTags array");
            }
            // ui has renders to build ui elements.
            //  - you can create a button with `ui.button`
            var ui = $.summernote.ui;

            addStyleString(".scrollable-menu {height: auto; max-height: 200px; max-width:300px; overflow-x: hidden;}");

            context.memo('button.addclass', function () {
                return ui.buttonGroup([
                    ui.button({
                        className: 'dropdown-toggle',
                        contents: '<i class="fa fa-css3"\/>' + ' ' + ui.icon(context.options.icons.caret, 'span'),
                        //ui.icon(context.options.icons.magic) + ' ' + ui.icon(context.options.icons.caret, 'span'),
                        tooltip: 'toggle CSS class', //lang.style.style,
                        data: {
                            toggle: 'dropdown'
                        }
                    }),
                    ui.dropdown({
                        className: 'dropdown-style scrollable-menu',
                        items: context.options.addclass.classTags,
                        template: function (item) {

                            if (typeof item === 'string') {
                                item = {tag: "div", title: item, value: item};
                            }

                            var tag = item.tag;
                            var title = item.title;
                            var style = item.style ? ' style="' + item.style + '" ' : '';
                            var cssclass = item.value ? ' class="' + item.value + '" ' : '';
                   

                            return '<' + tag + ' ' + style + cssclass + '>' + title + '</' + tag + '>';
                        },
                        click: function (event, namespace, value) {

                            event.preventDefault();
                            value = value || $(event.target).closest('[data-value]').data('value');



                            var $node = $(context.invoke("restoreTarget"))
                            if ($node.length==0){
                                $node = $(".note-editable").find(document.getSelection().focusNode.parentElement);
                            }
                            
                            if (typeof context.options.addclass !== 'undefined' && typeof context.options.addclass.debug !== 'undefined' && context.options.addclass.debug) {
                                console.debug(context.invoke("restoreTarget"), $node, "toggling class: " + value, window.getSelection());
                            }

							
                            $node.toggleClass(value);
							context.invoke('triggerEvent', 'change');	

                        }
                    })
                ]).render();
                return $optionList;
            });

            function addStyleString(str) {
                var node = document.createElement('style');
                node.innerHTML = str;
                document.body.appendChild(node);
            }

            // This events will be attached when editor is initialized.
            this.events = {
                // This will be called after modules are initialized.
                'summernote.init': function (we, e) {
                    //console.log('summernote initialized', we, e);
                },
                // This will be called when user releases a key on editable.
                'summernote.keyup': function (we, e) {
                    //  console.log('summernote keyup', we, e);
                }
            };

            // This method will be called when editor is initialized by $('..').summernote();
            // You can create elements for plugin
            this.initialize = function () {

            };

            // This methods will be called when editor is destroyed by $('..').summernote('destroy');
            // You should remove elements on `initialize`.
            this.destroy = function () {
                /*  this.$panel.remove();
                 this.$panel = null; */
            };
        }
    });
}));

// select2 - fix dropdown width
if (jQuery.fn.select2) {
	jQuery.fn.select2.amd.require(['select2/dropdown/attachBody'], function(AttachBody) {
		AttachBody.prototype._resizeDropdown = function() {
			let style = {
				width: window.getComputedStyle(this.$container[0]).width
			};

			if (this.options.get("dropdownAutoWidth")) {
				style.minWidth = style.width;
				style.position = "relative";
				style.width = "auto";
			}

			this.$dropdown.css(style);
		};
	}, undefined, true);
}

// select2 - selectOnClose only with tab
if (jQuery.fn.select2) {
	jQuery.fn.select2.amd.require(['select2/dropdown/selectOnClose'], function(SelectOnClose) {
		let fn = SelectOnClose.prototype._handleSelectOnClose;

		SelectOnClose.prototype._handleSelectOnClose = function(_, params) {
			if (params.originalEvent && params.originalEvent.key && (params.originalEvent.key === 'Tab')) {
				return fn.call(this, _, params);
			}
		};
	}, undefined, true);
}

// jquery ui scrollParent fix - fixes wrong position when dragging items in sortable
if (jQuery.fn.scrollParent) {
	let fn = jQuery.fn.scrollParent;
	jQuery.fn.scrollParent = function(includeHidden) {
		let ret = fn.call(this, includeHidden);
		if (ret.is('html')) {
			return $(document);
		}
		return ret;
	};
}

// jquery ui sortable - custom fix for helper/placeholder height and page jumping (esp. in firefox)
if (jQuery.fn.sortable) {
	let fn = jQuery.fn.sortable;

	jQuery.fn.sortable = function(options) {
		let $el = fn.apply(this, arguments);

		if (typeof options === 'object' && options.customHeightFix) {
			let obj = $el.data('ui-sortable');
			obj.options.start = function(event, ui) {
				let item = ui.item[0];
				item.style.display = '';
				ui.helper[0].style.height = ui.placeholder[0].style.height = item.getBoundingClientRect().height + "px";
				ui.helper[0].style.width = ui.placeholder[0].style.width = item.getBoundingClientRect().width + "px";
				item.style.display = 'none';
			};

			let origMouseStart = obj._mouseStart;
			obj._mouseStart = function() {
				$el.css('height', $el.outerHeight());
				let returnValue = origMouseStart.apply(this, arguments);
				$el.css('height', 'auto');
				return returnValue;
			};
		}

		return $el;
	};
}

jQuery.fn.reverse = [].reverse;

window.flagIcons = window.flagIcons || {};
window.getFlagSvg = function(label) {
	label = label.toLowerCase();
	if (label in window.flagIcons) {
		return `<img src="/_slimadmin/app/lib/flag-icon-css/flags/4x3/${window.flagIcons[label]}.svg" data-toggle="tooltip" title="${label}" class="flag">`;
	}
};

window.switchToContainingTab = function($el) {
	$el.parents('.tab-pane').each(function() {
		let id = $(this).attr('id');
		$('[data-toggle="tab"]').filter(`[href="#${id}"],[data-target="#${id}"]`).tab('show');
	});
	$el.parents('.collapse').each(function() {
		$(this).collapse('show');
	});
}


window.uiHandlers.onLoad(function() {

	// click confirmation
	$('[data-confirm]', this).click(function(e) {
		let $form = $(e.target).closest('form');
		if ($form.length && $form[0].noValidate && !Nette.validateForm($form[0])) {
			e.stopImmediatePropagation();
			return e.preventDefault();
		}

		if (!confirm($(e.target).closest('[data-confirm]').attr('data-confirm'))) {
			e.stopImmediatePropagation();
			return e.preventDefault();
		}
	});

	$('form input[name="_formseed2"]', this).each(function() {
		var m = (a, b) => a.length ? [a[0], ...m(b, a.slice(1))] : b;
		$(this).val(m($(this).val().slice(6), $(this).prev().val()).join(''));
	});

	$('[data-trigger-key-change]', this).keyup(debounce(function(e) {
		if (e.target.isConnected) {
			e.target.dispatchEvent(new CustomEvent('change', {
				bubbles: true,
				cancelable: true
			}));
		}
	}, 150, true));

	$('[data-proxy-click]', this).click(function() {
		$($(this).attr('data-proxy-click')).click();
		$(this).blur();
		return false;
	});

	if ($.fn.tooltip) {
		$('[data-toggle="tooltip"],[data-toggle^="tooltip-"]', this).each(function() {
			let $el = $(this);

			if ($el.is(':disabled')) {
				$(this).wrap($('<div />'));
				$el = $(this).parent();
				$el.css('display', 'inline-block').attr('title', $(this).attr('title'));
				$(this).removeAttr('title').css('pointer-events', 'none');
			}

			$el.tooltip({
				template: '<div class="tooltip ' + $(this).data('toggle') + '" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
				container: $('#tooltips-container'),
				placement: $(this).data('toggle').slice(8) || 'top',
				delay: {show: $(this).data('delay') || 0, hide: 0}
			});
		});
	}

	if ($.fn.toggles) {
		$('.toggle', this).toggles({
			'text': {
				'on': '',
				'off': ''
			}
		});
	}

	if ($.fn.modal) {
		let modalEvents = function() {
			$(this).one('hide.bs.modal', function() {
				$(this).find('iframe').each(function() {
					let src = $(this).attr('src');
					$(this).removeAttr('src').attr('src', src);
				})
				$(this).find('video').each(function() {
					this.pause();
				})
			});
			$(this).one('shown.bs.modal', function() {
				$(this).find('form :input:not([disabled]):first').focus();
			});
		};

		$('.modal[data-show="true"]', this).modal('show').each(modalEvents);

		if ($('[data-parent-modal-show="true"]', this).length) {
			$('[data-parent-modal-show="true"]', this).closest('.modal:not(.show)').modal('show').each(modalEvents);
		} else {
			$(this).closest('.modal.show').modal('hide');
		}
	}

	if ($.fn.select2) {
		// enables toggling optgroups
		$.fn.select2ext = function(customOptions) {
			return this.each(function() {
				let $select2 = $(this);

				let options = $.extend({}, customOptions || {});
				let tagValidator = $select2.data('tag-validator');

				if (tagValidator) {
					tagValidator = {
						rule: tagValidator[0],
						arg: tagValidator[1] || null
					};

					if (tagValidator.rule[0] === ':') {
						tagValidator.rule = Nette.validators[tagValidator.rule.slice(1)];
					}
				}

				// adding/removing optgroup items
				options.templateResult = function(result, target) {
					if ($(target).is('.select2-results__group')) {
						$(target).addClass('select2-results__option').attr('aria-selected', '');
						$(target).data('data', {
							_resultId: null,
							ids: result.children.map(function(i) {
								return i.id;
							})
						});
					}

					return result.text;
				};

				if ($select2.is('[name="filter[translations][]"]') || $select2.is('[name="filter[language][]"]')) {
					options.templateResult = function(result, target) {
						return window.getFlagSvg(result.text) + ' ' + result.text;
					};
					options.templateSelection = function(result, target) {
						return window.getFlagSvg(result.text);
					};
					options.escapeMarkup = function(m) {
						return m;
					};
				}

				options.createTag = function(params) {
					let term = $.trim(params.term);

					if (term === '') {
						return null; // deny empty strings
					}
					if (tagValidator && !tagValidator.rule($select2, tagValidator.arg, term)) {
						return null;
					}

					return {
						id: term,
						text: term,
						_tag: true
					}
				};

				if ($select2.data('no-results-text')) {
					let txt = $select2.data('no-results-text');
					options.language = {
						noResults: function() {
							return txt;
						}
					}
				}

				if ($select2.is('[data-ajax--url]')) {
					options.ajax = {
						data: function(params) {
							return $.extend(
								{},
								$select2.data('ajax--parameters') || {},
								params
							);
						}
					};
				}

				$select2.select2(options);

				if ($select2.is('[data-tags-sortable="true"]')) {
					let $ul = $('ul.select2-selection__rendered', $select2.next());
					$ul.sortable({
						containment: $select2.next(),
						update: function(){
							$ul.children('li[title]').each(function(){
								let option = $(this).data('data').element;
								option.parentElement.append(option); // move to the last pos
							});
						}
					});
				}

				$select2.on('select2:selecting', function(e) {
					if (typeof e.params.args.data.ids === 'undefined') {
						return true;
					}

					let current = $select2.val() || [];
					let ids = e.params.args.data.ids;

					let currentWithout = current.filter(function(i) {
						return ids.indexOf(i) < 0;
					});

					// it contained everything => remove it
					if (current.length - ids.length === currentWithout.length) {
						$select2.val(currentWithout);
					} else {
						$select2.val($.merge(current, ids)); // otherwise append missing
					}

					$select2.trigger('change');
					$select2.select2('close');
					return false;
				});

				$select2.on('change', function(e) {
					if (!e.originalEvent) {
						// dispatch native event (needed for nette forms toggleable fields)
						e.target.dispatchEvent(new CustomEvent('change', {
							bubbles: true,
							cancelable: true
						}));

						e.preventDefault();
						e.stopImmediatePropagation();
					}
				});

				// prevent opening on clear/item removing
				$select2.on('select2:unselecting', function() {
					$(this).data('unselecting', true);
				}).on('select2:opening', function(e) {
					if ($(this).data('unselecting')) {
						$(this).removeData('unselecting');
						e.preventDefault();
					}
				});

				// focus next form input on close by tab
				$select2.on('select2:closing', function(e) {
					if (e && e.params && e.params.args && e.params.args.originalEvent && e.params.args.originalEvent.key === 'Tab') {
						let controls = $(this.form.elements);
						let idx = controls.index(this);
						let dir = e.params.args.originalEvent.shiftKey ? -1 : 1;
						let $next = controls.eq(idx + dir);

						if ($next.is('.select2-hidden-accessible')) {
							$next = $next.next().find('.select2-selection');
						}

						$select2.one('select2:close', function() {
							$next.focus();
						});
					}
				});

				// open select by typing on focused element
				$('.select2-selection', $select2.next()).keydown(function(ev) {
					if (ev.which < 32) {
						return;
					}

					$select2.select2('open');
					($select2.data('select2').dropdown.$search || $select2.data('select2').selection.$search).focus();
				});
			});
		};

		$('.select2', this).select2ext({
			selectOnClose: true
		});

		$('select', this).within('.form-layout').select2ext({
			width: '100%',
			selectOnClose: true
		});

		$('select', this).within('.datagrid thead, .datagrid .row-filters').select2ext({
			width: '100%',
			minimumResultsForSearch: 5,
			selectOnClose: true
		});
	}

	// forms
	if (Nette.showInputError) {
		$('select', this).within('form.parsley-validate').parent().addClass('parsley-error-below');
		$('textarea[data-wysiwyg]', this).within('form.parsley-validate').parent().addClass('parsley-error-below');

		// form input change validation
		$('[data-nette-rules]', this).within('form.parsley-validate').each(function() {
			let $input = $(this);
			//$(this).parent().addClass('parsley-input');

			$(this).on('change summernote.blur', function() {
				Nette.formErrors = [];
				let result = Nette.validateControl($(this)[0], null, false);
				let message = Nette.formErrors.length ? Nette.formErrors[0].message : false;

				Nette.showInputError($input, result, message);
			});
		});

		let ajaxOnChangeCallback = function() {
			$(this)
				.closest('form')
				.find('input[name="_ajaxOnChange"]')
				.val($(this).attr('name'))
				.trigger('ajaxClick.nette');
		};

		$('[data-ajaxOnChange="true"]', this).filter('select, input[type="radio"]').on('change', ajaxOnChangeCallback);
		$('[data-ajaxOnChange="true"]', this).filter(':not(select, input[type="radio"])').on('input input.ajaxOnChange', debounce(ajaxOnChangeCallback, 300)); // debounce text inputs

		// switch to tabs with errors (in reverse order, so first tab is the last to be switched onto)
		$('ul.parsley-errors-list', this).reverse().each(function() {
			window.switchToContainingTab($(this));
		});
	}


	if ($.fn.datepicker) {
		$.datepicker.setDefaults({
			closeText: 'Zavřít',
			prevText: '&#x3c;Dříve',
			nextText: 'Později&#x3e;',
			currentText: 'Nyní',
			monthNames: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
			//monthNamesShort: ['led', 'úno', 'bře', 'dub', 'kvě', 'čer', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
			monthNamesShort: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
			dayNames: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'],
			dayNamesShort: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
			dayNamesMin: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
			weekHeader: 'Týd',
			dateFormat: 'dd.mm.yy',
			firstDay: 1,
			isRTL: false,
			showMonthAfterYear: false,
			yearSuffix: ''
		});

		$('input[data-datepicker], [data-provide="datepicker"]', this).each(function() {
			$(this).datepicker({
				showOtherMonths: true,
				selectOtherMonths: true,
				showWeek: true,
				/*changeMonth: true,
				changeYear: true,*/
				onSelect: function(value) {
					$(this).change().trigger('input.ajaxOnChange');

					// date switching in terminal schedule page
					if ($(this).data('trigger')) {
						let target = $('#' + $(this).data('trigger'));
						if (target.data('href')) {
							target.attr('href', target.data('href').replace('__DATE__', value));
						}
						target.click();
					}
				}
			});
		});
	}


	if ($.fn.summernote) {
		$('textarea[data-wysiwyg]', this).each(function() {
			let callbacks = {};
			let textarea = this;

			if ($(this).data('fileupload')) {
				let $form = $(this).closest('form');				
				let name = $(this).attr('data-fileuploadcontrol') || $(this).attr('name');				
				let action = $form.attr('action');	
				let _do = $form.find('[name="_do"]').val().replace('-submit', '-fileupload');
				

				name = name.replace('[', '-').replace(']', '');

				callbacks.onImageUpload = function(files) {
					for (let i = 0; i < files.length; i++) {
						let data = new FormData();
						let $editor = $(this);
						data.append(name, files[i]);
						data.append('_do', _do);

						console.log(_do);
						console.log(action);
						console.log(name);
						console.log($form);

						$.ajax({
							url: action,
							data: data,
							method: 'post',
							cache: false,
							contentType: false,
							processData: false,
							success: function(url) {
								if (url.match(/\.(jpg|gif|png)$/)) {
									$editor.summernote('insertImage', url);
								} else {
									$editor.summernote('createLink', {
										text: files[i].name,
										url: url
									});
								}
							},
							error: function(data) {
								console.log(data);
								alert('Během nahrávání nastala chyba.');
							}
						});
					}
				};
			}

			if ($(this).data('brOnEnter')) {
				callbacks.onEnter = function(e) {
					$(this).summernote('pasteHTML', '<br>&ZeroWidthSpace;');
					e.preventDefault();
				};
			}

			// twitter embed - remember original embed code
			(function() {
				let duplicate = function(el) {
					let $code = $('<div />').html(el.value ? el.value : el.innerHTML);

					$code.remove('.twitter-tweet-hidden');
					$code.find('.twitter-tweet').each(function() {
						$(this).clone().removeClass('twitter-tweet').addClass('twitter-tweet-hidden').attr('hidden', true).insertBefore(this);
					});

					if (el.value) {
						el.value = $code.html();
					} else {
						el.innerHTML = $code.html();
					}
				};
				let cleanup = function(el) {
					let $code = $('<div />').html(el.value ? el.value : el.innerHTML);

					$code.find('twitter-widget, .twitter-tweet-hidden + .twitter-tweet').remove();
					$code.find('.twitter-tweet').filterAttrBegins('data-twitter-extracted').remove();
					$code.find('.twitter-tweet-hidden').removeClass('twitter-tweet-hidden').addClass('twitter-tweet').removeAttr('hidden');

					if (el.value) {
						el.value = $code.html();
					} else {
						el.innerHTML = $code.html();
					}
				};

				duplicate(textarea);

				callbacks.onInit = function(arg) {
					cleanup(textarea);

					arg.toolbar.find('.btn-codeview').click(function() {
						if ($(this).hasClass('active')) {
							cleanup(arg.codable[0]);
						} else {
							duplicate(arg.editable[0]);
						}
					});
				};
				callbacks.onChange = function(contents, $editable) {
					cleanup(textarea);
				};
				callbacks.onChangeCodeview = function(contents, $editable) {
					textarea.value = contents;
				};

				callbacks.onBlur = function() {
					if ($(this).summernote('isEmpty')) {
						this.value = '';
						$(this).trigger('change');
					}
				};
			})();

			let options = $.extend({
				addclass: {
					debug: false,
					classTags: [{title:"H1 size","value":"alfa"},{title:"H2 size","value":"beta"},{title:"H3 size","value":"gamma"},{title:"H4 size","value":"delta"},"text-primary","text-secondary","text-tertiary",]
				},
				height: $(this).data('height') || 100,
				tooltip: false,
				lang: 'cs-CZ',
				followingToolbar: true,
				callbacks: callbacks,
				toolbar: [
					['style1', ['style','addclass']],
					['style', ['bold', 'italic', 'underline', 'strikethrough']],
					['clear', ['clear']],
					['para', ['ul', 'ol', 'paragraph']],
					['table', ['table']],
					['insert', ['link', 'picture', 'emoji']],
					['view', ['fullscreen', 'codeview', 'help']],
				],
				styleTags: ['p', 'h1', 'h2', 'h3', 'h4']

			}, $(this).data('summernoteOptions') || {});

			$(this).summernote(options);

			// fix for random <span>s, https://github.com/summernote/summernote/issues/3088#issuecomment-461618517
			$(document).on('DOMNodeInserted', '.note-editable', function(e) {
				if (e.target.tagName === 'SPAN') {
					$(e.target).replaceWith($(e.target).contents());
				}
			});
		});

		$('textarea[data-airwysiwyg]', this).each(function() {
			$(this).summernote({
				airMode: true,
				tooltip: false,
				lang: 'cs-CZ',
				placeholder: 'Aa',
				popover: {
					air: [['font', ['bold', 'italic', 'underline', 'clear']], ['para', ['ul', 'ol', 'paragraph']], ['link']]
				},
				callbacks: {
					onImageUpload: function(data) {
						data.pop();
					},
					onPaste: function(e) {
						e.preventDefault();

						let clipboardData = ((e.originalEvent || e).clipboardData || window.clipboardData);
						let bufferText = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
						let div = $('<div />');
						div.append(bufferText);
						div.find('*').removeAttr('style');
						div.find('img, svg, style, script, iframe, form, button, input, textarea, select').remove();

						div.find('h1, h2, h3, h4, h5, h6').replaceWith(function() {
							return $("<b />").append($(this).contents());
						});

						setTimeout(function() {
							document.execCommand('insertHtml', false, div.html());
						}, 10);
					},
					onBlur: function() {
						if ($(this).summernote('isEmpty')) {
							this.value = '';
							$(this).trigger('change');
						}
					}
				}
			});
		});
	}


	// File input filename/placeholder
	$('.custom-file input', this).change(function() {
		let placeholder = this.files.length ? $.map(this.files, function(f) {
			return f.name;
		}).join('; ') : ($(this).attr("placeholder") || '');
		$(this).siblings('label').text(placeholder);
	});


	// ImageUploadControl handler
	$('input[type="file"][data-image-upload]', this).each(function() {
		let $input = $(this);
		let mode = $(this).data('image-upload');

		if (mode !== 'preview' && mode !== 'crop') {
			return;
		}

		if (!window.FileReader) {
			alert('Váš prohlížeč nepodporuje FileReader Javascript API, které je vyžadováno pro práci s obrázky.');
			return;
		}

		let $wrap = $('<div />').addClass('jcrop-wrap').insertAfter($input.parent());
		let $img = $('<img />').appendTo($wrap);

		$(this).change(function() {
			$img.trigger('unload');
			$img.removeAttr('src style');

			if (!this.files.length || !this.files[0].type.match('image.*') || $(this).parent().hasClass('parsley-error')) {
				return;
			}

			let reader = new FileReader();
			reader.onload = function(e) {
				$img.attr('src', reader.result);
				$img.one('load', function() {
					$img.trigger('reinit');
				});
			};
			reader.readAsDataURL(this.files[0]);
		});

		if (mode === 'crop' && $.fn.Jcrop) {
			let inputName = $input.attr('name');
			let aspectRatio = parseFloat($input.data('image-upload-crop-ratio') || 0);
			let cropW = $('<input type="hidden" />').attr('name', inputName + '_crop[w]').insertAfter($input);
			let cropH = $('<input type="hidden" />').attr('name', inputName + '_crop[h]').insertAfter($input);
			let cropX = $('<input type="hidden" />').attr('name', inputName + '_crop[x]').insertAfter($input);
			let cropY = $('<input type="hidden" />').attr('name', inputName + '_crop[y]').insertAfter($input);

			let onCoordsChange = function(coords) {
				cropW.val(coords.w);
				cropH.val(coords.h);
				cropX.val(coords.x);
				cropY.val(coords.y);
			};

			$img.on('unload', function(e) {
				if ($img.data('Jcrop')) {
					$img.data('Jcrop').destroy();
				}
			});

			$img.on('reinit', function(e) {
				if ($img.data('Jcrop')) {
					$img.data('Jcrop').destroy();
				}
				let width = $img[0].naturalWidth || 100;
				let height = $img[0].naturalHeight || 100;

				let newWidth = width;
				let newHeight = height;
				let x = 0;
				let y = 0;

				if (aspectRatio > 0) {
					newWidth = height * aspectRatio;
					if (newWidth > width) {
						newWidth = width;
						newHeight = width / aspectRatio;
						y = (height - newHeight) / 2;
					} else {
						x = (width - newWidth) / 2;
					}
				}

				$img.Jcrop({
					aspectRatio: aspectRatio,
					boxWidth: $img.width(),
					boxHeight: $img.height(),
					setSelect: [x, y, newWidth, newHeight],
					onChange: onCoordsChange,
					onSelect: onCoordsChange,
				});
			});
		}
	});


	// Photo picker handler
	$('input[data-photopicker]', this).each(function() {
		let $input = $(this);
		let $wrap = $input.next();

		let $tpl = $('.photopicker-template', $wrap);
		let $btn = $('.photopicker-button', $wrap);

		let $modal = $('#photopicker.modal');
		let $counter = $('#photopicker-counter');
		let $iframe = $('iframe', $modal);

		let limit = $input.data('limit') || Number.MAX_VALUE;
		let photos = {};
		let photosCount = 0;
		let initialized = false;


		let photoPicker = {
			refresh: function() {
				$btn.toggleClass('d-flex', photosCount < limit);

				if ($modal.is('.show')) {
					$counter.text(photosCount + '/' + (limit === Number.MAX_VALUE ? '∞' : limit));
					if (photosCount >= limit) {
						$modal.modal('hide');
					}
				}

				if ($wrap.is('.ui-sortable')) {
					$wrap.sortable('refresh');
				}
			},
			saveInputData: function() {
				let urls = Object.values(photos).sort((a, b) => a.$item.index() - b.$item.index()).map(p => p.url);
				$input.val(JSON.stringify(urls));

				if (initialized) {
					$input.trigger('change');
				}
			},
			exists: function(url) {
				return url in photos;
			},
			add: function(url, previewUrl, $item) {
				if (this.exists(url)) {
					return;
				}

				if (typeof $item === 'undefined') {
					$item = $tpl.clone();
					$item.addClass('photopicker-item');
					$item.attr('data-url', url);
					$item.find('img').attr('src', previewUrl);
					$item.find('a.photopicker-show').attr('href', '/data' + url);

					$wrap.append($item);

					window.uiHandlers.bind($item);
				}

				// buttons
				$('a.photopicker-remove', $item).click(function() {
					if ($.fn.tooltip) {
						$('[data-toggle="tooltip"],[data-toggle^="tooltip-"]', $item).tooltip('dispose');
					}
					photoPicker.remove(url);
					return false;
				});
				$('a.photopicker-show', $item).click(function() {
					$(this).blur();
				});

				// add to stash
				photos[url] = {
					url: url,
					previewUrl: $('img', this).attr('src'),
					$item: $item
				};
				photosCount++;

				this.refresh();
				this.saveInputData();
			},
			remove: function(url) {
				if (!this.exists(url)) {
					return;
				}

				photos[url].$item.remove();
				delete photos[url];
				photosCount--;

				this.refresh();
				this.saveInputData();
			}
		};


		$input.parent().addClass('parsley-error-below');

		// init existing photos
		$('.photopicker-item', $wrap).each(function() {
			let url = $(this).attr('data-url');
			let previewUrl = $('img', this).attr('src');
			let $item = $(this);

			photoPicker.add(url, previewUrl, $item);
		});
		// or init existing photos from value
		if ($('.photopicker-item', $wrap).length === 0) {
			let urls = JSON.parse($input.val());
			if (Array.isArray(urls)) {
				urls.forEach(function(url) {
					let previewUrl = '/imgmin/data' + url + '/w400h400e.' + (window.hasWebpSupport ? 'webp' : 'jpeg');
					photoPicker.add(url, previewUrl);
				});
			}
		}

		if (limit > 1) {
			$wrap.sortable({
				tolerance: 'pointer',
				helper: 'clone', // prevents page scroll-jumping because of scrollable height change
				items: '> .photopicker-item',
				containment: $wrap,
				customHeightFix: true,
				update: photoPicker.saveInputData,
			});
		}

		// modal opener
		$btn.click(function() {
			$iframe[0].photoPicker = photoPicker;

			$iframe.removeAttr('src');
			setTimeout(function() {
				$iframe.attr('src', $iframe.data('src')); // set with slight delay -> it's always blank when opening modal
			});

			$modal.one('shown.bs.modal', photoPicker.refresh);
			$modal.modal('show');

			return false;
		});

		initialized = true;
	});
	// photopicker modal frame
	if (window.frameElement && window.frameElement.photoPicker) {
		let photoPicker = window.frameElement.photoPicker;

		$('.pick-photo', this).each(function() {
			let $btn = $(this);
			let url = $btn.data('url');

			if (url.length) {
				$btn.toggleClass('btn-success', photoPicker.exists(url));

				$btn.click(function() {
					if (!photoPicker.exists(url)) {
						photoPicker.add(
							url,
							$(this).closest('.card').find('img').attr('src')
						);
						$btn.addClass('btn-success');
					} else {
						photoPicker.remove(url);
						$btn.removeClass('btn-success');
					}

					return false;
				});
			}
		});
	}


	// Video picker handler
	$('input[data-videopicker]', this).each(function() {
		let $input = $(this);
		let $wrap = $input.next();
		let limit = $input.data('limit') || Number.MAX_VALUE;
		let initialized = false;

		let $tpl = $('.videopicker-template', $wrap);
		let $btn = $('.videopicker-button', $wrap);

		let $modal = $('#videopicker.modal');
		let $iframe = $('iframe', $modal);

		let refresh = function() {
			let $videos = $('.videopicker-item', $wrap);
			let ids = $videos.map(function() {
				return $(this).data('id');
			}).toArray();

			$input.val(JSON.stringify(ids));

			if (initialized) {
				$input.trigger('change');
			}

			$btn.toggleClass('d-none', $videos.length >= limit);

			if ($wrap.is('.ui-sortable')) {
				$wrap.sortable('refresh');
			}
		};

		let initItem = function() {
			let $itm = $(this);

			$('a.videopicker-remove', $itm).click(function() {
				if ($.fn.tooltip) {
					$('[data-toggle="tooltip"],[data-toggle^="tooltip-"]', $itm).tooltip('dispose');
				}
				$itm.remove();
				refresh();
				return false;
			});
			$('a.videopicker-show', $itm).click(function() {
				$(this).blur();
			});
		};

		let addItem = function(id, title, detailUrl) {
			if ($wrap.find('.videopicker-item[data-id="' + id + '"]').length === 0) {
				let $itm = $tpl.clone();
				$itm.addClass('videopicker-item');
				$itm.attr('data-id', id);
				$itm.find('.videopicker-title').text(title);
				$itm.find('a.videopicker-show').attr('href', detailUrl);

				$itm.each(initItem);

				window.uiHandlers.bind($itm);
				$wrap.append($itm);
				refresh();
			}
		};

		$btn.click(function() {
			$iframe.one('load', function() {
				this.contentWindow.pickVideo = function(id, title, detailUrl) {
					addItem(id, title, detailUrl);
					$modal.modal('hide');
				};
			});

			$iframe.removeAttr('src');
			setTimeout(function() {
				$iframe.attr('src', $iframe.data('src')); // set with slight delay -> it's always blank when opening modal
			});

			$modal.modal('show');

			return false;
		});

		$input.parent().addClass('parsley-error-below');

		if (limit > 1) {
			$wrap.sortable({
				tolerance: 'pointer',
				helper: 'clone', // prevents page scroll-jumping because of scrollable height change
				items: '> .videopicker-item',
				containment: $wrap,
				customHeightFix: true
			});
		}

		$('.videopicker-item', $wrap).each(initItem);
		refresh();

		initialized = true;
	});
	$('.pick-video', this).click(function() {
		let $link = $(this).closest('.file-item').find('a.video-detail');
		window.self.pickVideo(
			$(this).data('id'),
			$link.text(),
			$link.attr('href').replace(/&?embed=(1|true)/, '')
		);
		return false;
	});


	// color picker
	if ($.fn.spectrum) {
		let localization = $.spectrum.localization["cs"] = {
			cancelText: "Zrušit",
			chooseText: "Vybrat",
			clearText: "Zrušit výběr barvy",
			noColorSelectedText: "Žádná barva není vybrána",
			togglePaletteMoreText: "Více",
			togglePaletteLessText: "Méně"
		};

		$.extend($.fn.spectrum.defaults, localization);

		$('input[data-colorpicker]', this).each(function() {
			let palette = this.getAttribute('data-colorpicker-palette');
			let opts = {
				preferredFormat: "hex",
				allowEmpty: !$(this).prop('required'),
				replacerClassName: 'form-control'
			};

			if (palette !== null) {
				palette = $.parseJSON(palette);

				if (!(palette instanceof Array)) {
					palette = [
						["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff"],
						["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"],
						["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d9ead3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"],
						["#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
						["#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0"],
						["#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79"],
						["#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47"],
						["#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"]
					];
				}

				$.extend(opts, {
					showInput: false,
					showPalette: true,
					showPaletteOnly: true,
					palette: palette,
					hideAfterPaletteSelect: true,
				});
			} else {
				$.extend(opts, {
					showInput: true,
				});
			}

			$(this).spectrum(opts);
		});


		$('.sp-replacer', this).parent().addClass('parsley-error-below');
	}


	// masked inputs
	if ($.fn.mask) {
		$('input[data-inputmask]', this).each(function() {
			$(this).mask($(this).data('inputmask'), {
				completed: function() {
					$(this).trigger('input.ajaxOnChange');
				}
			});
		});
	}


	// money inputs
	if ($.fn.autoNumeric) {
		$.fn.autoNumeric.defaults.aPad = false;
		$.fn.autoNumeric.defaults.aSep = '';
		$.fn.autoNumeric.defaults.aDec = ',';
		$.fn.autoNumeric.defaults.pSign = 's';

		$('input[data-autonumeric]', this).each(function() {
			$(this).autoNumeric('init');
		});
	}


	// drop multiupload
	if (typeof Uppy === 'object') {
		$('input[data-dropupload]', this).each(function() {

			let $form = $(this).closest('form');
			let $panel = $('<div />');

			$form.hide().after($panel);

			var uppy = Uppy.Core({
				locale: Uppy.locales.cs_CZ,
				autoProceed: true,
				restrictions: {
					maxFileSize: 15 * 1024 * 1024,
					allowedFileTypes: ['image/*']
				}
			});
			uppy.use(Uppy.Dashboard, {
				target: $panel[0],
				inline: true,
				width: '100%',
				height: 'auto',
				showProgressDetails: true,
			});
			uppy.use(Uppy.Form, {
				target: $form[0],
				addResultToForm: false,
				getMetaFromForm: true
			});
			uppy.use(Uppy.XHRUpload, {
				endpoint: $form.attr('action'),
				fieldName: $(this).attr('name'),
				limit: 1,
				headers: {
					'Accept': $.ajaxSettings.headers && $.ajaxSettings.headers['Accept'] ? $.ajaxSettings.headers['Accept'] : '*/*',
					'X-Requested-With': 'XMLHttpRequest'
				}
			});

			uppy.on('upload-success', function(file, response) {
				uppy.removeFile(file.id);
				$.nette.ext('snippets').updateSnippets(response.body.snippets, false, false);
				$.nette.load();
			});
			uppy.on('upload-error', function(file, error, response) {
				if (response.body.snippets) {
					$.nette.ext('snippets').updateSnippets(response.body.snippets, false, false);
					$.nette.load();
				}
			});
		});
	}


	// universal infinite scroll loader
	$('[data-scroll-loader]', this).each(function() {
		let el = this;
		let url = $(this).data('scrollLoader');
		let running = false;

		let $scrollContainer = $(this).closest('[data-scroll-container]');

		let observer = new IntersectionObserver(function(entries) {
			if (entries[0].isIntersecting && !running && typeof $scrollContainer.data('scrollpos') === 'undefined') {
				running = true;

				$.nette.ajax({
					url: url,
					success: function() {
						let scrollPos = $scrollContainer.scrollTop();
						$scrollContainer.data('restoreScroll', function() {
							$scrollContainer.scrollTop(scrollPos);
							$scrollContainer.removeData('restoreScroll');
						});
					},
					fail: function() {
						running = false;
					}
				});
			}
		}, {
			root: $scrollContainer[0],
			rootMargin: '250px'
		});

		observer.observe(el);
	});


	$('[data-toggle="tab"][href!="#"]', this).click(function() {
		window.history.replaceState({}, document.title, this.href);
	});


	// extend/fix bootstrap things
	$('.dropdown-menu-staying-open', this).click(function(e) {
		e.stopPropagation();
	});
});


window.uiHandlers.onUnload(function() {
	if ($.fn.tooltip) {
		$('[data-toggle="tooltip"],[data-toggle^="tooltip-"]', this).tooltip('dispose');
	}

	// messaging
	if ($(document.body).hasClass('page-messaging')) {
		$('.messages-filter', this).popover('dispose');
	}
});


// init some things now (= just once)
(function() {

	// showing 2nd level sub menu while hiding others
	$('.sidebar-nav-link').on('click', function(e) {
		let $parent = $(this).parent();
		let subMenu = $(this).next('.sidebar-nav-sub');

		// Close other 1st level submenus
		$parent.siblings().removeClass('open').find('.sidebar-nav-sub').slideUp(100);
		// Close all 3rd level submenus
		$('.nav-sub-item.with-sub').removeClass('open').find('.sidebar-nav-sub').slideUp(100);

		if (subMenu.length) {
			e.preventDefault();
			$parent.toggleClass('open');
			subMenu.slideToggle(100);
		}
	});

	$('#slimSidebarMenu').on('click', function(e) {
		e.preventDefault();
		if (window.matchMedia('(min-width: 1200px)').matches) {
			$('body').toggleClass('hide-sidebar');
		} else {
			$('body').toggleClass('show-sidebar');
		}
	});

	// showing 3rd level sub menu while hiding others
	$('.nav-sub-item.with-sub > .nav-sub-link').on('click', function(e) {
		e.preventDefault();
		let $parent = $(this).parent();
		let subMenu = $(this).next('.sidebar-nav-sub');

		// Close other 3rd level submenus at the same level
		$parent.siblings('.with-sub').removeClass('open').find('.sidebar-nav-sub').slideUp(100);

		$parent.toggleClass('open');
		subMenu.slideToggle(100);
	});

	// datagrids reset when switching through menu
	$('.slim-sidebar .nav a:not([href="#"])').on('click', function() {
		let $a = this;
		let url = new URL($a.href);
		url.searchParams.set('resetGrids', '1');
		$a.href = url.href; // add resetGrids=1 to any clicked link in menu
	});
	if (location.href.indexOf('resetGrids=1') > 0) {
		let url = new URL(location.href);
		url.searchParams.delete('resetGrids');
		window.history.replaceState({}, document.title, url.href); // remove it from URL
	}

	// tabs
	if (location.hash) {
		let $tab = $('[data-toggle="tab"][href="' + location.hash + '"]');

		if ($tab.length) {
			$tab.tab('show');
		}
	}

	// CSS helper for viewport height (without toolbars?)
	$(window).resize(function() {
		document.documentElement.style.setProperty('--viewportInnerHeight', window.innerHeight + 'px');
	}).trigger('resize');


	// trigger select2 value update when going back in history - needs more testing
	/*if (window.performance && window.performance.getEntriesByType && window.performance.getEntriesByType("navigation")[0].type === 'back_forward') {
		$(window).on('pageshow', function(e) {
			$('select').trigger('change');
		});
	}*/

	setTimeout(function() {
		$("body").addClass("loaded");
	}, 5);
})();



