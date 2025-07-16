document.addEventListener('DOMContentLoaded', function () {
    // Инициализация кастомных select
    function initCustomSelects() {
        document.querySelectorAll('.custom-select').forEach(select => {
            const styled = select.querySelector('.select-styled');
            const options = select.querySelector('.select-options');
            const hiddenSelect = select.querySelector('.hidden-select');
            const arrow = select.querySelector('.select-arrow');

            // Создаем контейнер для тегов (если еще не существует)
            let tagsContainer = select.querySelector('.multi-select-tags');
            if (!tagsContainer) {
                tagsContainer = document.createElement('div');
                tagsContainer.className = 'multi-select-tags';
                select.appendChild(tagsContainer);
            }

            // Функция обновления тегов
            const updateTags = (selectedValues) => {
                tagsContainer.innerHTML = '';

                selectedValues.forEach(value => {
                    const text = select.querySelector(`.select-options li[data-value="${value}"]`).textContent;
                    const tag = document.createElement('div');
                    tag.className = 'multi-select-tag';
                    tag.innerHTML = `
                    ${text}
                    <button type="button" data-value="${value}">×</button>
                `;
                    tagsContainer.appendChild(tag);

                    // Обработчик удаления тега
                    tag.querySelector('button').addEventListener('click', function (e) {
                        e.stopPropagation();
                        const valueToRemove = this.getAttribute('data-value');
                        const li = select.querySelector(`.select-options li[data-value="${valueToRemove}"]`);
                        li.classList.remove('selected');

                        const newSelectedValues = selectedValues.filter(v => v !== valueToRemove);
                        updateTags(newSelectedValues);

                        // Обновляем скрытый select
                        hiddenSelect.innerHTML = '';
                        if (newSelectedValues.length === 0) {
                            hiddenSelect.appendChild(new Option('-- Выберите формат --', ''));
                            styled.querySelector('p').textContent = 'Выберите формат';
                            styled.classList.remove('has-selection');
                        } else {
                            newSelectedValues.forEach(opt => {
                                hiddenSelect.appendChild(new Option(
                                    select.querySelector(`.select-options li[data-value="${opt}"]`).textContent,
                                    opt
                                ));
                            });
                        }

                        // Обновляем дополнительные поля
                        if (select.id === 'tech-support-select') {
                            showTechExtraFields(newSelectedValues);
                        }
                    });
                });
            };

            styled.addEventListener('click', function (e) {
                e.stopPropagation();
                const isActive = options.style.display === 'block';

                // Закрываем другие select
                document.querySelectorAll('.select-options').forEach(other => {
                    if (other !== options) {
                        other.style.display = 'none';
                        other.closest('.custom-select')
                            .querySelector('.select-styled')
                            .classList.remove('active');
                        const otherArrow = other.closest('.custom-select').querySelector('.select-arrow');
                        if (otherArrow) otherArrow.style.transform = 'rotate(90deg)';
                    }
                });

                // Переключаем текущий select
                options.style.display = isActive ? 'none' : 'block';
                styled.classList.toggle('active', !isActive);

                if (arrow) {
                    arrow.style.transform = options.style.display === 'block'
                        ? 'rotate(270deg)'
                        : 'rotate(90deg)';
                }
            });

            // Обработка выбора пункта
            select.querySelectorAll('.select-options li').forEach(item => {
                item.addEventListener('click', function () {
                    const value = this.getAttribute('data-value');
                    const text = this.textContent;

                    if (select.id === 'tech-support-select') {
                        this.classList.toggle('selected');

                        const selectedOptions = Array.from(
                            select.querySelectorAll('.select-options li.selected')
                        ).map(li => li.getAttribute('data-value'));

                        // Обновляем скрытый select
                        hiddenSelect.innerHTML = '';
                        if (selectedOptions.length === 0) {
                            hiddenSelect.appendChild(new Option('-- Выберите формат --', ''));
                            styled.querySelector('p').textContent = 'Выберите формат';
                            styled.classList.remove('has-selection');
                        } else {
                            selectedOptions.forEach(opt => {
                                hiddenSelect.appendChild(new Option(
                                    select.querySelector(`.select-options li[data-value="${opt}"]`).textContent,
                                    opt
                                ));
                            });
                            styled.querySelector('p').textContent = `Выбрано ${selectedOptions.length}`;
                            styled.classList.add('has-selection');
                        }

                        // Обновляем теги
                        updateTags(selectedOptions);
                        showTechExtraFields(selectedOptions);
                    } else {
                        // Обычный select (не tech-support)
                        select.querySelectorAll('.select-options li').forEach(li => {
                            li.classList.remove('selected');
                        });
                        this.classList.add('selected');
                        styled.querySelector('p').textContent = text;
                        styled.classList.add('has-selection');
                        hiddenSelect.value = value;
                        options.style.display = 'none';
                        styled.classList.remove('active');
                        if (arrow) arrow.style.transform = 'rotate(90deg)';
                    }

                    // Скрываем ошибку
                    const errorElement = document.getElementById('error_' + hiddenSelect.id.replace(/-/g, '_'));
                    if (errorElement) errorElement.style.display = 'none';
                });
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', function () {
                document.querySelectorAll('.select-options').forEach(options => {
                    options.style.display = 'none';
                    const selectStyled = options.closest('.custom-select').querySelector('.select-styled');
                    selectStyled.classList.remove('active');
                    const arrow = selectStyled.querySelector('.select-arrow');
                    if (arrow) arrow.style.transform = 'rotate(90deg)';
                });
            });
        });
    }

    function showTechExtraFields(selectedValues) {
        const block = document.getElementById('tech-extra-fields');
        if (!block) return;

        // 1. Сохраняем текущие значения полей перед обновлением
        const savedValues = {};
        block.querySelectorAll('input').forEach(input => {
            savedValues[input.name] = input.value;
        });

        // 2. Очищаем блок и добавляем заголовок
        block.innerHTML = '<h3>Дополнительные параметры техподдержки</h3>';

        // 3. Если ничего не выбрано, скрываем блок
        if (selectedValues.length === 0) {
            block.classList.remove('visible');
            return;
        }

        // 4. Добавляем поля для выбранных опций
        selectedValues.forEach(value => {
            const text = document.querySelector(`#tech-support-select .select-options li[data-value="${value}"]`).textContent;

            // Только для laptop, microphone, radio_microphone
            if (['laptop', 'microphone', 'radio_microphone'].includes(value)) {
                let inputName, labelText;

                switch (value) {
                    case 'laptop':
                        inputName = 'laptop_count';
                        labelText = 'Количество ноутбуков:';
                        break;
                    case 'microphone':
                        inputName = 'microphone_count';
                        labelText = 'Количество микрофонов:';
                        break;
                    case 'radio_microphone':
                        inputName = 'radio_microphone_count';
                        labelText = 'Количество радиомикрофонов:';
                        break;
                }

                // 5. Добавляем поле и восстанавливаем значение, если оно было
                block.innerHTML += `
                <div class="form-block">
                    <label>${labelText}</label>
                    <input type="number" min="1" class="form-control" name="${inputName}" value="${savedValues[inputName] || ''}">
                </div>`;
            }
        });

        // 6. Показываем блок, если есть дополнительные поля
        const hasExtraFields = selectedValues.some(value =>
            ['laptop', 'microphone', 'radio_microphone'].includes(value)
        );

        if (hasExtraFields) {
            block.classList.add('visible');
        } else {
            block.classList.remove('visible');
        }
    }

    // Автоматическое увеличение textarea
    function initAutoResizeTextarea() {
        const textareas = document.querySelectorAll('textarea');

        textareas.forEach(textarea => {
            function adjustHeight() {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }

            adjustHeight();
            textarea.addEventListener('input', adjustHeight);
        });
    }

    function initCheckboxDropdowns() {
        document.querySelectorAll('.checkbox-dropdown').forEach(dropdown => {
            const toggle = dropdown.querySelector('.checkbox-dropdown-toggle');
            const menu = dropdown.querySelector('.checkbox-dropdown-menu');
            const items = dropdown.querySelectorAll('.checkbox-dropdown-item');
            const selectedText = dropdown.querySelector('.selected-text');
            const selectedCount = dropdown.querySelector('.selected-count');
            const checkboxError = document.getElementById('error_photo_video');
            const arrow = dropdown.querySelector('.ckbox-dropdown-arrow');

            // Функция обновления текста выбранных вариантов
            const updateSelectedText = () => {
                const selected = dropdown.querySelectorAll('.checkbox-dropdown-item.selected');
                const count = selected.length;

                if (count === 0) {
                    selectedText.textContent = 'Выберите необходимое';
                    selectedCount.textContent = '';
                } else if (count === 1) {
                    selectedText.textContent = 'Выбран вариант';
                    selectedCount.textContent = count;
                } else {
                    selectedText.textContent = 'Выбрано несколько вариантов';
                    selectedCount.textContent = count;
                }
            };

            // Обработчик клика по toggle
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                const isActive = menu.classList.contains('show');

                // Закрываем все другие меню
                document.querySelectorAll('.checkbox-dropdown-menu').forEach(m => {
                    if (m !== menu) {
                        m.classList.remove('show');
                        const otherToggle = m.closest('.checkbox-dropdown').querySelector('.checkbox-dropdown-toggle');
                        otherToggle.classList.remove('active');
                        const otherArrow = otherToggle.querySelector('.ckbox-dropdown-arrow');
                        if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                    }
                });

                // Переключаем текущее меню
                menu.classList.toggle('show', !isActive);
                toggle.classList.toggle('active', !isActive);

                // Поворачиваем стрелку
                if (arrow) {
                    arrow.style.transform = menu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
                }

                // Сбрасываем ошибку при открытии меню
                if (!isActive && checkboxError) {
                    checkboxError.style.display = 'none';
                }
            });

            // Обработчики для элементов меню
            items.forEach(item => {
                item.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    const isChecked = !checkbox.checked;

                    // Проверка условий
                    if (checkbox.value === 'without_foto_video' && isChecked) {
                        // Если выбрано "не предполагается", снимаем другие выборы
                        items.forEach(otherItem => {
                            if (otherItem !== item) {
                                const otherCheckbox = otherItem.querySelector('input[type="checkbox"]');
                                otherCheckbox.checked = false;
                                otherItem.classList.remove('selected');
                            }
                        });
                    } else if (isChecked && dropdown.querySelector('#without_foto_video:checked')) {
                        // Если уже выбрано "не предполагается", запрещаем другие выборы
                        toggle.style.borderColor = '#ef5350';
                        if (checkboxError) {
                            checkboxError.textContent = 'Нельзя выбрать другие варианты вместе с "не предполагается фото/видеосъемка"';
                            checkboxError.style.display = 'block';
                        }
                        return;
                    }

                    // Применяем изменения
                    checkbox.checked = isChecked;
                    item.classList.toggle('selected', isChecked);

                    // Сбрасываем ошибку
                    toggle.style.borderColor = '';
                    if (checkboxError) checkboxError.style.display = 'none';

                    updateSelectedText();
                });
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', function () {
                menu.classList.remove('show');
                toggle.classList.remove('active');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            });

            // Инициализация текста
            updateSelectedText();
        });
    }

    // Загрузка файлов
    const MAX_FILES = 20;
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadText = document.getElementById('uploadText');
    const filesList = document.getElementById('filesList');
    const statusText = document.getElementById('statusText');
    const errorText = document.getElementById('errorText');

    let currentFiles = [];

    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            errorText.style.display = 'none';
            uploadArea.classList.remove('error');

            const newFiles = Array.from(event.target.files);
            const totalFiles = currentFiles.length + newFiles.length;

            if (totalFiles > MAX_FILES) {
                uploadArea.classList.add('error');
                errorText.style.display = 'block';
                errorText.textContent = `Можно добавить только ${MAX_FILES - currentFiles.length} файлов`;
                return;
            }

            currentFiles = [...currentFiles, ...newFiles];
            updateFileInput();
            renderFilesList();
            updateStatusText();

            // Скрываем ошибку при загрузке файлов
            const fileError = document.getElementById('error_files');
            if (fileError) {
                hideFileError(fileError);
            }
        });
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        currentFiles.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }

    function renderFilesList() {
        filesList.innerHTML = '';

        currentFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const fileTypeIcon = document.createElement('span');
            fileTypeIcon.className = 'file-type-icon';
            fileTypeIcon.innerHTML = getFileIcon(file.name);

            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            fileName.title = file.name; // Добавляем title для отображения полного имени при наведении

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.title = 'Удалить';
            deleteBtn.innerHTML = `
                <svg class="delete-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            `;

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentFiles.splice(index, 1);
                updateFileInput();
                renderFilesList();
                updateStatusText();

                if (currentFiles.length === 0) {
                    filesList.style.display = 'none';
                    uploadArea.classList.remove('active');

                    // Показываем ошибку, если файлов нет и это обязательное поле
                    const fileError = document.getElementById('error_files');
                    if (fileError && fileError.style.display === 'block') {
                        showFileError(fileError, 'Необходимо загрузить сценарий мероприятия');
                    }
                }
            });

            fileInfo.appendChild(fileTypeIcon);
            fileInfo.appendChild(fileName);
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(deleteBtn);
            filesList.appendChild(fileItem);
        });

        filesList.style.display = currentFiles.length ? 'flex' : 'none';
        uploadArea.classList[currentFiles.length ? 'add' : 'remove']('active');
    }

    function updateStatusText() {
        uploadText.textContent = currentFiles.length ?
            `Сценарий` :
            'Загрузить сценарий';
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16"><path fill="currentColor" d="M10.8 0c.274 0 .537.113.726.312l3.2 3.428c.176.186.274.433.274.689V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zM14 5h-3.5a.5.5 0 0 1-.5-.5V1H2v14h12zm-8.5 7a.5.5 0 1 1 0-1h5a.5.5 0 1 1 0 1zm0-3a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1z"/></svg>',
            doc: '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16"><path fill="currentColor" d="M10.8 0c.274 0 .537.113.726.312l3.2 3.428c.176.186.274.433.274.689V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zM14 5h-3.5a.5.5 0 0 1-.5-.5V1H2v14h12zm-8.5 7a.5.5 0 1 1 0-1h5a.5.5 0 1 1 0 1zm0-3a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1z"/></svg>',
            docx: '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16"><path fill="currentColor" d="M10.8 0c.274 0 .537.113.726.312l3.2 3.428c.176.186.274.433.274.689V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zM14 5h-3.5a.5.5 0 0 1-.5-.5V1H2v14h12zm-8.5 7a.5.5 0 1 1 0-1h5a.5.5 0 1 1 0 1zm0-3a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1z"/></svg>',
            txt: '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16"><path fill="currentColor" d="M10.8 0c.274 0 .537.113.726.312l3.2 3.428c.176.186.274.433.274.689V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zM14 5h-3.5a.5.5 0 0 1-.5-.5V1H2v14h12zm-8.5 7a.5.5 0 1 1 0-1h5a.5.5 0 1 1 0 1zm0-3a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1z"/></svg>',
            default: '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16"><path fill="currentColor" d="M10.8 0c.274 0 .537.113.726.312l3.2 3.428c.176.186.274.433.274.689V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zM14 5h-3.5a.5.5 0 0 1-.5-.5V1H2v14h12zm-8.5 7a.5.5 0 1 1 0-1h5a.5.5 0 1 1 0 1zm0-3a.5.5 0 0 1 0-1h5a.5.5 0 1 1 0 1z"/></svg>'
        };
        return icons[ext] || icons.default;
    }

    function validateForm() {
        let isValid = true;
        const popup = document.getElementById('popup');

        // Скрываем все предыдущие сообщения об ошибках
        hideAllErrorMessages();
        if (popup) popup.style.display = 'none';

        // 1. Проверка текстовых полей
        const requiredFields = [
            { id: 'name_organization', name: 'Название организации', errorId: 'error_name_organization' },
            { id: 'phone_number_organization', name: 'Номер телефона организации', errorId: 'error_phone_organization' },
            { id: 'email_organization', name: 'Электронная почта', errorId: 'error_email_organization' },
            { id: 'responsible_person', name: 'Ответственное лицо', errorId: 'error_responsible_person' },
            { id: 'phone_responsible_person', name: 'Номер телефона ответственного лица', errorId: 'error_phone_responsible' },
            { id: 'contract_details', name: 'Реквизиты договора', errorId: 'error_contract_details' },
            { id: 'name_event', name: 'Наименование (тема) мероприятия', errorId: 'error_name_event' },
            { id: 'namber_people', name: 'Количество участников', errorId: 'error_namber_people' },
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            const errorElement = document.getElementById(field.errorId);

            if (!element || !element.value.trim()) {
                showFieldError(element, errorElement, `Поле "${field.name}" обязательно для заполнения`);
                if (isValid) {
                    showPopup(`Поле "${field.name}" обязательно для заполнения`, 'error');
                    isValid = false;
                }
            } else {
                hideFieldError(element, errorElement);
            }
        });

        // 2. Валидация email
        const emailField = document.getElementById('email_organization');
        const emailError = document.getElementById('error_email_organization');
        if (emailField && emailField.value.trim() && !validateEmail(emailField.value.trim())) {
            showFieldError(emailField, emailError, 'Укажите корректный email адрес');
            if (isValid) {
                showPopup('Укажите корректный email адрес', 'error');
                isValid = false;
            }
        }

        // 3. Валидация телефонов
        const phoneFields = [
            { id: 'phone_number_organization', errorId: 'error_phone_organization' },
            { id: 'phone_responsible_person', errorId: 'error_phone_responsible' }
        ];

        phoneFields.forEach(field => {
            const element = document.getElementById(field.id);
            const errorElement = document.getElementById(field.errorId);
            if (element && element.value.trim() && !validatePhone(element.value.trim())) {
                showFieldError(element, errorElement, 'Номер должен содержать минимум 10 цифр');
                if (isValid) {
                    showPopup('Номер телефона должен содержать минимум 10 цифр', 'error');
                    isValid = false;
                }
            }
        });

        // 4. Проверка выпадающих списков
        const requiredSelects = [
            { id: 'event-type', name: 'Формат проведения мероприятия', errorId: 'error_event_type' }
        ];

        requiredSelects.forEach(select => {
            const element = document.getElementById(select.id);
            const errorElement = document.getElementById(select.errorId);

            if (!element || !element.value) {
                showSelectError(element, errorElement, `Выберите "${select.name}"`);
                if (isValid) {
                    showPopup(`Выберите "${select.name}"`, 'error');
                    isValid = false;
                }
            } else {
                hideSelectError(element, errorElement);
            }
        });

        // 5. Проверка дат и времени
        const startDatetime = document.getElementById('start-datetime');
        const endDatetime = document.getElementById('end-datetime');
        const startDatetimeError = document.getElementById('error_start_datetime');
        const endDatetimeError = document.getElementById('error_end_datetime');
        const startRehearsal = document.getElementById('start-datetime-rehearsal');
        const endRehearsal = document.getElementById('end-datetime-rehearsal');
        const startRehearsalError = document.getElementById('error_start_datetime-rehearsal');
        const endRehearsalError = document.getElementById('error_end_datetime-rehearsal');

        if (startDatetime && !startDatetime.value) {
            showFieldError(startDatetime, startDatetimeError, 'Укажите дату и время начала');
            if (isValid) {
                showPopup('Укажите дату и время начала мероприятия', 'error');
                isValid = false;
            }
        }

        if (endDatetime && !endDatetime.value) {
            showFieldError(endDatetime, endDatetimeError, 'Укажите дату и время окончания');
            if (isValid) {
                showPopup('Укажите дату и время окончания мероприятия', 'error');
                isValid = false;
            }
        }

        // Проверка, что дата окончания не раньше даты начала
        if (startDatetime && endDatetime && startDatetime.value && endDatetime.value && new Date(endDatetime.value) < new Date(startDatetime.value)) {
            showFieldError(endDatetime, endDatetimeError, 'Дата окончания не может быть раньше даты начала');
            if (isValid) {
                showPopup('Дата окончания не может быть раньше даты начала', 'error');
                isValid = false;
            }
        }

        // Проверка, что дата окончания репетиции не раньше даты начала
        if (startRehearsal && endRehearsal && startRehearsal.value && endRehearsal.value && new Date(endRehearsal.value) < new Date(startRehearsal.value)) {
            showFieldError(endRehearsal, endRehearsalError, 'Дата окончания репетиции не может быть раньше даты начала');
            if (isValid) {
                showPopup('Дата окончания репетиции не может быть раньше даты начала', 'error');
                isValid = false;
            }
        }

        // 6. Проверка чекбоксов фото/видео
        const checkboxDropdown = document.querySelector('.checkbox-dropdown');
        if (checkboxDropdown) {
            const checkboxToggle = checkboxDropdown.querySelector('.checkbox-dropdown-toggle');
            const checkboxError = document.getElementById('error_photo_video');
            const checkedOptions = document.querySelectorAll('input[name="information_foto_video"]:checked');

            if (checkedOptions.length === 0) {
                checkboxToggle.style.borderColor = '#ef5350';
                if (checkboxError) {
                    checkboxError.textContent = 'Выберите вариант фото/видеосъемки';
                    checkboxError.style.display = 'block';
                }
                if (isValid) {
                    showPopup('Выберите вариант фото/видеосъемки', 'error');
                    isValid = false;
                }
            } else {
                checkboxToggle.style.borderColor = '';
                if (checkboxError) {
                    checkboxError.style.display = 'none';
                }
            }
        }

        // 7. Проверка текстовых областей
        const textAreas = [
            { id: 'myTextarea', name: 'Краткое описание мероприятия', errorId: 'error_description' }
        ];

        textAreas.forEach(area => {
            const element = document.getElementById(area.id);
            const errorElement = document.getElementById(area.errorId);
            if (!element || !element.value.trim()) {
                showFieldError(element, errorElement, `Поле "${area.name}" обязательно для заполнения`);
                if (isValid) {
                    showPopup(`Поле "${area.name}" обязательно для заполнения`, 'error');
                    isValid = false;
                }
            } else {
                hideFieldError(element, errorElement);
            }
        });

        // 8. Проверка загруженных файлов
        const fileError = document.getElementById('error_files');
        if (currentFiles.length === 0) {
            showFileError(fileError, 'Необходимо загрузить сценарий мероприятия');
            if (isValid) {
                showPopup('Необходимо загрузить сценарий мероприятия', 'error');
                isValid = false;
            }
        } else {
            hideFileError(fileError);
        }

        // Отображение общего сообщения
        if (!isValid) {
            showPopup('Заполните все обязательные поля!', 'error');
            scrollToFirstError();
        } else {
            showPopup('Все поля заполнены правильно! Форма готова к отправке.', 'success');
        }

        return isValid;
    }

    // Вспомогательные функции для работы с ошибками
    function hideAllErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        document.querySelectorAll('.error-field').forEach(el => {
            el.classList.remove('error-field');
            el.style.borderColor = '';
        });

        document.querySelectorAll('.checkbox-dropdown-toggle').forEach(el => {
            el.style.borderColor = '';
        });

        const popup = document.getElementById('popup');
        if (popup) popup.style.display = 'none';
    }

    function showFieldError(field, errorElement, message) {
        if (!field) return;

        if (field.classList.contains('checkbox-dropdown-toggle')) {
            field.style.borderColor = '#ef5350';
        } else {
            field.classList.add('error-field');
            field.style.borderColor = '#ef5350';
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.color = '#ef5350';

            // Убедитесь, что элемент занимает место в потоке документа
            errorElement.style.position = 'static';
            errorElement.style.marginBottom = '7px';
        }
    }
    function hideFieldError(field, errorElement) {
        if (!field) return;

        if (field.classList.contains('checkbox-dropdown-toggle')) {
            field.style.borderColor = '';
        } else {
            field.classList.remove('error-field');
            field.style.borderColor = '';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function showSelectError(select, errorElement, message) {
        if (!select) return;

        const styledSelect = select.closest('.custom-select')?.querySelector('.select-styled');
        if (styledSelect) {
            styledSelect.style.borderColor = '#ef5350';
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function hideSelectError(select, errorElement) {
        if (!select) return;

        const styledSelect = select.closest('.custom-select')?.querySelector('.select-styled');
        if (styledSelect) {
            styledSelect.style.borderColor = '';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function showFileError(errorElement, message) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.borderColor = '#ef5350';
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function hideFileError(errorElement) {
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.style.borderColor = '';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    function scrollToFirstError() {
        const firstError = document.querySelector('.error-field, .custom-select .select-styled[style*="border-color: rgb(239, 83, 80)"], .checkbox-dropdown-toggle[style*="border-color: rgb(239, 83, 80)"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Функции валидации
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    }

    function showPopup(message, type) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalMessage = document.getElementById('modal-message');
        const modalTitle = document.querySelector('.modal-title');
        const successIcon = document.querySelector('.modal-success-icon');

        if (!modalOverlay || !modalMessage) return;

        // Устанавливаем сообщение
        modalMessage.textContent = message;

        // Настраиваем стили в зависимости от типа сообщения
        const modalContent = modalOverlay.querySelector('.modal-content');
        if (type === 'error') {
            modalTitle.textContent = 'Ошибка';
            modalContent.style.border = '2px solid #ef5350';
            modalMessage.style.color = '#d32f2f';
            successIcon.style.display = 'none';
        } else if (type === 'success') {
            modalTitle.textContent = 'Успешно!';
            modalContent.style.border = '2px solid #66bb6a';
            modalMessage.style.color = '#2e7d32';
            successIcon.style.display = 'flex';
        } else {
            modalTitle.textContent = 'Информация';
            modalContent.style.border = '2px solid #42a5f5';
            modalMessage.style.color = '#1565c0';
            successIcon.style.display = 'none';
        }

        // Показываем модальное окно
        modalOverlay.classList.add('active');

        // Обработчик закрытия модального окна
        document.getElementById('modal-close').onclick = function () {
            modalOverlay.classList.remove('active');
        };

        // Закрытие при клике вне модального окна
        modalOverlay.onclick = function (e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        };
    }

    function initFieldValidation() {
        // Обработчики для текстовых полей
        const textFields = [
            { id: 'name_organization', errorId: 'error_name_organization' },
            { id: 'phone_number_organization', errorId: 'error_phone_organization' },
            { id: 'email_organization', errorId: 'error_email_organization' },
            { id: 'responsible_person', errorId: 'error_responsible_person' },
            { id: 'phone_responsible_person', errorId: 'error_phone_responsible' },
            { id: 'contract_details', errorId: 'error_contract_details' },
            { id: 'name_event', errorId: 'error_name_event' },
            { id: 'namber_people', errorId: 'error_namber_people' },
        ];

        textFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.addEventListener('input', function () {
                    const errorElement = document.getElementById(field.errorId);

                    // Скрываем ошибку
                    hideFieldError(input, errorElement);

                    // Для email проверяем валидность
                    if (field.id === 'email_organization' && input.value.trim() && !validateEmail(input.value.trim())) {
                        showFieldError(input, errorElement, 'Укажите корректный email адрес');
                        return;
                    }

                    // Для полей телефона проверяем валидность
                    if (field.id.includes('phone') && input.value.trim() && !validatePhone(input.value.trim())) {
                        showFieldError(input, errorElement, 'Номер должен содержать минимум 10 цифр');
                        return;
                    }
                });
            }
        });

        // Обработчики для textarea
        const textAreas = [
            { id: 'myTextarea', errorId: 'error_description' },
            { id: 'Textarea', errorId: 'error_organizations' }
        ];

        textAreas.forEach(area => {
            const field = document.getElementById(area.id);
            if (field) {
                field.addEventListener('input', function () {
                    const errorElement = document.getElementById(area.errorId);
                    if (errorElement) {
                        hideFieldError(field, errorElement);
                    }
                });
            }
        });

        // Обработчики для полей даты и времени
        const startDatetime = document.getElementById('start-datetime');
        const endDatetime = document.getElementById('end-datetime');
        const startDatetimeError = document.getElementById('error_start_datetime');
        const endDatetimeError = document.getElementById('error_end_datetime');
        const startRehearsal = document.getElementById('start-datetime-rehearsal');
        const endRehearsal = document.getElementById('end-datetime-rehearsal');
        const startRehearsalError = document.getElementById('error_start_datetime-rehearsal');
        const endRehearsalError = document.getElementById('error_end_datetime-rehearsal');

        if (startDatetime && endDatetime) {
            startDatetime.addEventListener('change', function () {
                if (startDatetimeError) hideFieldError(startDatetime, startDatetimeError);
                validateDateTimeRange();
            });
            endDatetime.addEventListener('change', function () {
                if (endDatetimeError) hideFieldError(endDatetime, endDatetimeError);
                validateDateTimeRange();
            });
        }

        if (startRehearsal && endRehearsal) {
            startRehearsal.addEventListener('change', function () {
                if (startRehearsalError) hideFieldError(startRehearsal, startRehearsalError);
                validateRehearsalRange();
            });
            endRehearsal.addEventListener('change', function () {
                if (endRehearsalError) hideFieldError(endRehearsal, endRehearsalError);
                validateRehearsalRange();
            });
        }

        document.querySelectorAll('input[type="date"], input[type="datetime-local"]').forEach(input => {
            input.addEventListener('change', function () {
                // При изменении даты цвет текста обновится автоматически благодаря CSS
                if (this.value) {
                    this.classList.add('has-value');
                } else {
                    this.classList.remove('has-value');
                }
            });

            // Инициализация при загрузке страницы
            if (input.value) {
                input.classList.add('has-value');
            }
        });

        function validateDateTimeRange() {
            const startValue = startDatetime?.value;
            const endValue = endDatetime?.value;

            if (startValue && endValue) {
                const startDate = new Date(startValue);
                const endDate = new Date(endValue);

                if (endDate < startDate) {
                    showFieldError(endDatetime, endDatetimeError, 'Дата окончания не может быть раньше даты начала');
                    // Убрали scrollIntoView, чтобы не прыгало вверх
                } else {
                    hideFieldError(endDatetime, endDatetimeError);
                }
            }
        }

        function validateRehearsalRange() {
            const startValue = startRehearsal?.value;
            const endValue = endRehearsal?.value;

            if (startValue && endValue) {
                const startDate = new Date(startValue);
                const endDate = new Date(endValue);

                if (endDate < startDate) {
                    showFieldError(endRehearsal, endRehearsalError, 'Дата окончания репетиции не может быть раньше даты начала');
                } else {
                    hideFieldError(endRehearsal, endRehearsalError);
                }
            }
        }

        // Обработчики для чекбоксов
        document.querySelectorAll('input[name="information_foto_video"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const checkboxDropdown = document.querySelector('.checkbox-dropdown');
                if (!checkboxDropdown) return;

                const checkboxToggle = checkboxDropdown.querySelector('.checkbox-dropdown-toggle');
                const errorElement = document.getElementById('error_photo_video');

                checkboxToggle.style.borderColor = '';
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            });
        });
    }

    // Обработчик отправки формы
    document.querySelector('.send_form')?.addEventListener('click', function (e) {
        e.preventDefault();
        if (validateForm()) {
            showPopup('Форма успешно отправлена!', 'success');
            // Здесь можно добавить код для реальной отправки формы
        }
    });

    // Инициализация всех функций
    initCustomSelects();
    initAutoResizeTextarea();
    initCheckboxDropdowns();
    initFieldValidation();
});