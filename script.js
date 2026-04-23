window.addEventListener('DOMContentLoaded', () => {

    /* Подключение к Supabase */
    const supabaseUrl = 'https://fiyribauhmrqxrhrcdll.supabase.co';
    const supabaseKey = 'sb_publishable_ZpadGEdXoMzEuuBCqTyfEA_LJUfMLA7';
    
    /* Проверка наличия библиотеки Supabase и создание клиента */
    const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

    if (!supabase) {
        console.error("Критическая ошибка: Библиотека Supabase не найдена!");
    }

    /* Поиск элементов на странице */
    const navLinks = document.querySelectorAll('.nav-menu a');

   /* Элементы для отображения разных секций */
    const allSections = document.querySelectorAll('.content-section');
    const homeView = document.getElementById('home-view');
    const libraryView = document.getElementById('library-view');
    const loginView = document.getElementById('login-view'); 
    const regView = document.getElementById('registration-view');
    const profileView = document.getElementById('profile-view');

    /* Элементы для загрузки трека */
    const uploadFormContainer = document.getElementById('upload-form-container');
    const openUploadModalButton = document.getElementById('open-upload-modal');
    const cancelUploadButton = document.getElementById('cancel-upload-button');
    const startUploadButton = document.getElementById('start-upload-button');
    const trackTitleInput = document.getElementById('track-title');
    const trackArtistInput = document.getElementById('track-artist');
    const trackFileInput = document.getElementById('track-file');
    const fileNameDisplay = document.getElementById('file-name-display');

    /* Элементы плеера */
    const audioPlayer = document.getElementById('main-audio');
    const playPauseBtn = document.querySelector('.play-pause-button');
    const playPauseIcon = playPauseBtn.querySelector('i');
    const progressFill = document.querySelector('.progress-fill');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const volumeBar = document.querySelector('.volume-bar');
    const volumeFill = document.querySelector('.volume-fill');
    const volumeIcon = document.querySelector('.volume-button i');
    const volumeBtn = document.querySelector('.volume-button');
    const volumeHandle = document.querySelector('.volume-handle');
    const repeatBtn = document.querySelector('.repeat-button');
    const shuffleBtn = document.querySelector('.shuffle-button');

    /*Элементы для очереди треков */
    const queueOverlay = document.getElementById('queue-overlay');
    const queueList = document.getElementById('queue-list');
    const queueBtn = document.querySelector('.queue-button');
    const closeQueue = document.getElementById('close-queue');

    let isRegistered = false;
    let currentUser = localStorage.getItem('my_user_uuid') || null;
    if (currentUser) isRegistered = true; /* Если есть сохраненный UUID, считаем юзера авторизованным */

    let currentPlaylist = []; /* Массив для хранения треков */
    let currentTrackIndex = -1; /* Индекс текущего трека */

    let isRepeat = false;
    let isShuffle = false;
    let shuffledPlaylist = [];

    /* Синхронизация иконки Play/Pause с состоянием плеера */
    audioPlayer.addEventListener('play', () => {
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
    });
    audioPlayer.addEventListener('pause', () => {
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
    });

    /* Отображение имени выбранного файла при загрузке трека */
    trackFileInput?.addEventListener('change', () => {
        if (trackFileInput.files.length > 0) {
            fileNameDisplay.textContent = trackFileInput.files[0].name;
            fileNameDisplay.style.color = "#7b2cbf";
        } else {
            fileNameDisplay.textContent = "Выберите аудиофайл (MP3, WAV)";
            fileNameDisplay.style.color = "#b3b3b3";
        }
    });

    /* Переход со входа на регистрацию */
    const toRegLink = document.getElementById('to-reg-link');
    
    /* Формы для входа и регистрации */
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('reg-form');
    
    const userNameDisplay = document.getElementById('user-name-display');
    const savedName = localStorage.getItem('my_user_name');
    if (savedName && userNameDisplay) {
        userNameDisplay.textContent = savedName;
    }

    /* Скрытие всех секций при загрузке страницы */
    function hideAllSections() {
        allSections.forEach(s => s.style.display = 'none');
    }

    /* Навигация по сайту */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.textContent.trim();

            // Скрываем все секции
            allSections.forEach(section => section.style.display = 'none');

            // Показываем нужную
            if (sectionName === 'Главная') homeView.style.display = 'block';
            if (sectionName === 'Медиатека') {
                libraryView.style.display = 'block';
                loadUserTracks();
            }
            if (sectionName === 'Профиль') {
                if (isRegistered) {
                    profileView.style.display = 'block';
                } else {
                    loginView.style.display = 'block';
                }
            }
        });
    });

    /*Переход со входа на регистрацию */
    toRegLink?.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        regView.style.display = 'block';
    });

    /* Логика входа */
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        const { data, error } = await supabase
            .from('users_data')
            .select('id, username')
            .eq('username', user)
            .eq('password', pass)
            .single();

        if (error || !data) {
            toast("Неверный логин или пароль", "error");
        } else {
            isRegistered = true;
            userNameDisplay.textContent = data.username;
            currentUser = data.id;
            localStorage.setItem('my_user_uuid', data.id);
            localStorage.setItem('my_user_name', data.username);
            hideAllSections();
            profileView.style.display = 'block';
            toast(`С возвращением, ${data.username}!`);
        }
    });

    /* Логика регистрации */
    regForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username-input').value.trim();
        const password = document.getElementById('password-input').value;

        /* Проверка на валидность пароля */
        const passwordError = validatePassword(password);
        if (passwordError) {
            toast(passwordError, "error");
            return;
        }

        try {
            /* Проверка наличия юзера (чтобы не было дубликатов) */ 
            const { data: existingUser, error: checkError } = await supabase
                .from('users_data')
                .select('id, username')
                .eq('username', username)
                .maybeSingle();

            if (existingUser) {
                /* Если юзер уже есть, просто логиним его (без создания нового профиля) */
                currentUser = existingUser.id;
                isRegistered = true;
                userNameDisplay.textContent = existingUser.username;
                
                localStorage.setItem('my_user_uuid', existingUser.id);

                toast("С возвращением, " + username + "!");
                hideAllSections();
                profileView.style.display = 'block';
                return;
            }

            /* Если юзера нет, создаем нового */
            const { data: newData, error: insertError } = await supabase
                .from('users_data')
                .insert([{ username, password }])
                .select('id, username')
                .single();

            if (insertError) throw insertError;

            if (newData) {
                currentUser = newData.id;
                isRegistered = true;
                userNameDisplay.textContent = newData.username;
                
                localStorage.setItem('my_user_uuid', newData.id);
                localStorage.setItem('my_user_name', newData.username);
                userNameDisplay.textContent = newData.username;

                toast("Аккаунт успешно создан!");
                hideAllSections();
                profileView.style.display = 'block';
            }

        } catch (err) {
            console.error(err);
            toast("Ошибка: Возможно, имя занято или проблема с базой", "error");
        }
    });

    /* Логика выхода */
    document.getElementById('logout-button')?.addEventListener('click', () => {
        currentUser = null;
        isRegistered = false;
        hideAllSections();
        homeView.style.display = 'block';
        toast("Вы вышли", "info");
    });

    /* Правила валидации пароля при регистрации */
    function validatePassword(password) {
        /* Минимум 8 символов, хотя бы одна заглавная буква и одна цифра */
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < minLength) {
            return "Пароль должен быть не короче 8 символов";
        }
        if (!hasUpperCase) {
            return "Добавьте хотя бы одну заглавную букву";
        }
        if (!hasNumber) {
            return "Добавьте хотя бы одну цифру";
        }
        return null; /* Ошибок нет */
    }

    /* Логика открытия окна загрузки трека */
    openUploadModalButton?.addEventListener('click', () => {
        if (!isRegistered) {
            Swal.fire({
                title: 'Доступ ограничен',
                text: 'Чтобы загружать свои треки, необходимо авторизоваться',
                icon: 'warning',
                iconColor: '#7b2cbf',
                background: '#181818',
                color: '#ffffff',
                showConfirmButton: true,
                confirmButtonText: 'ОК',
                confirmButtonColor: '#7b2cbf',
                padding: '2em',
                background: '#121212',
                backdrop: `rgba(0,0,0,0.6)`,
            });
            return;
        }               
        uploadFormContainer.style.display = 'flex';
    });

    cancelUploadButton?.addEventListener('click', () => {
        uploadFormContainer.style.display = 'none';
    });

    /* Загрузка трека в базу данных Supabase */
    startUploadButton?.addEventListener('click', async () => {

        const file = trackFileInput.files[0];
        const title = trackTitleInput.value.trim();
        const artist = trackArtistInput.value.trim();

        if (!file || !title) {
            Swal.fire("Внимание", "Укажите название и выберите файл", "info");
            return;
        }

        startUploadButton.disabled = true;
        startUploadButton.textContent = "Загрузка...";

        try {
            /* Загрузка файла в хранилище Supabase (в папку "songs") */
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('songs')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Ошибка хранилища:", uploadError);
                    throw new Error(`Хранилище: ${uploadError.message}`);
                }

            /* Получение ссылки на загруженный файл */
            const { data: urlData } = supabase.storage.from('songs').getPublicUrl(fileName);

            /* Запись в таблицу tracks */
            const { error: dbError } = await supabase
                .from('tracks')
                .insert([{
                    title: title,
                    artist: artist || "Неизвестен",
                    file_url: urlData.publicUrl,
                    user_id: currentUser
                }]);

            if (dbError) throw dbError;

            Swal.fire({
                title: 'Готово!',
                text: 'Трек добавлен',
                icon: 'success',
                iconColor: '#7b2cbf',
                background: '#181818',
                color: '#fff',
                confirmButtonColor: '#7b2cbf',
            });
            
            /* Отчистка полей и закрытие окна */
            trackTitleInput.value = ''; trackArtistInput.value = ''; trackFileInput.value = '';
            uploadFormContainer.style.display = 'none';
            loadUserTracks();

        } catch (err) {
            console.error(err);
            Swal.fire("Ошибка", err.message, "error");
        } finally {
            startUploadButton.disabled = false;
            startUploadButton.textContent = "Опубликовать";
        }
    });

    /*Уведомления через SweetAlert2 */
    const toast = (title, icon = 'success') => {
        Swal.fire({
            title: title,
            icon: icon,
            background: '#181818',
            color: '#fff',
            iconColor: icon === 'success' ? '#7b2cbf' : '#ff4b2b',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            toast: true,
            position: 'bottom-start',
        });
    };

    let activeBar = null;
    let activeFill = null;
    let activeHandle = null;
    let isDragging = false;

    const onMouseMove = (e) => {
        if (!isDragging || !activeBar) return;
        const rect = activeBar.getBoundingClientRect();
        let p = ((e.clientX - rect.left) / rect.width) * 100;
        p = Math.max(0, Math.min(100, p));
        activeFill.style.width = p + '%';
        if (activeHandle) activeHandle.style.left = p + '%';
        
        /* Логика для изменения текущего времени трека или громкости в зависимости от того, какой слайдер активен */
        if (activeBar.classList.contains('progress-bar') && audioPlayer.duration) {
            audioPlayer.currentTime = (p / 100) * audioPlayer.duration;
        }
        if (activeBar.classList.contains('volume-bar')) {
            audioPlayer.volume = p / 100;
        }
    };

    const onMouseUp = () => {
        isDragging = false;
        if (activeBar) activeBar.classList.remove('active');
        activeBar = null;
        activeFill = null;
        activeHandle = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    /* Инициализация слайдера для прогресса трека и громкости. Логика общая */
    const initSlider = (barSelector, fillSelector, handleSelector) => {
        const bar = document.querySelector(barSelector);
        const fill = document.querySelector(fillSelector);
        const handle = document.querySelector(handleSelector);
        
        bar.addEventListener('mousedown', (e) => {
            isDragging = true;
            activeBar = bar;
            activeFill = fill;
            activeHandle = handle;
            bar.classList.add('active');
            
            /* Обновление позиции слайдера при клике на него */
            const rect = bar.getBoundingClientRect();
            let p = ((e.clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            fill.style.width = p + '%';
            if (handle) handle.style.left = p + '%';
            
            if (bar.classList.contains('progress-bar') && audioPlayer.duration) {
                audioPlayer.currentTime = (p / 100) * audioPlayer.duration;
            }
            if (bar.classList.contains('volume-bar')) {
                audioPlayer.volume = p / 100;
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    initSlider('.progress-bar', '.progress-fill', '.progress-handle');
    initSlider('.volume-bar', '.volume-fill', '.volume-handle');

    /* Функция для кнопки "Play/Pause" */
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.src) {
            audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
        }
    });

    /* Функция для кнопки "Лайк" */
    const likeBtn = document.querySelector('.like-button');
    const likeIcon = likeBtn.querySelector('i');

    likeBtn.addEventListener('click', async () => {
        /* Если трек не выбран или не знаем его индекс, ничего не делаем */
        if (currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) return;

        const currentTrack = currentPlaylist[currentTrackIndex];
        const newStatus = !currentTrack.is_liked; // Инвертируем текущий статус

        currentTrack.is_liked = newStatus;
        updateLikeVisuals(newStatus);

        /* Сохраняем новый статус лайка в БД для текущего трека и текущего пользователя */
        const { error } = await supabase
            .from('tracks')
            .update({ is_liked: newStatus })
            .eq('id', currentTrack.id);

        if (error) {
            console.error("Ошибка сохранения лайка:", error);
            /* Если не удалось сохранить, возвращаем старый статус и показываем ошибку */
            currentTrack.is_liked = !newStatus;
            updateLikeVisuals(!newStatus);
            toast("Не удалось сохранить лайк", "error");
        }
    });

    /* Визуальное обновление кнопки "Лайк" в зависимости от статуса */
    function updateLikeVisuals(isLiked) {
        const likeBtn = document.querySelector('.like-button');
        const likeIcon = likeBtn.querySelector('i');
        
        if (isLiked) {
            likeBtn.classList.add('liked');
            likeIcon.classList.replace('fa-regular', 'fa-solid');
        } else {
            likeBtn.classList.remove('liked');
            likeIcon.classList.replace('fa-solid', 'fa-regular');
        }
    }

    /* Функция для кнопки "Громкость" */
    let lastVolume = 70;
    let isMuted = false;

    volumeBtn.addEventListener('click', () => {
        if (!isMuted) {
            lastVolume = parseInt(volumeFill.style.width) || 70;
            volumeFill.style.width = '0%';
            volumeHandle.style.left = '0%';
            audioPlayer.volume = 0;
            volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
            isMuted = true;
        } else {
        volumeFill.style.width = lastVolume + '%';
            volumeHandle.style.left = lastVolume + '%';
            audioPlayer.volume = lastVolume / 100;
            volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
            isMuted = false;
        }
    });

    /* Функция для отображения треков в медиатеке */
    async function loadUserTracks() {
        const tracksList = document.getElementById('tracks-list');
        const emptyState = document.getElementById('empty-library');

        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('user_id', currentUser);

        if (!tracks || tracks.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            renderTracks(tracks);
        }
    }

    /* Функция для рендера треков на странице медиатеки */
    function renderTracks(tracks) {
            const tracksList = document.getElementById('tracks-list');
            if (!tracksList) return;
            tracksList.innerHTML = '';

            tracks.forEach((track, index) => {
                const card = document.createElement('div');
                card.className = 'track-card';
                card.innerHTML = `
                    <div class="card-image">
                        <i class="fa-solid fa-music"></i>
                    </div>
                    <div class="card-info">
                        <div class="track-title-text">${track.title}</div>
                        <div class="track-author">${track.artist}</div>
                    </div>
                `;

                card.addEventListener('click', () => {
                    if (!track.file_url) return;
                    
                    currentPlaylist = tracks;
                    currentTrackIndex = index;
                    playTrack(currentTrackIndex);
                });

                tracksList.appendChild(card);
            });
    }

    /* Функция для воспроизведения трека по индексу*/
    function playTrack(index) {
        if (index < 0 || index >= currentPlaylist.length) return;
        
        const track = currentPlaylist[index];
        audioPlayer.src = track.file_url;
        audioPlayer.play().catch(err => console.error("Ошибка воспроизведения:", err));

        document.querySelector('.track-name').textContent = track.title;
        document.querySelector('.track-artist').textContent = track.artist;

        /* Обновление визуального состояния кнопки "Лайк" в зависимости от статуса текущего трека */
        updateLikeVisuals(track.is_liked);

        if (queueOverlay.classList.contains('active')) {
            renderQueue();
        }
    }

    /* Автоматическое переключение на следующий трек после окончания текущего */
    audioPlayer.addEventListener('ended', () => {
        if (isRepeat) {
            PlayTrack(currentTrackIndex);
        }
        else if (isShuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * currentPlaylist.length);
            } while (randomIndex === currentTrackIndex);
            currentTrackIndex = randomIndex;

            currentTrackIndex = randomIndex;
            playTrack(currentTrackIndex);
        }
        else {
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        }
    });

    /* Функция для выбора следующего индекса трека в зависимости от режима воспроизведения (обычный или перемешивание) */
    function getNextIndex() {
        if (isShuffle && shuffledPlaylist.length > 1) {
                /* Находим текущий трек в перемешанном плейлисте и выбираем следующий по циклу, чтобы избежать повторов до тех пор, пока не пройдут все треки */
                const currentInShuffled = shuffledPlaylist.findIndex(t => t.id === currentPlaylist[currentTrackIndex].id);
                const nextInShuffled = (currentInShuffled + 1) % shuffledPlaylist.length;
                return currentPlaylist.findIndex(t => t.id === shuffledPlaylist[nextInShuffled].id);
            }
            return (currentTrackIndex + 1) % currentPlaylist.length;
        }

    /* Функция для выбора предыдущего индекса трека в зависимости от режима воспроизведения (обычный или перемешивание) */
    function getPrevIndex() {
        if (isShuffle && currentPlaylist.length > 1) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * currentPlaylist.length);
            } while (randomIndex === currentTrackIndex);
            
            return randomIndex;
        } else {
            return (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        }
    }

    /* Кнопка "Вперед" */
    document.querySelector('.next-button').onclick = () => {
        currentTrackIndex = getNextIndex();
        playTrack(currentTrackIndex);
    };

    /* Кнопка "Назад" */
    document.querySelector('.prev-button').onclick = () => {
        currentTrackIndex = getPrevIndex();
        playTrack(currentTrackIndex);
    };

    /* Когда трек заканчивается, проверяем, включен ли режим повторения
    Если да - просто воспроизводим тот же трек
    Если нет - выбираем следующий трек в зависимости от того, включен ли режим перемешивания, и воспроизводим его */
    audioPlayer.onended = () => {
        if (isRepeat) {
            playTrack(currentTrackIndex); /* Приоритет повторения */
        } else {
            currentTrackIndex = getNextIndex();
            playTrack(currentTrackIndex);
        }
    };

    /* Кнопка повторения трека */
    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        if (isRepeat) isShuffle = false;
        updateControlStyles();
        if (queueOverlay.classList.contains('active')) renderQueue();
    });

    /* Кнопка перемешивания */
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        if (isShuffle) {
            isRepeat = false;
            /* Генерация новой перемешанной версии плейлиста для отображения в очереди */
            shuffledPlaylist = [...currentPlaylist].sort(() => Math.random() - 0.5);
        }
        updateControlStyles();
        if (queueOverlay.classList.contains('active')) renderQueue();
    });

    /* Функция для обновления стилей кнопок "Повтор" и "Перемешивание" */
    function updateControlStyles() {
        shuffleBtn.style.color = isShuffle ? '#a855f7' : '#fff';
        repeatBtn.style.color = isRepeat ? '#a855f7' : '#fff';
    }

    /* Логика для форматирования времени в плеере (минуты:секунды) */
    const formatTime = (sec) => {
        if (isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    };

    /* Бегунок прогресса и обновление текущего времени при воспроизведении трека */
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const current = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressFill.style.width = `${current}%`;
            document.querySelector('.progress-handle').style.left = `${current}%`;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    /* Открыть очередь треков */
    queueBtn.onclick = (e) => {
        e.stopPropagation();
        const isActive = queueOverlay.classList.contains('active');
        
        if (isActive) {
            queueOverlay.classList.remove('active');
        } else {
            renderQueue();
            queueOverlay.classList.add('active');
        }
    };

    /* Закрыть очередь треков */
    closeQueue.onclick = () => {
        queueOverlay.classList.remove('active');
    };

    /* Функция для рендера очереди треков в зависимости от текущих режимов воспроизведения */
    function renderQueue() {
        const queueList = document.getElementById('queue-list');
        queueList.innerHTML = ''; 

        let displayTracks = [];

        if (isRepeat) {
            /* Только текущий трек, при повторе остальные не важны */
            displayTracks = [currentPlaylist[currentTrackIndex]];
        } else if (isShuffle) {
           /*  Используем перемешанный плейлист для отображения в очереди */
            displayTracks = shuffledPlaylist;
        } else {
            /* Обычный режим - отображаем треки в порядке основного плейлиста */
            displayTracks = currentPlaylist;
        }

        displayTracks.forEach((track, index) => {
            const item = document.createElement('div');
            /* Трек считается текущим, если его ID совпадает с ID трека на текущем индексе основного плейлиста
            Это гарантирует правильное выделение даже в режиме перемешивания, где порядок отображения отличается от порядка основного плейлиста */
            const isCurrent = (track.id === currentPlaylist[currentTrackIndex]?.id);
            
            item.className = `queue-item ${isCurrent ? 'current' : ''}`;
            
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; width:100%;">
                    <span style="opacity:0.5; width:20px; font-size: 12px;">${index + 1}</span>
                    <div style="flex-grow:1; overflow: hidden;">
                        <div style="font-weight:500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${track.title || 'Без названия'}
                        </div>
                        <div style="font-size:11px; opacity:0.6;">
                            ${track.artist || 'Неизвестен'}
                        </div>
                    </div>
                    ${isCurrent ? `<i class="fas ${isRepeat ? 'fa-redo-alt' : 'fa-volume-up'}" style="color:#a855f7"></i>` : ''}
                </div>
            `;

            item.onclick = () => {
                /* Находим индекс трека в основном плейлисте по его ID, чтобы корректно обновить currentTrackIndex и воспроизвести выбранный трек*/
                const mainIndex = currentPlaylist.findIndex(t => t.id === track.id);
                currentTrackIndex = mainIndex;
                playTrack(currentTrackIndex);
            };

            queueList.appendChild(item);
        });
    }
});