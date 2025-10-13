(function() {

	let componentNum = 0;

	const initComponent = function() {
		let componentId = `pageBuilder${componentNum++}`;
		let blockNum = 0;
		let inputNum = 0;

		const templates = {
			base: `<div class="bd"></div>`,
			blocks: `<div class="p-1"></div>`,
			buttons: `<div class="pl-1 pr-1"></div>`,

			createBlock: function(data, title) {
				let blockId = `${componentId}-${blockNum++}`;
				let $block = $(`
					<div>
						<div class="pb-1">
							<div class="card">
								<div class="card-header d-flex align-items-center justify-content-between py-0 ${componentId}-handle">
									<div class="toggle toggle-modern success mr-3" data-toggle-height="19" data-toggle-width="30" data-toggle-drag="false" title="Show block"></div>
									<a href="#${blockId}" data-toggle="collapse" class="flex-1 py-3 tx-inverse tx-medium lh-1" aria-expanded="${data.expanded == '1' ? 'true' : 'false'}">
										${title || blockTypes[data.type]} ${data.builderTitle ? ' - ' + data.builderTitle : ''}
									</a>
									<div class="card-option tx-20">
										<a href="#" class="tx-gray-600 valign-middle" title="Odebrat" data-toggle="tooltip" data-action="remove"><i class="icon ion-close"></i></a>
									</div>
								</div>
								<div id="${blockId}" class="collapse ${data.expanded == '1' ? 'show' : ''}">
									<div class="card-body bd-t">
									</div>
								</div>
							</div>
						</div>
					</div>
				`);

				let $toggle = $block.find(`.card-header:first .toggle`);
				let $body = $block.find('.card-body');

				
				$body.append(formInputFactory.hidden(data, 'expanded', 'Expanded'));

				// default input set
				$body.append(formInputFactory.select(data, 'maxW', 'Expand', {no: 'No', yes: 'Yes'}));
				$body.append(formInputFactory.text(data, 'anchorId', 'Anchor - Element ID'));
				$body.append(formInputFactory.text(data, 'builderTitle', 'Builder title'));

				$body.append("<hr>");

				// set default value
				$toggle.data('toggleOn', data.active !== false);

				// get data
				$block.data('getData', function() {
					let result = {
						type: data.type,
						active: $toggle.data('toggles').active
					};

					// find inputs, get their data
					$body.find('> [data-pagebuilder-input]').each(function() {
						let name = $(this).data('pagebuilderInput');
						result[name] = $(this).data('getData')();
					});

					return result;
				});

				return $block;
			},
			createButton: (type) => $(`
				<a href="#" data-action="add" data-type="${type}" class="btn btn-sm btn-outline-light tx-gray-700 mb-1">
					<i class="icon ion-plus mr-1"></i>
					${blockTypes[type]}
				</a>
			`),
		};

		const validation = {
			addRule: function($input, rule) {
				let ruleArgs = Array.isArray(rule) ? rule : [rule];
				rule = ruleArgs.shift();

				if (rule in validation._rules) {
					validation._rules[rule]($input, ...ruleArgs);
				}
			},
			_addNetteRule: function($input, rule) {
				let rules = JSON.parse($input.attr('data-nette-rules') || '[]');
				rules.push(rule);
				$input.attr('data-nette-rules', JSON.stringify(rules));
			},
			_rules: {
				required: ($input) => validation._addNetteRule($input, {op: ':filled', msg: 'Please fill in this field.'}),
				pattern: ($input, pattern, message) => validation._addNetteRule($input, {op: 'pattern', msg: message, arg: pattern}),
				latlon: ($input) => validation._rules.pattern($input, '-?[0-9]+[,\\.][0-9]+', 'Enter valid coordinates (decimal)'),
				url: ($input) => validation._rules.pattern($input, '^(https?:\\/\\/|\\/)\\w+\\.[^\\s]+$|^\\/[^\\s]*$', 'Please enter a valid URL.'),
				intRange: ($input, min, max) => { validation._addNetteRule($input, {op: 'range', msg: `Enter a value in the range ${min}–${max}`, 'arg': [min, max]});  $input.attr({type: 'number'}); }
			},
		};

		const formInputFactory = {
			photo: (data, name, label, limit, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<input type="text" data-photopicker data-limit="${limit || 0}" id="${id}" class="form-control d-none">
							<div class="bd d-flex flex-wrap pt-2 pl-2 bg-gray-100">

								<figure class="overlay mb-2 mr-2 d-flex align-items-center justify-content-center order-1 photopicker-button">
									<a href="#" class="btn btn-outline-light tx-gray-700">
										<i class="icon ion-plus mr-1"></i>
										Add photo
									</a>
								</figure>

								<figure class="overlay mb-2 mr-2 bg-gray-300 photopicker-template">
									<img class="img-fit-cover" alt="">
									<figcaption class="overlay-body d-flex align-items-end justify-content-center">
										<div class="img-option img-option-sm">
											<a class="img-option-link photopicker-show" title="View photo" data-toggle="tooltip" target="_blank">
												<div><i class="icon ion-arrow-expand tx-22-force"></i></div>
											</a>
											<a href="#" class="img-option-link photopicker-remove" title="Remove" data-toggle="tooltip">
												<div><i class="icon ion-close"></i></div>
											</a>
										</div>
									</figcaption>
								</figure>

							</div>
						</div>
					</div>
				`);

				// set default value
				$input.find('input').val(JSON.stringify(data[name] || []));

				// get data
				$input.data('getData', () => {
					return JSON.parse($input.find('input').val());
				});

				// add validation rules
				rules = rules || [];
				if (rules.indexOf('required') !== -1) {
					rules[rules.indexOf('required')] = ['pattern', '\\[.+\\]', 'Prosím vyplňte toto pole.'];
				}

				rules.forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			video: (data, name, label, limit, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<input type="text" data-videopicker data-limit="${limit || 0}" id="${id}" class="form-control d-none">
							<div class="bd d-flex flex-wrap pt-2 pl-2 pr-2 bg-gray-100">

								<figure class="overlay mb-2 mr-2 align-items-center justify-content-center order-1 videopicker-button">
									<a href="#" class="btn btn-outline-light tx-gray-700">
										<i class="icon ion-plus mr-1"></i>
										Add video
									</a>
								</figure>

								<figure class="align-items-center mb-2 mr-2 bg-primary videopicker-template">
									<div class="videopicker-title tx-white px-3"></div>
									<figcaption>
										<div class="img-option img-option-sm mb-0">
											<a class="img-option-link videopicker-show" title="View video" data-toggle="tooltip" target="_blank">
												<div><i class="icon ion-arrow-expand tx-22-force"></i></div>
											</a>
											<a href="#" class="img-option-link videopicker-remove" title="Remove" data-toggle="tooltip">
												<div><i class="icon ion-close"></i></div>
											</a>
										</div>
									</figcaption>
								</figure>

							</div>
						</div>
					</div>
				`);

				// set default value
				$input.find('input').val(JSON.stringify(Object.keys(data[name] || [])));

				if (typeof data[name] === 'object') {
					let $tpl = $input.find('.videopicker-template');

					Object.keys(data[name]).forEach((id) => {
						let $video = $tpl.clone();
						$video.addClass('videopicker-item').removeClass('videopicker-template').attr('data-id', id);
						$video.data('id', id);
						$video.find('.videopicker-title').text(data[name][id]);
						$video.find('.videopicker-show').attr('href', '/admin/video/?editedVideo=' + id);
						$video.insertAfter($tpl);
					});
				}

				// get data
				$input.data('getData', () => {
					let data = {};

					$input.find('.videopicker-item').each(function() {
						data[$(this).data('id')] = $(this).find('.videopicker-title').text();
					});

					return data;
				});

				// add validation rules
				rules = rules || [];
				if (rules.indexOf('required') !== -1) {
					rules[rules.indexOf('required')] = ['pattern', '\\[.+\\]', 'Please fill in this field.'];
				}
				rules.forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			select: (data, name, label, options, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<select data-minimum-results-for-search="-1" id="${id}" class="form-control">
								${Object.keys(options).map(key => `<option value="${key}" ${key === data[name] ? 'selected' : ''}>${options[key]}</option>`).join('')}
							</select>
						</div>
					</div>
				`);

				// get data
				$input.data('getData', () => {
					return $input.find('select').val();
				});

				// add validation rules
				(rules || []).forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			text: (data, name, label, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<input type="text" id="${id}" class="form-control">
						</div>
					</div>
				`);

				// set default value
				$input.find('input').val(data[name] || '');

				// get data
				$input.data('getData', () => {
					return $input.find('input').val();
				});

				// add validation rules
				(rules || []).forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			hidden: (data, name, label, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group d-none">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<input type="hidden" id="${id}" class="form-control">
						</div>
					</div>
				`);

				// set default value
				$input.find('input').val(data[name] || '');

				// get data
				$input.data('getData', () => {
					return $input.find('input').val();
				});

				// add validation rules
				(rules || []).forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			wysiwyg: (data, name, label, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let fileUploadControl = $pagebuilder.attr('name') || $pagebuilder.data('fileuploadcontrol') || '';
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<textarea id="${id}" class="form-control" data-wysiwyg="true" data-fileupload="true" data-fileuploadcontrol="${fileUploadControl}"></textarea>
						</div>
					</div>
				`);

				// set default value
				$input.find('textarea').val(data[name] || '');

				// get data
				$input.data('getData', () => {
					return $input.find('textarea').val();
				});

				// add validation rules
				(rules || []).forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			textarea: (data, name, label, rules) => {
				let id = `${componentId}-i${inputNum++}`;
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label" for="${id}">
							<span>${label}</span>
						</label>
						<div class="col-sm-10 parsley-input">
							<textarea id="${id}" class="form-control"></textarea>
						</div>
					</div>
				`);

				// set default value
				$input.find('textarea').val(data[name] || '');

				// get data
				$input.data('getData', () => {
					return $input.find('textarea').val();
				});

				// add validation rules
				(rules || []).forEach((rule) => validation.addRule($input.find(':input'), rule));

				return $input;
			},
			group: (label, hr) => $(`
				${hr === false ? '' : '<hr>'}
				<div class="row form-group">
					<div class="col-sm-10 offset-sm-2 mg-t-10 mg-sm-t-0">
						<h6 class="slim-card-title">${label}</h6>
					</div>
				</div>
			`),
			dynamicItems: (data, name, label, builder) => {
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="row form-group">
						<label class="col-sm-2 form-control-label">${label}</label>
						<div class="col-sm-10 parsley-input">
							<div class="items"></div>
							<div class="my-2">
								<a href="#" data-action="add" class="btn btn-sm btn-outline-light tx-gray-700">
									<i class="icon ion-plus mr-1"></i> Add more
								</a>
							</div>
						</div>
					</div>
				`);

				let $items = $input.find('.items');
				let iteration = 0;
				let add = function(itemData) {
					let $item = $(`
						<div>
							<div class="card d-flex flex-row" style="margin-bottom: -1px; overflow: hidden;">
								<div class="card-header d-flex p-0">
									<div class="card-option tx-14">
										<a href="#" class="tx-gray-600 d-block p-2" title="Remove" data-toggle="tooltip-left" data-action="remove"><i class="icon ion-close"></i></a>
									</div>
								</div>
								<div class="card-body flex-1 bd-l p-1" style="margin-bottom: -0.33rem; overflow: hidden;" data-id="${iteration}"></div>
							</div>
						</div>
					`);
					iteration = iteration + 1; 
					let $itemBody = $item.find('.card-body');

					builder($itemBody, itemData);

					$item.find('a[data-action="remove"]').click(function() {
						window.uiHandlers.unbind($item);
						$item.remove();
						$items.sortable('refresh');
						$items.trigger('change');
						return false;
					});

					$item.data('getData', () => {
						return $itemBody.find('> [data-pagebuilder-input]')
							.map((i, item) => ({[$(item).data('pagebuilderInput')]: $(item).data('getData')()}))
							.toArray()
							.reduce((result, val) => ({...result, ...val}), {});
					});

					$item.appendTo($items);

					return $item;
				};

				$items.sortable({
					axis: 'y',
					tolerance: 'pointer',
					helper: 'clone', // prevents page scroll-jumping because of scrollable height change
					handle: '.card-header',
					containment: $items,
					customHeightFix: true,
					cancel: 'input, textarea, button, select, option, .sortable-handle-ignore, [data-action]'
				});

				// button for adding new item
				$input.find('a[data-action="add"]').click(function() {
					let $part = add({});
					window.uiHandlers.bind($part);
					$items.sortable('refresh');
					$items.trigger('change');
					$(this).blur();
					return false;
				});

				// set default value
                if (data[name] && data[name].length) {
                    data[name].forEach(item => add(item));
                    $items.sortable('refresh');
                }

				// get data
				$input.data('getData', () => {
					return $items.find('> div')
						.map((i, item) => $(item).data('getData')())
						.toArray();
				});

				return $input;
			},
			pageBuilder: (data, name, blocks) => {
				let $input = $(`
					<div data-pagebuilder-input="${name}" class="form-group">
						<input type="text" data-jscomponent="pageBuilder" data-blocks='${JSON.stringify(blocks)}' data-fileuploadcontrol="${$pagebuilder.attr('name')}" class="form-control d-none">
						<div>
							<div class="bd p-4 tx-center bg-gray-100">
								<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>
							</div>
						</div>
					</div>
				`);

				let $subPageBuilder = $input.find('[data-jscomponent="pageBuilder"]');
				$subPageBuilder.attr('data-ajax--url', $pagebuilder.attr('data-ajax--url')); // copy ajax URL from parent pagebuilder

				// set default value
				$subPageBuilder.val(JSON.stringify(data[name] || '[]'));

				// get data
				$input.data('getData', function() {
					return $subPageBuilder.data('pageBuilder').getData();
				});

				return $input;
			}
		};

		const blockTypesHomepage = {
			header: 'Header',
			header2: 'Background text',
			photo_text: 'Image + text',
			photo_text2: 'Image + text from builder',
			solo_image:	'Solo image',
			tabs: 'Tabs',
			milestones: 'Milestones',
			tiles: 'Tiles',
			documents: 'Documents',
			contacts: 'Contacts',
			locations: 'Locations',
			projects: 'Projects',
			reference: 'Reference',
			questions_and_answers: 'Accordion',
			timeline: 'Timeline',
			text: 'Wysiwyg editor',
			button: 'Button',
			primary_bg_text: 'Primary background text',
			separator: 'Divider',
			modules: 'Static modules',

		};
		const blockTypesPage = {
			header: 'Header',
			header2: 'Background text',
			photo_text: 'Image + text',
			photo_text2: 'Image + text from builder',
			solo_image:	'Solo image',
			tabs: 'Tabs',
			milestones: 'Milestones',
			tiles: 'Tiles',
			documents: 'Documents',
			contacts: 'Contacts',
			locations: 'Locations',
			projects: 'Projects',
			reference: 'Reference',
			questions_and_answers: 'Accordion',
			timeline: 'Timeline',
			text: 'Wysiwyg editor',
			button: 'Button',
			primary_bg_text: 'Primary background text',
			separator: 'Divider',
			modules: 'Static modules',
		};
		const blockTypesTabs = {
			header: 'Header',
			header2: 'Background text',
			photo_text: 'Image + text',
			photo_text2: 'Image + text from builder',
			solo_image:	'Solo image',
			milestones: 'Milestones',
			tiles: 'Tiles',
			documents: 'Documents',
			contacts: 'Contacts',
			locations: 'Locations',
			projects: 'Projects',
			reference: 'Reference',
			text: 'Wysiwyg editor',
			button: 'Button',
			primary_bg_text: 'Primary background text',
			separator: 'Divider',
			modules: 'Static modules',
		};
		const blockTypes = {
			...blockTypesHomepage,
			...blockTypesPage,
			...blockTypesTabs
		};

		const helpers = {
			photoVideoMutex: function($photo, $video) {
				let $photoInput = $photo.find(':input');
				let $videoInput = $video.find(':input');

				$photoInput.data('origNetteRules', $photoInput.attr('data-nette-rules'));
				$videoInput.data('origNetteRules', $videoInput.attr('data-nette-rules'));

				let updateValidation = function(validate) {
					$photoInput.attr('data-nette-rules', $videoInput.val() === '[]' ? $photoInput.data('origNetteRules') : '[]').trigger('change');
					$videoInput.attr('data-nette-rules', $photoInput.val() === '[]' ? $videoInput.data('origNetteRules') : '[]').trigger('change');
				};

				let idle = true;
				$photoInput.on('change', function() {
					if (idle) {
						idle = false;
						$video.find('a.videopicker-remove').click(); // photo picked => remove video
						updateValidation();
						idle = true;
					}
				});
				$videoInput.on('change', function() {
					if (idle) {
						idle = false;
						$photo.find('a.photopicker-remove').click(); // video picked => remove photo
						updateValidation();
						idle = true;
					}
				});

				updateValidation();
			}
		};

		// noinspection JSUnusedGlobalSymbols
		const blockFactory = {
			// page
			header: function(data) {
				let $block = templates.createBlock(data);
				let $bgType, $overlay, $photo, $video, $buttonText, $buttonTarget, $buttonLink, $buttonColor, $icon;

				$block.find('.card-body')
					.append($bgType = formInputFactory.select(data, 'bgType', 'Type', {photo: 'Photo', video: 'Video'}))
					.append(formInputFactory.select(data, 'smallerPadding', 'Smaller top/bottom padding', {off: 'Off', on: 'On'}))
					.append($overlay = formInputFactory.select(data, 'overlay', 'Overlay', {off: 'Off', on: 'On', bw: 'Black and white', black: 'Black', primary: 'Primary'}))
					.append($photo = formInputFactory.photo(data, 'photo', 'Photo background', 1))
					.append($video = formInputFactory.video(data, 'video', 'Video background', 1))
					.append($photoHead = formInputFactory.photo(data, 'photoHead', 'Logo', 1))
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append(formInputFactory.wysiwyg(data, 'perex', 'Perex'))
					.append($buttonText = formInputFactory.text(data, 'buttonText', 'Button &ndash; text'))
					.append($buttonLink = formInputFactory.text(data, 'buttonLink', 'Button &ndash; link', ['url']))
					.append($buttonTarget = formInputFactory.select(data, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}))
					.append($buttonColor = formInputFactory.select(data, 'buttonColor', 'Button &ndash; Color', {'white-black': 'white', black: 'Black', primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary'}))
					.append($icon = formInputFactory.textarea(data, 'icon', 'Button &ndash; Icon in SVG'))
					.append(formInputFactory.video(data, 'videoEmbed', 'Video embeded modal', 1));

				$icon.append(`
					<div class="col-sm-10 offset-sm-2 lh-3 py-1">
						<small class="help-block">
							Open <a href="https://fontawesome.com/" target="_blank">https://fontawesome.com/</a>,
							1. find the icon,
							2. click on svg,
							3. copy the contents into the text area
						</small>
					</div>
				`);

				$bgType.find('select').on('change', function() {
					$photo.attr('hidden', this.value !== 'photo');
					$video.attr('hidden', this.value !== 'video');
				}).trigger('change');

				return $block;
			},
			header2: function(data) {
				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data);
				let $overlay, $perex, $loga, $buttonText, $buttonTarget, $buttonColor, $buttonLink, $sectionLink;

				$block.find('.card-body')
					.append($overlay = formInputFactory.select(data, 'overlay', 'Overlay', {off: 'Off', on: 'On', bw: 'Black and white', header: 'Green header background'}))
					.append(formInputFactory.photo(data, 'photoBg', 'Photo background', 1))
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append($perex = formInputFactory.wysiwyg(data, 'perex', 'Perex'))
					.append(formInputFactory.select(data, 'textColor', 'Text &ndash; Color', {white: 'white', black: 'Black', primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary'}))
					.append(formInputFactory.select(data, 'textwidth', 'Text &ndash; Width', {normal: 'Normal', full: 'Full'}))
					.append(formInputFactory.photo(data, 'photoSide', 'Photo Side logo', 1))
					.append($sectionLink = formInputFactory.text(data, 'sectionLink', 'Section link', ['url']))
					.append($buttonText = formInputFactory.text(data, 'buttonText', 'Button &ndash; text'))
					.append($buttonLink = formInputFactory.text(data, 'buttonLink', 'Button &ndash; link', ['url']))
					.append($buttonTarget = formInputFactory.select(data, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}))
					.append($buttonColor = formInputFactory.select(data, 'buttonColor', 'Button &ndash; Color', {'white-black': 'white', black: 'Black', primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary'}))
					.append($loga = formInputFactory.dynamicItems(data, 'items', 'Logos', ($body, itemData) => {
						$body
							.append(formInputFactory.photo(itemData, 'logo', 'Logo', 1))
							.append(formInputFactory.text(itemData, 'link', 'Link', ['url', 'required']));
					}))
					.end();

					$overlay.find('select').on('change', function() {
						$perex.attr('hidden', this.value == 'header');
						$loga.attr('hidden', this.value == 'header');
						$buttonText.attr('hidden', this.value == 'header');
						$buttonLink.attr('hidden', this.value == 'header');
						$buttonTarget.attr('hidden', this.value == 'header');
						$buttonColor.attr('hidden', this.value == 'header');
						$sectionLink.attr('hidden', this.value !== 'header');
					}).trigger('change');

				return $block;
			},
			photo_text: function(data) {
				let $block = templates.createBlock(data);
				let $photo;

				$block.find('.card-body')

					.append(formInputFactory.select(data, 'photoPosition', 'Photo placement', {left: 'Left', right: 'Right'}))
					.append($photo = formInputFactory.photo(data, 'photo', 'Introductory photo', 1))
					.append(formInputFactory.select(data, 'colorBg', 'Background Color', {primary: 'Primary Color', white: 'White color', black: 'Black color'}))
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append(formInputFactory.wysiwyg(data, 'perex', 'Perex'))
					.append(formInputFactory.text(data, 'buttonText', 'Button &ndash; text'))
					.append(formInputFactory.text(data, 'buttonLink', 'Button &ndash; link', ['url']))
					.append(formInputFactory.select(data, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}));

				//helpers.photoVideoMutex($photo);

				return $block;
			},
			photo_text2: function(data) {
				data.itemsOne ||= [{}]; // initially show one
				data.itemsTwo ||= [{}]; // initially show one

				let $block = templates.createBlock(data);

				$block.find('.card-body')
					.append(formInputFactory.select(data, 'photoPosition', 'Swap photo to the right', {left: 'No', right: 'Yes'}))
					.append(formInputFactory.photo(data, 'photo', 'Introductory photo', 1))
					.append(formInputFactory.text(data, 'headline1', 'Headline - left'))
					.append(formInputFactory.wysiwyg(data, 'perex1', 'Perex - left'))
					.append(formInputFactory.textarea(data, 'iconHeadline1', 'Icon title - left'))
					.append(formInputFactory.dynamicItems(data, 'itemsOne', 'Logos - left', ($body, itemData) => {
						$body
							.append(formInputFactory.photo(itemData, 'logo', 'Logo', 1))
							.append(formInputFactory.text(itemData, 'description', 'Description'));
					}))
					.append(formInputFactory.text(data, 'headline2', 'Headline - right'))
					.append(formInputFactory.wysiwyg(data, 'perex2', 'Perex - right'))
					.append(formInputFactory.textarea(data, 'iconHeadline2', 'Icon title - right'))
					.append(formInputFactory.dynamicItems(data, 'itemsTwo', 'Logos - right', ($body, itemData) => {
						$body
							.append(formInputFactory.photo(itemData, 'logo', 'Logo', 1))
							.append(formInputFactory.text(itemData, 'description', 'Description'));
					}))
					.end();
				return $block;
			},
			solo_image: function(data) {
				let $block = templates.createBlock(data);
				let $photo;

				$block.find('.card-body')
					.append($photo = formInputFactory.photo(data, 'photo', 'Photo', 1))
					.append(formInputFactory.select(data, 'photoAlign', 'Align of photo', {left: 'Left', center: 'Center'}))
					.append(formInputFactory.text(data, 'width', 'Width of the photo (%)'))
					;

				return $block;
			},
			/*photogallery: function(data) {
				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.photo(data, 'photos', 'Fotografie'))
					.end();
			},
			multiphotogallery: function(data) {
				data.items ||= [{}]; // initially show one

				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.dynamicItems(data, 'items', 'Položky', ($body, itemData) => {
						$body
							.append(formInputFactory.text(itemData, 'name', 'Název galerie'))
							.append(formInputFactory.photo(itemData, 'photos', 'Fotografie'));
					}))
					.end();
			},
			videogallery: function(data) {
				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append(formInputFactory.select(data, 'columnsCount', 'Počet sloupců', {1: '1', 2: '2', 3: '3', 4: '4'}))
					.append(formInputFactory.video(data, 'videos', 'Videa'))
					.end();
			},*/
			questions_and_answers: function(data) {
				data.items ||= [{}]; // initially show one

				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						$body
							.append(formInputFactory.text(itemData, 'question', 'Question'))
							.append(formInputFactory.wysiwyg(itemData, 'answer', 'Answer'));
					}))
					.end();
			},

			timeline: function(data) {
				data.items ||= [{}]; // initially show one

				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.text(data, 'headline', 'Headline'))
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						$body
							.append(formInputFactory.select(itemData, 'color', 'Color', {primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary', black: 'Black', white: 'White'}))
							.append($type = formInputFactory.select(itemData, 'type', 'Circle type', {text: 'Text', icon: 'Icon SVG', image: 'Image'}))
							.append($icon = formInputFactory.textarea(itemData, 'icon', 'Icon in SVG'))
							.append($image = formInputFactory.photo(itemData, 'image', 'Image', 1))
							.append($text1 = formInputFactory.text(itemData, 'text1', 'Circle Text'))
							.append(formInputFactory.select(itemData, 'textAlign', 'Text align', {center: 'Center', start: 'Left', right: 'Right'}))
							.append(formInputFactory.text(itemData, 'text', 'Text'));

							$icon.append(`
								<div class="col-sm-10 offset-sm-2 lh-3 py-1">
									<small class="help-block">
										Open <a href="https://fontawesome.com/" target="_blank">https://fontawesome.com/</a>,
										1. find the icon,
										2. click on svg,
										3. copy the contents into the text area
									</small>
								</div>
							`);

							$type.find('select').on('change', function() {
								$text1.attr('hidden', this.value !== 'text');
								$icon.attr('hidden', this.value !== 'icon');
								$image.attr('hidden', this.value !== 'image');
							}).trigger('change');
					}))
					.end();
			},
			tabs: function(data) {
				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data);
				$block.find('.card-body')
					.append(formInputFactory.select(data, 'orientation', 'Orientation', {vertical: 'Vertical', horizontal: 'Horizontal'}))
					.append(formInputFactory.select(data, 'color', 'Color', {primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary', black: 'Black'}))
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						let $type, $type2, $text, $text2, $icon;

						$body
							.append($type = formInputFactory.select(itemData, 'type', 'Type', {normal: 'Normal', big: 'Large text', icon: 'Icon + text', texts: 'Two texts'}))
							.append($type2 = formInputFactory.select(itemData, 'overColor', 'Tab Color', {same: "Same as main", primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary', black: 'Black'}))
							.append($icon = formInputFactory.textarea(itemData, 'icon', 'Icon in SVG'))
							.append($text = formInputFactory.text(itemData, 'text', 'Headline'))
							.append($text2 = formInputFactory.text(itemData, 'text2', 'Subheading'))
							.append(formInputFactory.pageBuilder(itemData, 'content', Object.keys(blockTypesTabs)));

						$icon.append(`
							<div class="col-sm-10 offset-sm-2 lh-3 py-1">
								<small class="help-block">
									Open <a href="https://fontawesome.com/" target="_blank">https://fontawesome.com/</a>,
									1. find the icon,
									2. click on svg,
									3. copy the contents into the text area
								</small>
							</div>
						`);
						
						$type.find('select').on('change', function() {
							$text2.attr('hidden', this.value !== 'texts' && this.value !== 'icon');
							$icon.attr('hidden', this.value !== 'icon');
						}).trigger('change');
					}))
					.end();

				return $block;
			},
			milestones: function(data) {
				data.items ||= [{}]; // initially show one

				return templates.createBlock(data)
					.find('.card-body')
					.append(formInputFactory.select(data, 'color', 'Background Color', {black: 'Black', primary: 'Primary', transparent: 'Transparent'}))
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						$body
							.append(formInputFactory.text(itemData, 'headline', 'Headline'))
							.append(formInputFactory.wysiwyg(itemData, 'perex', 'Perex'));
					}))
					.end();
			},
			tiles: function(data) {
				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data);

				

				$block.find('.card-body')
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						let $hover, $hoverColor, $loga, $overlay;
						itemData.items ||= [{}]; // initially show one

						$body
							.append(formInputFactory.photo(itemData, 'photo', 'Background Photo', 1))
							.append($hover = formInputFactory.select(itemData, 'hover', 'Content on hover', {no: 'No', yes: 'Yes'}))
							.append($hoverColor = formInputFactory.select(itemData, 'hoverColor', 'Hover bg color', {primary: 'Primary', black: 'Black'}))
							.append($overlay = formInputFactory.select(itemData, 'overlay', 'Overlay', {yes: 'Black color', no: 'No', primary: 'Primary Color'}))
							.append(formInputFactory.select(itemData, 'size', 'Size', {4: '1/3', 8: '2/3', 12: 'Full width', 6: 'Half width'}))
							.append(formInputFactory.text(itemData, 'headline', 'Headline'))
							.append(formInputFactory.wysiwyg(itemData, 'perex', 'Perex'))
							.append(formInputFactory.text(itemData, 'buttonText', 'Button &ndash; text'))
							.append(formInputFactory.text(itemData, 'buttonLink', 'Button &ndash; link', ['url']))
							.append(formInputFactory.select(itemData, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}))

							.append($loga = formInputFactory.dynamicItems(itemData, 'items', 'Logos', ($body, itemData2) => {
								$body
									.append(formInputFactory.photo(itemData2, 'logo', 'Logo', 1))
									.append(formInputFactory.text(itemData2, 'link', 'Link', ['url']));
							}));

							$hover.find('select').on('change', function() {
								$hoverColor.attr('hidden', this.value == 'no');
								$loga.attr('hidden', this.value == 'no');
								$overlay.attr('hidden', this.value == 'yes');
							}).trigger('change');
					}))
					.end();

					

				return $block;
			},
			contacts: function(data) {
				if($pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id") !== null){
					var dataIdValue = $pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id");
				}else{
					var dataIdValue = $pagebuilder.closest('.tab-pane')[0].getAttribute("data-id");
				}

				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data)
									.find('.card-body')
									.append(formInputFactory.dynamicItems(data, 'items', 'Contacts', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append(formInputFactory.select(itemData, 'type', 'Type', {light: 'Light', heavy: 'Primary color'}))
											.append(formInputFactory.text(itemData, 'text', 'Headline'))
											.append($select = formInputFactory.select(itemData, 'contact', 'Person', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/employer/default/get-employers";
											let initUrl = ajaxUrl + '?languageId=' + dataIdValue;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
										
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.items[$cardBody] !== undefined && id == data.items[$cardBody]['contact']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.end();
			
				return $block;
			},
			documents: function(data) {

				data.itemsOne ||= [{}]; // initially show one
				data.itemsTwo ||= [{}]; // initially show one

				let $sections, $titleOne, $titleTwo, $sectionTwo;

				let $block = templates.createBlock(data)
									.find('.card-body')
									.append($sections = formInputFactory.select(data, 'section', 'Split', {full: 'Full', half: 'Half / Half'}))	
									.append($titleOne = formInputFactory.text(data, 'headlineOne', 'Headline'))
									.append(formInputFactory.dynamicItems(data, 'itemsOne', 'Documents', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append(formInputFactory.select(itemData, 'color', 'Color', {grey: 'Grey', primary: 'Primary'}))
											.append($select = formInputFactory.select(itemData, 'document', 'Document', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/document/default/get-documents";
											let initUrl = ajaxUrl;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
										
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.itemsOne[$cardBody] !== undefined && id == data.itemsOne[$cardBody]['document']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.append($titleTwo = formInputFactory.text(data, 'headlineTwo', 'Headline - right'))
									.append($sectionTwo = formInputFactory.dynamicItems(data, 'itemsTwo', 'Documents - right', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append(formInputFactory.select(itemData, 'color', 'Color', {grey: 'Grey', primary: 'Primary'}))
											.append($select = formInputFactory.select(itemData, 'document', 'Document', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/document/default/get-documents";
											let initUrl = ajaxUrl;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
										
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.itemsTwo[$cardBody] !== undefined && id == data.itemsTwo[$cardBody]['document']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.end();

									$sections.find('select').on('change', function() {
										$sectionTwo.attr('hidden', this.value !== 'half');
										$titleTwo.attr('hidden', this.value !== 'half');
									}).trigger('change');
			
				return $block;
			},
			locations: function(data) {
				if($pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id") !== null){
					var dataIdValue = $pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id");
				}else{
					var dataIdValue = $pagebuilder.closest('.tab-pane')[0].getAttribute("data-id");
				}

				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data)
									.find('.card-body')
									.append(formInputFactory.dynamicItems(data, 'items', 'Locations', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append(formInputFactory.select(itemData, 'type', 'Type', {light: 'Light', heavy: 'Primary color'}))
											.append($select = formInputFactory.select(itemData, 'location', 'Location', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/location/default/get-locations";
											let initUrl = ajaxUrl + '?languageId=' + dataIdValue;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
										
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.items[$cardBody] !== undefined && id == data.items[$cardBody]['location']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.end();
			
				return $block;
			},
			projects: function(data) {
				if($pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id") !== null){
					var dataIdValue = $pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id");
				}else{
					var dataIdValue = $pagebuilder.closest('.tab-pane')[0].getAttribute("data-id");
				}

				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data)
									.find('.card-body')
									.append(formInputFactory.dynamicItems(data, 'items', 'Projects', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append($select = formInputFactory.select(itemData, 'project', 'Project', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/project/default/get-projects";
											let initUrl = ajaxUrl + '?languageId=' + dataIdValue;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
										
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.items[$cardBody] !== undefined && id == data.items[$cardBody]['project']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.end();
			
				return $block;
			},
			reference: function(data) {
				if($pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id") !== null){
					var dataIdValue = $pagebuilder.closest('.section-wrapper')[0].getAttribute("data-id");
				}else{
					var dataIdValue = $pagebuilder.closest('.tab-pane')[0].getAttribute("data-id");
				}

				data.items ||= [{}]; // initially show one

				let $block = templates.createBlock(data)
									.find('.card-body')
									.append(formInputFactory.select(data, 'swiper', 'Slider function', {no: 'No', yes: 'Yes'}))
									.append(formInputFactory.dynamicItems(data, 'items', 'References', ($body, itemData) => {
										let $select, $cardBody;
										$body
											.append($select = formInputFactory.select(itemData, 'reference', 'Reference', []))

											$select = $select.find('select');
											$cardBody = $select.closest('.card-body')[0].getAttribute("data-id");

											let ajaxUrl = "/admin/reference/default/get-references";
											let initUrl = ajaxUrl + '?languageId=' + dataIdValue;
										
											$select.attr({
												'data-tags-sortable': 'true',
											});
											
											$.get(initUrl, function (response) {
												$select.val(null).empty();
												Object.entries(response).forEach(([id, value]) => {
													if(data.items[$cardBody] !== undefined && id == data.items[$cardBody]['reference']){
														$select.append(new Option(value, id, true, true));
													}else{
														$select.append(new Option(value, id));
													}
												});

												$select.trigger('change');
											});
										}
									))
									.end();
			
				return $block;
			},
			text: function(data) {
				let $block = templates.createBlock(data);
				let $type, $text2;

				$block.find('.card-body')
					.append($type = formInputFactory.select(data, 'formatType', 'Type', {normal: 'Full', half: 'Half / Half', big: 'Large text', bigPrimary: 'Large green text'}))
					.append(formInputFactory.select(data, 'align', 'Center alignment', {off: 'Off', on: 'On'}))
					.append(formInputFactory.wysiwyg(data, 'text', 'Text'))
					.append($text2 = formInputFactory.wysiwyg(data, 'text2', 'Text - right'))
					.end();

				$type.find('select').on('change', function() {
					$text2.attr('hidden', this.value == 'normal' || this.value == 'big' || this.value == 'bigPrimary');
				}).trigger('change');

				return $block;
			},
			button: function(data) {
				let $block = templates.createBlock(data);

				$block.find('.card-body')
					.append(formInputFactory.select(data, 'buttonType', 'Type', {'primary': 'Primary background', 'outline-primary': 'Primary outline', 'secondary': 'Secondary background', 'outline-secondary': 'Secondary outline', 'black': 'Black background', 'white-primary': 'White background, Primary text', 'white-black': 'White background, Black text',}))
					.append(formInputFactory.select(data, 'align', 'Center alignment', {off: 'Off', on: 'On'}))
					.append(formInputFactory.select(data, 'target', 'Open in new window', {off: 'Off', on: 'On'}))
					.append(formInputFactory.text(data, 'buttonText', 'Button &ndash; text'))
					.append(formInputFactory.text(data, 'buttonLink', 'Button &ndash; link', ['url']))
					.append(formInputFactory.select(data, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}))
					.end();

				return $block;
			},
			primary_bg_text: function(data) {
				data.items ||= [{}]; // initially show one
				let $block = templates.createBlock(data);
				let $type, $text2;

				$block.find('.card-body')
					.append(formInputFactory.dynamicItems(data, 'items', 'Items', ($body, itemData) => {
						let $type, $text2;

						$body
							.append($type = formInputFactory.select(itemData, 'formatType', 'Type', {normal: 'Full', half: 'Half / Half'}))
							.append(formInputFactory.select(itemData, 'bgType', 'Background type', {light: 'Light', heavy: 'Primary color'}))
							.append(formInputFactory.text(itemData, 'headline', 'Headline'))
							.append(formInputFactory.wysiwyg(itemData, 'text', 'Text'))
							.append($text2 = formInputFactory.wysiwyg(itemData, 'text2', 'Text - right'))

						$type.find('select').on('change', function() {
							$text2.attr('hidden', this.value == 'normal');
						}).trigger('change');
					}))
					.end();

				return $block;
			},
			separator: function(data) {
				let $sizes, $height;
				let $block = templates.createBlock(data)
					.find('.card-body')
					.append($sizes = formInputFactory.select(data, 'sizes', 'Size', {2: '8px', 4: '16px', 6: '24px', 8: '32px', 10: '40px', custom: 'Custom'}))
					.append($height =formInputFactory.text(data, 'height', 'Height in px', [['intRange', -200, 200]]))
					.end();

				$sizes.find('select').on('change', function() {
					$height.attr('hidden', this.value !== 'custom');
				}).trigger('change');

				return $block;
			},
			modules: function(data) {
				let $block = templates.createBlock(data);
				let $type, $text, $image, $headline, $headline2, $butText, $butLink , $butTarget;

				$block.find('.card-body')
					.append($type = formInputFactory.select(data, 'item', 'Module', {contact: 'Contact', question: 'Ehopi contact', map: 'Map', carrer: 'Carrer', blog: 'Blog'}))
					.append($headline = formInputFactory.text(data, 'headline', 'Headline'))
					.append($headline2 = formInputFactory.text(data, 'headline2', 'Headline in center'))
					.append($text = formInputFactory.textarea(data, 'perex', 'Perex'))
					.append($image = formInputFactory.photo(data, 'photo', 'Side photo', 1))
					.append($butText = formInputFactory.text(data, 'buttonText', 'Button &ndash; text'))
					.append($butLink = formInputFactory.text(data, 'buttonLink', 'Button &ndash; link', ['url']))
					.append($butTarget = formInputFactory.select(data, 'buttonTarget', 'Button &ndash; URL external', {off: 'Off', on: 'On'}))
					.end();

				$type.find('select').on('change', function() {
					$text.attr('hidden', this.value !== 'map' || this.value !== 'question');
					$image.attr('hidden', this.value !== 'contact');
					$butText.attr('hidden', this.value !== 'carrer');
					$headline2.attr('hidden', this.value !== 'carrer');
					$butLink.attr('hidden', this.value !== 'carrer');
					$butTarget.attr('hidden', this.value !== 'carrer');
				}).trigger('change');

				return $block;
			},
		};


		// component initialization
		const $pagebuilder = $(this);

		// prepare HTML parts
		const $component = $(templates.base);
		const $blocks = $(templates.blocks);
		const $buttons = $(templates.buttons);

		$component.append($blocks, $buttons);

		// component controller
		const controller = {
			addBlock: function(data) {
				if (!('type' in data && data.type in blockFactory)) {
					console.log(data);
					alert('Error: unknown visual page editor block type');
					return null;
				}

				let $block = blockFactory[data.type](data);

				$block.find('a[data-action="remove"]:first').click(function() {
					window.uiHandlers.unbind($block);
					$block.remove();
					$blocks.sortable('refresh');
					return false;
				});

				$block.find('a[data-toggle="collapse"]:first').click(function() {
					if($(this).attr("aria-expanded") == "false"){
						$block.find('div[data-pagebuilder-input="expanded"]:first').find('input').val(1);
					}else{
						$block.find('div[data-pagebuilder-input="expanded"]:first').find('input').val(0);
					}
				});

				$blocks.append($block);
				$blocks.sortable('refresh');

				window.uiHandlers.bind($block);

				return $block;
			},

			getData: function() {
				let data = [];
				$blocks.find('> *').each(function() {
					data.push($(this).data('getData')());
				});

				return data;
			},

			setData: function(data) {
				window.uiHandlers.unbind($blocks);
				$blocks.html('');
				data.forEach(blockData => controller.addBlock(blockData));
			},

			saveInputData: function() {
				$pagebuilder.val(JSON.stringify(controller.getData()));
			}
		};


		// initialize HTML parts
		$blocks.sortable({
			axis: 'y',
			tolerance: 'pointer',
			helper: 'clone', // prevents page scroll-jumping because of scrollable height change
			handle: `.${componentId}-handle`,
			containment: $component,
			customHeightFix: true,
			distance: 4,
			cancel: 'input, textarea, button, select, option, .sortable-handle-ignore, [data-action]'
		});


		// add buttons
		let configBlocks = $pagebuilder.data('blocks') || [];

		if (configBlocks === 'homepage') {
			configBlocks = Object.keys(blockTypesHomepage);
		} else if (configBlocks === 'page') {
			configBlocks = Object.keys(blockTypesPage);
		} else if (configBlocks === 'all') {
			configBlocks = Object.keys(blockTypes);
		}

		configBlocks.forEach((type) => {
			$buttons.append(templates.createButton(type)).append(' ');
		});

		$buttons.find('a[data-action="add"]').click(function() {
			let $block = controller.addBlock({type: $(this).data('type')});
			if ($block) {
				$block.find('a[data-toggle="collapse"]:first').click();
			}
			$(this).blur();
			return false;
		});

		// insert into page
		$pagebuilder.next().replaceWith($component);

		// add controller reference to input
		$pagebuilder.data('pageBuilder', controller);

		// save data on form submit (only when non-nested)
		$pagebuilder.filter('[name]').closest('form').on('submit', controller.saveInputData);

		// load data from input value
		let data;
		try {
			data = JSON.parse($pagebuilder.val() || '[]');
			controller.setData(Array.isArray(data) ? data : []);
		} catch (e) {
			console.log(e);
		}
	};

	// component binder into the form/page (called every time when handlers are bound .e. after ajax calls)
	window.uiHandlers.onLoad(function() {
		$('input[data-jscomponent="pageBuilder"]', this).each(initComponent);

		// copy button
		$('[data-copypagebuilder]', this).click(function() {
			let $btn = $(this);
			let $currentTab = $btn.closest('.tab-pane');

			if (!$btn.attr('data-toggle')) {
				$btn.attr({'data-toggle': 'dropdown', 'aria-haspopup': 'true', 'aria-expanded': 'false'});
				$btn.after($('<div class="dropdown-menu" aria-labelledby="' + $btn.attr('id') + '"></div>'));
			}

			let $dropdown = $btn.siblings('.dropdown-menu');
			let $otherTabs = $currentTab.siblings('.tab-pane:not([hidden])');

			$dropdown.empty();

			// rebuild dropdown
			$otherTabs.each(function() {
				let $tab = $(this);
				let lang = $tab.find('[data-copypagebuilder]').data('copypagebuilder');

				let $copyBtn = $('<a class="dropdown-item tx-13" href="#"></a>');
				$copyBtn.text(lang);
				$copyBtn.appendTo($dropdown);

				$copyBtn.click(function() {
					// controllers
					let src = $tab.find('[data-jscomponent="pageBuilder"]').data('pageBuilder');
					let dst = $currentTab.find('[data-jscomponent="pageBuilder"]').data('pageBuilder');

					if (dst.getData().length === 0 || confirm('Copying will delete the existing content you see above. Continue?')) {
						dst.setData(src.getData());
					}
				});
			});
		});
	});

})();
