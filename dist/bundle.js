(function(global, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		define(factory);
	} else {
		global.AnyButton = factory();
	}
})(this, function() {

	// Основной класс AnyButton
	class AnyButton {
		constructor({data, config, api, readOnly}) {
			this.api = api;
			this.readOnly = readOnly;

			// Элементы DOM
			this.nodes = {
				wrapper: null,
				container: null,
				inputHolder: null,
				anyButtonHolder: null,
				textInput: null,
				selectInputLinkType: null,
				selectInput: null,
				registButton: null,
				anyButton: null
			};

			// Опции для select
			this.selectProductOptions = config.selectProductOptions || [];
			this.selectCategoryOptions = config.selectCategoryOptions || [];
			this.selectLinkTypeOptions = config.selectLinkTypeOptions || [];
			this.selectedOption = data.selectedOption || '';

			// CSS классы
			this.CSS = {
				baseClass: 'cdx-block',
				hide: 'hide',
				btn: 'anyButton__btn',
				container: 'anyButtonContainer',
				input: 'anyButtonContainer__input',
				inputHolder: 'anyButtonContainer__inputHolder',
				inputText: 'anyButtonContainer__input--text',
				inputSelect: 'anyButtonContainer__input--select',
				registButton: 'anyButtonContainer__registerButton',
				anyButtonHolder: 'anyButtonContainer__anyButtonHolder',
				btnColor: 'anyButton__btn--default'
			};

			// Инъекция CSS стилей
			this.injectStyles();

			this.data = {
				text: "",
				selectedOption: ""
			};

			if (data) {
				this.data = data;
			}
		}

		// Создание DOM элемента
		make(tagName, classNames = null, attributes = {}) {
			const el = document.createElement(tagName);

			if (classNames) {
				if (Array.isArray(classNames)) {
					classNames.forEach(className => {
						if (typeof className === 'string') {
							el.classList.add(className);
						}
					});
				} else if (typeof classNames === 'string') {
					el.classList.add(classNames);
				}
			}

			Object.keys(attributes).forEach(attrName => {
				el[attrName] = attributes[attrName];
			});

			return el;
		}

		// Валидация
		validate() {
			return this.data.text.trim() !== "";
		}

		// Создание контейнера для полей ввода
		makeInputHolder() {
			const inputHolder = this.make('div', this.CSS.inputHolder)
			const selectCategoryOptions = this.selectCategoryOptions
			const selectProductOptions = this.selectProductOptions

			// Select поле
			this.nodes.selectInputLinkType = this.make('select',
				['cdx-input', this.CSS.input, this.CSS.inputSelect],
				{
					disabled: this.readOnly
				}
			);

			// Текстовое поле
			this.nodes.textInput = this.make('div',
				['cdx-input', this.CSS.input, this.CSS.inputText],
				{
					contentEditable: !this.readOnly,
					'data-placeholder': this.api.i18n.t('Button Text')
				}
			);

			// Select поле
			this.nodes.selectInput = this.make('select',
				['cdx-input', this.CSS.input, this.CSS.inputSelect],
				{
					disabled: this.readOnly
				}
			);

			// Добавляем варианты ссылок в select
			this.selectLinkTypeOptions.forEach(option => {
				const optionEl = document.createElement('option');
				optionEl.value = option.value;
				optionEl.textContent = option.label || option.value;
				this.nodes.selectInputLinkType.appendChild(optionEl);
			});

			// Добавляем варианты в select
			addSelectOptions(this, selectCategoryOptions);

			function addSelectOptions(a, b) {
				a.nodes.selectInput.length = 0;

				b.forEach(option => {
					const optionEl = document.createElement('option');
					optionEl.value = option.value;
					optionEl.textContent = option.label || option.value;
					a.nodes.selectInput.appendChild(optionEl);
				});
			}

			// Обработчик select-a типа сссылки
			this.nodes.selectInputLinkType.addEventListener('change', () => {
				if(this.nodes.selectInputLinkType.value == "category") {
					addSelectOptions(this, selectCategoryOptions);
				} else {
					addSelectOptions(this, selectProductOptions);
				}
			});

			// Кнопка подтверждения
			this.nodes.registButton = this.make('button',
				['cdx-button', this.CSS.registButton],
				{
					type: 'button'
				}
			);
			this.nodes.registButton.textContent = this.api.i18n.t('Set');

			// Обработчик кнопки
			this.nodes.registButton.addEventListener('click', () => {
				if(this.nodes.textInput.textContent.trim() !== "") {
					this.data = {
						text: this.nodes.textInput.textContent,
						selectedOption: this.nodes.selectInput.value
					}

					this.show(AnyButton.STATE.VIEW);
				} else {
					this.nodes.textInput.style = "border: 1px solid red";
				}
			});

			// Добавляем элементы в контейнер
			inputHolder.appendChild(this.nodes.selectInputLinkType);
			inputHolder.appendChild(this.nodes.textInput);
			inputHolder.appendChild(this.nodes.selectInput);
			inputHolder.appendChild(this.nodes.registButton);

			return inputHolder;
		}

		// Создание контейнера для отображения кнопки
		makeAnyButtonHolder() {
			const holder = this.make('div', [this.CSS.hide, this.CSS.anyButtonHolder]);
			this.nodes.anyButton = this.make('div', [this.CSS.btn, this.CSS.btnColor]);
			holder.appendChild(this.nodes.anyButton);
			return holder;
		}

		// Инициализация данных
		init() {
			this.nodes.textInput.textContent = this.data.text;
			this.nodes.selectInputLinkType.value = this.data.text;
			if (this.data.selectedOption) {
				this.nodes.selectInput.value = this.data.selectedOption;
			}
		}

		// Переключение между режимами редактирования и просмотра
		show(state) {
			this.selectedOption = this.nodes.selectInput.value;
			this.nodes.anyButton.textContent = `${this.data.text} (${this.selectedOption})`;

			if (state === AnyButton.STATE.EDIT) {
				this.nodes.inputHolder.classList.remove(this.CSS.hide);
				this.nodes.anyButtonHolder.classList.add(this.CSS.hide);
			} else {
				this.nodes.inputHolder.classList.add(this.CSS.hide);
				this.nodes.anyButtonHolder.classList.remove(this.CSS.hide);
			}
		}

		// Рендер основного элемента
		render() {
			this.nodes.wrapper = this.make('div', this.CSS.baseClass);
			this.nodes.container = this.make('div', this.CSS.container);

			this.nodes.inputHolder = this.makeInputHolder();
			this.nodes.anyButtonHolder = this.makeAnyButtonHolder();

			this.nodes.container.appendChild(this.nodes.inputHolder);
			this.nodes.container.appendChild(this.nodes.anyButtonHolder);

			if (this.data.text) {
				this.init();
				this.show(AnyButton.STATE.VIEW);
			}

			this.nodes.wrapper.appendChild(this.nodes.container);
			return this.nodes.wrapper;
		}

		// Сохранение данных
		save() {
			return {
				text: this.data.text,
				selectedOption: this.selectedOption
			};
		}

		// Настройки инструмента
		renderSettings() {
			return [{
				icon: '<svg>...</svg>',
				label: this.api.i18n.t('Edit'),
				name: 'edit',
				onActivate: () => this.show(AnyButton.STATE.EDIT)
			}];
		}

		// Геттер для данных
		get data() {
			return this._data;
		}

		// Сеттер для данных
		set data(data) {
			this._data = {
				text: this.api.sanitizer.clean(data.text || "", AnyButton.sanitize),
				selectedOption: data.selectedOption || ''
			};
		}

		injectStyles() {
			const style = document.createElement('style');
			style.textContent = `
      .anyButton__btn {
        display: inline-block;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.5;
        text-align: center;
        text-decoration: none;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid transparent;
        border-radius: 30px;
        transition: all 0.2s ease-in-out;
      }

      .anyButton__btn--default {
        color: #fff;
        background-color: #F47A44;
        border-color: transparent;
      }

      .anyButton__btn--default:hover {
        box-shadow: 0 0.2rem 1rem rgba(0, 0, 0, 0.25);
      }

      .anyButton__btn--gray {
        color: #fff;
        background-color: #6c757d;
        border-color: #6c757d;
      }

      .anyButton__btn--gray:hover {
        background-color: #5a6268;
        border-color: #545b62;
      }

      .anyButtonContainer__input--select {
        padding: 8px 12px;
        font-size: 14px;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: 4px;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        width: 100%;
        margin-bottom: 10px;
      }

      .anyButtonContainer__input--select:focus {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }

      .anyButtonContainer {
        position: relative;
        margin: 10px 0;
      }

      .anyButtonContainer__inputHolder > * {
        margin-bottom: 10px;
      }

      .anyButtonContainer__registerButton {
        display: block;
        width: 100%;
      }

      .hide {
        display: none !important;
      }
    `;
			document.head.appendChild(style);
		}
	}

	// Статические свойства класса
	AnyButton.toolbox = {
		title: 'Button with Select',
		icon: '<svg>...</svg>'
	};

	AnyButton.STATE = {
		EDIT: 0,
		VIEW: 1
	};

	AnyButton.sanitize = {
		text: false
	};

	return AnyButton;
});