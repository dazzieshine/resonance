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
    const trackCoverInput = document.getElementById('track-cover');
    const coverNameDisplay = document.getElementById('cover-name-display');

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
    const playerMenuTrigger = document.querySelector('.player-menu-trigger');
    const playerContextMenu = document.querySelector('.player-context-menu'); 

    /*Элементы для очереди треков */
    const queueOverlay = document.getElementById('queue-overlay');
    const queueList = document.getElementById('queue-list');
    const queueBtn = document.querySelector('.queue-button');
    const closeQueue = document.getElementById('close-queue');

    /* Элементы для фильтрации треков в медиатеке */
    const filterAll = document.getElementById('filter-all');
    const filterLiked = document.getElementById('filter-liked');
    const filterPlaylists = document.getElementById('filter-playlists');

    /* Элементы для отображения треков и плейлистов в медиатеке */
    const tracksList = document.getElementById('tracks-list');
    const playlistsViewContainer = document.getElementById('playlists-view-container');
    const createPlaylistButton = document.getElementById('create-playlist-button');

    /* Элементы для создания плейлиста */
    const playlistFormContainer = document.getElementById('playlist-form-container');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const savePlaylistButton = document.getElementById('save-playlist-button');
    const cancelPlaylistButton = document.getElementById('cancel-playlist-button');
    const closePlaylistModal = document.getElementById('close-playlist-modal');
    const playlistCoverInput = document.getElementById('playlist-cover');
    const playlistCoverNameDisplay = document.getElementById('playlist-cover-name-display');

    /* Элементы редактирования обложки */
    const editCoverInput = document.getElementById('edit-track-cover');
    const editCoverNameDisplay = document.getElementById('edit-cover-name-display');
    let currentEditCoverUrl = null;

    let isRegistered = false;
    let currentUser = localStorage.getItem('my_user_uuid') || null;
    if (currentUser) isRegistered = true; /* Если есть сохраненный UUID, считаем юзера авторизованным */

    let allUserTracks = []; /* Все треки текущего пользователя */
    let currentPlaylist = []; /* Массив для хранения треков */
    let currentTrackIndex = -1; /* Индекс текущего трека */

    let isRepeat = false;
    let isShuffle = false;

    let currentEditTrackId = null;

    editCoverInput?.addEventListener('change', () => {
        if (editCoverInput.files.length > 0) {
            editCoverNameDisplay.textContent = editCoverInput.files[0].name;
            editCoverNameDisplay.style.color = "#7b2cbf";
        } else {
            editCoverNameDisplay.textContent = "Выбрать новую обложку (необязательно)";
            editCoverNameDisplay.style.color = "#b3b3b3";
        }
    });

    /* Меню в плеере */
    const initPlayerMenu = () => {
        if (playerMenuTrigger && playerContextMenu) {
            const newBtn = playerMenuTrigger.cloneNode(true);
            playerMenuTrigger.parentNode.replaceChild(newBtn, playerMenuTrigger);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContextMenu.classList.toggle('active');
            });
            
            document.querySelector('.player-edit-track')?.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContextMenu.classList.remove('active');
                if (currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) {
                    toast("Нет активного трека", "error");
                    return;
                }
                const track = currentPlaylist[currentTrackIndex];
                showEditTrackModal(track.id, track.title, track.artist);
            });
            
            document.querySelector('.player-add-to-playlist')?.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContextMenu.classList.remove('active');
                if (currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) {
                    toast("Нет активного трека", "error");
                    return;
                }
                const track = currentPlaylist[currentTrackIndex];
                showAddToPlaylistModal(track.id, track.title);
            });
        }
    };

    initPlayerMenu();

    /* Закрытие меню при клике вне его */
    document.addEventListener('click', (e) => {
        const menu = document.querySelector('.player-context-menu');
        const btn = document.querySelector('.player-menu-trigger');
        if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    /* Блок редактирования трека */
    async function showEditTrackModal(trackId, currentTitle, currentArtist) {
        currentEditTrackId = trackId;
        const titleInput = document.getElementById('edit-track-title');
        const artistInput = document.getElementById('edit-track-artist');
        titleInput.value = currentTitle;
        artistInput.value = currentArtist;

        /* Сохраняем текущую обложку */
        const { data: track } = await supabase
            .from('tracks')
            .select('cover_url')
            .eq('id', trackId)
            .single();
        currentEditCoverUrl = track?.cover_url || null;

        /* Показываем текущую обложку в предпросмотре */
        const editPreviewDiv = document.getElementById('edit-cover-preview');
        const editPreviewImg = document.getElementById('edit-cover-preview-img');
        const editPreviewText = document.getElementById('edit-cover-preview-text');

        if (currentEditCoverUrl) {
            editPreviewImg.src = currentEditCoverUrl;
            editPreviewImg.style.display = 'block';
            editPreviewText.textContent = 'Текущая обложка';
        } else {
            editPreviewImg.style.display = 'none';
            editPreviewText.textContent = 'Обложка не установлена';
        }
        
        /* Сбрасываем поле выбора новой обложки */
        editCoverInput.value = '';
        editCoverNameDisplay.textContent = 'Выбрать новую обложку';
        editCoverNameDisplay.style.color = '#b3b3b3';
        
        /* Скрываем превью новой обложки */
        document.getElementById('edit-new-cover-preview').style.display = 'none';
        document.getElementById('edit-new-cover-preview-img').src = '';

        document.getElementById('edit-track-modal').style.display = 'flex';
    }

    /* Предпросмотр новой обложки при редактировании */
    if (editCoverInput) {
        editCoverInput.addEventListener('change', function() {
            const newPreviewDiv = document.getElementById('edit-new-cover-preview');
            const newPreviewImg = document.getElementById('edit-new-cover-preview-img');
            
            if (this.files && this.files[0]) {
                const file = this.files[0];
                editCoverNameDisplay.textContent = file.name;
                editCoverNameDisplay.style.color = '#7b2cbf';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    newPreviewImg.src = e.target.result;
                    newPreviewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                editCoverNameDisplay.textContent = 'Выбрать новую обложку';
                editCoverNameDisplay.style.color = '#b3b3b3';
                newPreviewDiv.style.display = 'none';
                newPreviewImg.src = '';
            }
        });
    }

    document.getElementById('save-track-edit')?.addEventListener('click', async () => {
        const newTitle = document.getElementById('edit-track-title').value.trim();
        const newArtist = document.getElementById('edit-track-artist').value.trim();
        const newCoverFile = editCoverInput.files[0];
        
        if (!newTitle) {
            toast("Введите название", "error");
            return;
        }
        
        let newCoverUrl = currentEditCoverUrl;
        
        /* Если выбрана новая обложка - загружаем её */
        if (newCoverFile) {
            const coverExt = newCoverFile.name.split('.').pop();
            const coverFileName = `${Date.now()}_cover.${coverExt}`;
            const { error: coverError } = await supabase.storage
                .from('covers')
                .upload(coverFileName, newCoverFile, { cacheControl: '3600', upsert: false });
            
            if (!coverError) {
                const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
                newCoverUrl = coverUrlData.publicUrl;
            } else {
                toast("Ошибка загрузки обложки", "error");
            }
        }
        
        /* Обновляем трек в БД */
        const { error } = await supabase
            .from('tracks')
            .update({ 
                title: newTitle, 
                artist: newArtist || "Неизвестен",
                cover_url: newCoverUrl
            })
            .eq('id', currentEditTrackId);
        
        if (error) {
            toast("Ошибка обновления", "error");
            return;
        }
        
        toast("Трек обновлён");
        document.getElementById('edit-track-modal').style.display = 'none';
        loadUserTracks();
    });

    document.getElementById('cancel-track-edit')?.addEventListener('click', () => {
        document.getElementById('edit-track-modal').style.display = 'none';
        editCoverInput.value = '';
        editCoverNameDisplay.textContent = 'Выбрать новую обложку';
        editCoverNameDisplay.style.color = '#b3b3b3';
        document.getElementById('edit-new-cover-preview').style.display = 'none';
        document.getElementById('edit-new-cover-preview-img').src = '';
    });

    /* Добавление в плейлист */
    let currentAddTrackId = null;
    let currentAddTrackTitle = '';

    async function showAddToPlaylistModal(trackId, trackTitle, trackArtist) {
        currentAddTrackId = trackId;
        const trackNameElement = document.getElementById('add-to-playlist-track-name');
        trackNameElement.innerHTML = `${trackTitle}<br><span style="font-size: 12px; color: #888;">${trackArtist || 'Неизвестен'}</span>`;
        
        const { data: playlists, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('user_id', currentUser);
        
        if (error || !playlists.length) {
            toast("Нет плейлистов", "error");
            return;
        }
        
        // Получаем плейлисты, в которых уже есть трек
        const { data: existingTracks } = await supabase
            .from('playlist_tracks')
            .select('playlist_id')
            .eq('track_id', trackId);
        
        const existingPlaylistIds = existingTracks?.map(p => p.playlist_id) || [];
        
        const container = document.getElementById('playlist-check-list');
        container.innerHTML = '';
        
        playlists.forEach(playlist => {
            const isChecked = existingPlaylistIds.includes(playlist.id);
            
            const item = document.createElement('label');
            item.className = 'playlist-simple-item';
            item.innerHTML = `
                <input type="checkbox" value="${playlist.id}" ${isChecked ? 'checked' : ''}>
                <span class="playlist-name">${playlist.name}</span>
            `;
            container.appendChild(item);
        });
        
        document.getElementById('add-to-playlist-modal').style.display = 'flex';
    }

    /* Обработчик сохранения трека в плейлист */
    document.getElementById('confirm-add-to-playlist')?.addEventListener('click', async () => {
        const checked = [...document.querySelectorAll('#playlist-check-list input:checked')]
            .map(el => el.value);
        
        /* Получаем все плейлисты пользователя */
        const { data: playlists } = await supabase
            .from('playlists')
            .select('id')
            .eq('user_id', currentUser);
        
        const allPlaylistIds = playlists.map(p => p.id);
        
        /* Добавляем в выбранные плейлисты */
        for (const playlistId of checked) {
            await supabase
                .from('playlist_tracks')
                .insert({ playlist_id: playlistId, track_id: currentAddTrackId })
                .select();
        }
        
        /* Удаляем из невыбранных плейлистов */
        const unchecked = allPlaylistIds.filter(id => !checked.includes(id));
        for (const playlistId of unchecked) {
            await supabase
                .from('playlist_tracks')
                .delete()
                .eq('playlist_id', playlistId)
                .eq('track_id', currentAddTrackId);
        }
        
        toast("Плейлисты обновлены");
        document.getElementById('add-to-playlist-modal').style.display = 'none';
    });

    document.getElementById('cancel-add-to-playlist')?.addEventListener('click', () => {
        document.getElementById('add-to-playlist-modal').style.display = 'none';
    });

    createPlaylistButton?.addEventListener('click', async () => {
        if (!currentUser) {
            toast("Войдите в аккаунт", "error");
            return;
        }

        playlistFormContainer.style.display = 'flex';
        playlistNameInput.focus();

        renderPlaylistTracks();
    });

    const hidePlaylistModal = () => {
        playlistFormContainer.style.display = 'none';
        playlistNameInput.value = '';
    };

    [cancelPlaylistButton, closePlaylistModal].forEach(btn => {
        btn?.addEventListener('click', hidePlaylistModal);
    });

    /* Сохранение нового плейлиста в БД*/
    savePlaylistButton?.addEventListener('click', async () => {
        const name = playlistNameInput.value.trim();
        if (!name) {
            toast("Введите название", "error");
            return;
        }
        
        const checked = [...document.querySelectorAll('#playlist-track-list input:checked')]
            .map(el => el.value);
        
        try {
            const { data, error } = await supabase
                .from('playlists')
                .insert([{
                    name: name,
                    user_id: currentUser,
                    cover_url: null
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            const playlistId = data.id;
            if (checked.length) {
                const rows = checked.map(trackId => ({
                    playlist_id: playlistId,
                    track_id: trackId
                }));
                await supabase.from('playlist_tracks').insert(rows);
            }
            
            toast("Плейлист создан");
            hidePlaylistModal();
            loadPlaylists();
            
        } catch(err) {
            console.error(err);
            toast("Ошибка создания", "error");
        }
    });

    function renderPlaylistTracks() {
        const container = document.getElementById('playlist-track-list');
        if (!container) return;

        container.innerHTML = '';

        if (!allUserTracks.length) {
            container.innerHTML = `<p style="color:#888; text-align:center; padding:20px;">Нет загруженных треков</p>`;
            return;
        }

        allUserTracks.forEach(track => {
            const item = document.createElement('label');
            item.className = 'playlist-track-item';
            
            item.innerHTML = `
                <input type="checkbox" value="${track.id}">
                <span class="custom-checkbox">
                    <i class="fas fa-check"></i>
                </span>
                <div class="playlist-track-info">
                    <div class="playlist-track-name">${track.title}</div>
                    <div class="playlist-track-artist">${track.artist}</div>
                </div>
            `;

            container.appendChild(item);
        });
    }

    /* Функция для переключения между секциями "Треки", "Любимое" и "Плейлисты" */
    function switchLibrarySection(activeFilter, sectionToShow) {
        [filterAll, filterLiked, filterPlaylists].forEach(filter => {
            filter?.classList.remove('active');
        });

        activeFilter.classList.add('active');

        const sortGroup = document.querySelector('.sort-group');
        
        if (sectionToShow === 'playlists') {
            tracksList.style.display = 'none';
            playlistsViewContainer.style.display = 'block';
            openUploadModalButton.style.display = 'none';
            createPlaylistButton.style.display = 'flex';
            
            if (sortGroup) sortGroup.style.display = 'none';
            
            if (currentUser) {
                loadPlaylists();
            } else {
                const grid = document.getElementById('playlists-grid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-lock"></i>
                            <h3>Требуется авторизация</h3>
                            <p>Войдите в аккаунт, чтобы увидеть плейлисты</p>
                        </div>
                    `;
                }
            }
        } else {
            tracksList.style.display = 'grid';
            playlistsViewContainer.style.display = 'none';
            openUploadModalButton.style.display = 'flex';
            createPlaylistButton.style.display = 'none';
            
            if (sortGroup) sortGroup.style.display = 'flex';
        }
    }

    /* Функция загрузки плейлистов */
    async function loadPlaylists() {
        const grid = document.getElementById('playlists-grid');
        if (!grid) return;

        if (!currentUser) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lock"></i>
                    <h3>Требуется авторизация</h3>
                    <p>Войдите в аккаунт, чтобы увидеть плейлисты</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        const { data: playlists, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('user_id', currentUser);

        if (error) {
            console.error(error);
            toast("Ошибка загрузки плейлистов", "error");
            return;
        }

        if (!playlists.length) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Плейлистов пока нет</h3>
                    <p>Создайте первый плейлист</p>
                </div>
            `;
            return;
        }

        for (const playlist of playlists) {
            const { count, error: countError } = await supabase
                .from('playlist_tracks')
                .select('*', { count: 'exact', head: true })
                .eq('playlist_id', playlist.id);
            
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <button class="track-menu-trigger playlist-menu-trigger">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="track-context-menu playlist-context-menu">
                    <button class="view-playlist-btn" data-id="${playlist.id}" data-name="${playlist.name}">
                        <i class="fas fa-list"></i> Просмотр
                    </button>
                    <button class="edit-playlist-btn" data-id="${playlist.id}" data-name="${playlist.name}">
                        <i class="fas fa-pen"></i> Редактировать
                    </button>
                    <button class="delete-playlist-btn" data-id="${playlist.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
                <div class="card-image playlist-cover">
                    ${playlist.cover_url ? 
                        `<img src="${playlist.cover_url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : 
                        `<i class="fas fa-folder"></i>`
                    }
                </div>
                <div class="track-title-text">${playlist.name}</div>
                <div class="track-author">${count || 0} треков</div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger')) return;
                if (e.target.closest('.playlist-context-menu button')) return;
                playPlaylist(playlist.id);
            });

            /* Меню */
            const menuTrigger = card.querySelector('.playlist-menu-trigger');
            const contextMenu = card.querySelector('.playlist-context-menu');

            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.playlist-context-menu.active').forEach(menu => {
                    if (menu !== contextMenu) menu.classList.remove('active');
                });
                contextMenu.classList.toggle('active');
            });

            /* Просмотр */
            card.querySelector('.view-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                openPlaylistView(playlist.id, playlist.name);
            });

            /* Редактирование */
            card.querySelector('.edit-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                showEditPlaylistModal(playlist.id);
            });

            /* Удаление */
            card.querySelector('.delete-playlist-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                
                const confirm = await Swal.fire({
                    title: 'Удалить плейлист?',
                    text: 'Треки при этом не удалятся',
                    icon: 'warning',
                    iconColor: '#9b2c3d',
                    showCancelButton: true,
                    confirmButtonColor: '#9b2c3d',
                    confirmButtonText: 'Удалить',
                    cancelButtonText: 'Отмена',
                    background: '#181818',
                    color: '#fff'
                });
                
                if (confirm.isConfirmed) {
                    await supabase.from('playlist_tracks').delete().eq('playlist_id', playlist.id);
                    await supabase.from('playlists').delete().eq('id', playlist.id);
                    toast("Плейлист удалён");
                    loadPlaylists();
                }
            });

            grid.appendChild(card);
        }
    }

    /* Функция просмотра плейлиста */
    let currentPlaylistId = null;

    async function openPlaylistView(playlistId, playlistName) {
        currentPlaylistId = playlistId;
        document.getElementById('playlist-view-title').textContent = playlistName;
        const container = document.getElementById('playlist-tracks-list');
        container.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
        
        const { data: playlistTracks, error } = await supabase
            .from('playlist_tracks')
            .select('track_id')
            .eq('playlist_id', playlistId);
        
        if (error) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Ошибка загрузки</p>';
            return;
        }
        
        if (!playlistTracks.length) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">В плейлисте нет треков</p>';
            document.getElementById('playlist-view-modal').style.display = 'flex';
            return;
        }
        
        const trackIds = playlistTracks.map(item => item.track_id);
        
        const { data: tracks } = await supabase
            .from('tracks')
            .select('*')
            .in('id', trackIds);
        
        if (!tracks || !tracks.length) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Треки не найдены</p>';
            document.getElementById('playlist-view-modal').style.display = 'flex';
            return;
        }
        
        const orderedTracks = trackIds.map(id => tracks.find(t => t.id === id)).filter(t => t);
        
        container.innerHTML = '';
        
        orderedTracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-track-item';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; width:100%;">
                    <div style="width:40px; height:40px; background:#282828; border-radius:4px; display:flex; align-items:center; justify-content:center;">
                        ${track.cover_url ? 
                            `<img src="${track.cover_url}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` : 
                            `<i class="fas fa-music" style="color:#7b2cbf;"></i>`
                        }
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:500;">${track.title}</div>
                        <div style="font-size:11px; color:#888;">${track.artist}</div>
                    </div>
                    <button class="remove-from-playlist-btn" data-playlist-id="${playlistId}" data-track-id="${track.id}" style="background:none; border:none; color:#b3b3b3; cursor:pointer; padding:8px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.remove-from-playlist-btn')) return;
                currentPlaylist = orderedTracks;
                currentTrackIndex = index;
                playTrack(currentTrackIndex);
                document.getElementById('playlist-view-modal').style.display = 'none';
            });
            
            container.appendChild(item);
        });
        
        document.querySelectorAll('.remove-from-playlist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const playlistId = btn.dataset.playlistId;
                const trackId = btn.dataset.trackId;
                
                await supabase
                    .from('playlist_tracks')
                    .delete()
                    .eq('playlist_id', playlistId)
                    .eq('track_id', trackId);
                
                toast("Трек удалён из плейлиста");
                openPlaylistView(playlistId, playlistName);
                loadPlaylists();
            });
        });
        
        document.getElementById('playlist-view-modal').style.display = 'flex';
    }

    document.getElementById('close-playlist-view')?.addEventListener('click', () => {
        document.getElementById('playlist-view-modal').style.display = 'none';
    });

    /* Редактирование плейлиста */
    let currentEditPlaylistId = null;
    let currentEditPlaylistCoverUrl = null;

    document.getElementById('edit-playlist')?.addEventListener('click', () => {
        if (!currentPlaylistId) return;
        showEditPlaylistModal(currentPlaylistId);
    });

    async function showEditPlaylistModal(playlistId) {
        currentEditPlaylistId = playlistId;
        
        const { data: playlist } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single();
        
        if (!playlist) return;
        
        document.getElementById('edit-playlist-name').value = playlist.name;
        currentEditPlaylistCoverUrl = playlist.cover_url || null;
        
        const previewDiv = document.getElementById('edit-playlist-cover-preview');
        const previewImg = document.getElementById('edit-playlist-cover-preview-img');
        const previewText = document.getElementById('edit-playlist-cover-text');
        
        if (currentEditPlaylistCoverUrl) {
            previewImg.src = currentEditPlaylistCoverUrl;
            previewDiv.style.display = 'block';
            previewText.textContent = 'Текущая обложка';
        } else {
            previewDiv.style.display = 'none';
        }
        
        document.getElementById('edit-playlist-cover').value = '';
        document.getElementById('edit-playlist-cover-name-display').textContent = 'Выбрать новую обложку';
        document.getElementById('edit-playlist-cover-name-display').style.color = '#b3b3b3';
        document.getElementById('edit-playlist-new-cover-preview').style.display = 'none';
        
        document.getElementById('edit-playlist-modal').style.display = 'flex';
    }

    document.getElementById('edit-playlist-cover')?.addEventListener('change', function() {
        const newPreviewDiv = document.getElementById('edit-playlist-new-cover-preview');
        const newPreviewImg = document.getElementById('edit-playlist-new-cover-preview-img');
        const nameDisplay = document.getElementById('edit-playlist-cover-name-display');
        
        if (this.files && this.files[0]) {
            const file = this.files[0];
            nameDisplay.textContent = file.name;
            nameDisplay.style.color = '#7b2cbf';
            
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviewImg.src = e.target.result;
                newPreviewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            nameDisplay.textContent = 'Выбрать новую обложку';
            nameDisplay.style.color = '#b3b3b3';
            newPreviewDiv.style.display = 'none';
            newPreviewImg.src = '';
        }
    });

    document.getElementById('save-playlist-edit')?.addEventListener('click', async () => {
        const newName = document.getElementById('edit-playlist-name').value.trim();
        if (!newName) {
            toast("Введите название", "error");
            return;
        }
        
        let newCoverUrl = currentEditPlaylistCoverUrl;
        const newCoverFile = document.getElementById('edit-playlist-cover').files[0];
        
        if (newCoverFile) {
            const cleanName = newCoverFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const coverFileName = `playlist_${Date.now()}_${cleanName}`;
            const { error: coverError } = await supabase.storage
                .from('covers')
                .upload(coverFileName, newCoverFile, { upsert: true });
            
            if (!coverError) {
                const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
                newCoverUrl = coverUrlData.publicUrl;
            }
        }
        
        const { error } = await supabase
            .from('playlists')
            .update({ name: newName, cover_url: newCoverUrl })
            .eq('id', currentEditPlaylistId);
        
        if (error) {
            toast("Ошибка сохранения", "error");
        } else {
            toast("Плейлист обновлён");
            document.getElementById('edit-playlist-modal').style.display = 'none';
            document.getElementById('playlist-view-modal').style.display = 'none';
            loadPlaylists();
        }
    });

    document.getElementById('cancel-playlist-edit')?.addEventListener('click', () => {
        document.getElementById('edit-playlist-modal').style.display = 'none';
        document.getElementById('edit-playlist-cover').value = '';
        document.getElementById('edit-playlist-cover-name-display').textContent = 'Выбрать новую обложку';
        document.getElementById('edit-playlist-cover-name-display').style.color = '#b3b3b3';
        document.getElementById('edit-playlist-new-cover-preview').style.display = 'none';
        document.getElementById('edit-playlist-new-cover-preview-img').src = '';
    });

    /* Удаление плейлиста */
    document.getElementById('delete-playlist')?.addEventListener('click', async () => {
        const playlistId = currentPlaylistId;
        const confirm = await Swal.fire({
            title: 'Удалить плейлист?',
            text: 'Треки при этом не удалятся',
            icon: 'warning',
            iconColor: '#9b2c3d',
            showCancelButton: true,
            confirmButtonColor: '#9b2c3d',
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            background: '#181818',
            color: '#fff'
        });
        
        if (confirm.isConfirmed) {
        
            await supabase
                .from('playlist_tracks')
                .delete()
                .eq('playlist_id', playlistId);
            

            await supabase
                .from('playlists')
                .delete()
                .eq('id', playlistId);
            
            toast("Плейлист удалён");
            document.getElementById('playlist-view-modal').style.display = 'none';
            loadPlaylists();
        }
    });

    /* Функция воспроизведения плейлиста */
    async function playPlaylist(playlistId) {
        
        const { data: playlistTracks, error: linkError } = await supabase
            .from('playlist_tracks')
            .select('track_id')
            .eq('playlist_id', playlistId);
        
        if (linkError || !playlistTracks.length) {
            toast("В плейлисте нет треков", "error");
            return;
        }
        
        const trackIds = playlistTracks.map(item => item.track_id);
        
        const { data: tracks, error: tracksError } = await supabase
            .from('tracks')
            .select('*')
            .in('id', trackIds);
        
        if (tracksError) {
            toast("Ошибка загрузки треков", "error");
            return;
        }
        
        const orderedTracks = trackIds.map(id => tracks.find(t => t.id === id)).filter(t => t);
        
        if (!orderedTracks.length) {
            toast("Не удалось загрузить треки", "error");
            return;
        }
        
        currentPlaylist = orderedTracks;
        currentTrackIndex = 0;
        isShuffle = false;
        isRepeat = false;
        updateControlStyles();
        
        playTrack(0);
        
        if (queueOverlay.classList.contains('active')) {
            renderQueue();
        }
    }

    /* Кнопка "Треки" */
    filterAll?.addEventListener('click', () => {
        switchLibrarySection(filterAll, 'tracks');
        loadUserTracks();
    });

    /* Кнопка "Любимое" */
    filterLiked?.addEventListener('click', () => {
        switchLibrarySection(filterLiked, 'tracks');
        loadUserTracks();
    });

    /* Кнопка "Плейлисты" */
    filterPlaylists?.addEventListener('click', () => {
        switchLibrarySection(filterPlaylists, 'playlists');
    });

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

    /* Отображение обложки при загрузке трека */
    trackCoverInput?.addEventListener('change', () => {
        if (trackCoverInput.files.length > 0) {
            coverNameDisplay.textContent = trackCoverInput.files[0].name;
            coverNameDisplay.style.color = "#7b2cbf";
        } else {
            coverNameDisplay.textContent = "Выберите обложку (необязательно)";
            coverNameDisplay.style.color = "#b3b3b3";
        }
    });

    /* Предпросмотр обложки */
    if (trackCoverInput) {
        trackCoverInput.addEventListener('change', function() {
            const previewDiv = document.getElementById('cover-preview');
            const previewImg = document.getElementById('cover-preview-img');
            
            if (this.files && this.files[0]) {
                const file = this.files[0];
                coverNameDisplay.textContent = file.name;
                coverNameDisplay.style.color = '#7b2cbf';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    previewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                coverNameDisplay.textContent = 'Выберите обложку (необязательно)';
                coverNameDisplay.style.color = '#b3b3b3';
                previewDiv.style.display = 'none';
                previewImg.src = '';
            }
        });
    }

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

        allUserTracks = [];
        currentPlaylist = [];
        currentTrackIndex = -1;

        hidePlayer();

        const tracksGrid = document.getElementById('tracks-list');
        const playlistsGrid = document.getElementById('playlists-grid');
        if (tracksGrid) tracksGrid.innerHTML = '';
        if (playlistsGrid) playlistsGrid.innerHTML = '';
        
        audioPlayer.pause();
        audioPlayer.src = '';
        document.querySelector('.track-name').textContent = 'Название трека';
        document.querySelector('.track-artist').textContent = 'Имя исполнителя';
        updateLikeVisuals(false);
        
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
            toast("Войдите в аккаунт", "error");
            return;
        }           
        uploadFormContainer.style.display = 'flex';
    });

    cancelUploadButton?.addEventListener('click', () => {
        uploadFormContainer.style.display = 'none';
        trackTitleInput.value = '';
        trackArtistInput.value = '';
        trackFileInput.value = '';
        trackCoverInput.value = '';
        fileNameDisplay.textContent = 'Выберите аудиофайл (MP3, WAV)';
        fileNameDisplay.style.color = '#b3b3b3';
        coverNameDisplay.textContent = 'Выберите обложку (необязательно)';
        coverNameDisplay.style.color = '#b3b3b3';
        document.getElementById('cover-preview').style.display = 'none';
        document.getElementById('cover-preview-img').src = '';
    });

    /* Загрузка трека в базу данных Supabase */
    startUploadButton?.addEventListener('click', async () => {

        const file = trackFileInput.files[0];
        const coverFile = trackCoverInput.files[0];
        const title = trackTitleInput.value.trim();
        const artist = trackArtistInput.value.trim();

        if (!file || !title) {
            toast("Укажите название и выберите файл", "error");
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
        
            /* Загрузка обложки */
            let coverUrl = null;
            if (coverFile) {
                /* Очищаем название файла от спецсимволов и пробелов */
                const cleanName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const coverFileName = `${Date.now()}_${cleanName}`;
                
                const { data: coverData, error: coverError } = await supabase.storage
                    .from('covers')
                    .upload(coverFileName, coverFile, { 
                        cacheControl: '3600', 
                        upsert: true,
                    });
                
                if (coverError) {
                    console.error("Ошибка загрузки обложки:", coverError);
                    toast("Ошибка загрузки обложки", "error");
                } else {
                    const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
                    coverUrl = coverUrlData.publicUrl;
                }
            }

            /* Запись в таблицу tracks */
            const { error: dbError } = await supabase
                .from('tracks')
                .insert([{
                    title: title,
                    artist: artist || "Неизвестен",
                    file_url: urlData.publicUrl,
                    cover_url: coverUrl,
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

        /* Для отображения в медиатеке "Любимого" */
        if (filterLiked.classList.contains('active')) {
            const likedTracks = currentPlaylist.filter(t => t.is_liked);

            if (likedTracks.length === 0) {
                tracksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>Любимых треков пока нет</h3>
                        <p>Нажимайте на сердечко у треков, чтобы сохранять их здесь</p>
                    </div>
                `;
            } else {
                renderTracks(likedTracks);
            }
        }
    });

    /* Визуальное обновление кнопки "Лайк" в зависимости от статуса */
    function updateLikeVisuals(isLiked) {
        const btn = document.querySelector('.like-button');
        if (!btn) return;
        
        const icon = btn.querySelector('i');
        if (!icon) return;

        if (isLiked) {
            btn.classList.add('liked');
            icon.classList.replace('fa-regular', 'fa-solid');
        } else {
            btn.classList.remove('liked');
            icon.classList.replace('fa-solid', 'fa-regular');
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

        if (!currentUser) {
            allUserTracks = [];
            sortAndRenderTracks();
            currentPlaylist = [];
            hidePlayer();
            tracksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lock"></i>
                    <h3>Требуется авторизация</h3>
                    <p>Войдите в аккаунт, чтобы увидеть свои треки</p>
                </div>
            `;
            return;
        }

        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('user_id', currentUser);

        if (error) return;

        allUserTracks = tracks || [];
        currentPlaylist = [...allUserTracks];
        
        if (allUserTracks.length === 0) {
            hidePlayer();
            tracksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-compact-disc"></i>
                    <h3>Здесь пока ничего нет</h3>
                    <p>Загрузите свой первый трек, чтобы начать создание коллекции</p>
                </div>
            `;
            return;
        }
        
        if (filterLiked?.classList.contains('active')) {
            const likedTracks = allUserTracks.filter(t => t.is_liked);
            if (likedTracks.length === 0) {
                tracksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>Любимых треков пока нет</h3>
                        <p>Нажимайте на сердечко у треков, чтобы сохранять их здесь</p>
                    </div>
                `;
            } else {
                renderTracks(likedTracks);
            }
        } else {
            renderTracks(allUserTracks);
        }
    }

    /* Функция рендера треков на странице медиатеки */
    function renderTracks(tracks) {
        const tracksList = document.getElementById('tracks-list');
        if (!tracksList) return;
        tracksList.innerHTML = '';

        tracks.forEach((track, index) => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <button class="track-menu-trigger">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="track-context-menu">
                    <button class="edit-track-btn" data-track-id="${track.id}" data-track-index="${index}">
                        <i class="fas fa-pen"></i> Редактировать
                    </button>
                    <button class="add-to-playlist-btn" data-track-id="${track.id}" data-track-index="${index}">
                        <i class="fas fa-folder-plus"></i> Добавить в плейлист
                    </button>
                    <button class="delete-track-btn" data-track-id="${track.id}" data-track-index="${index}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
                <div class="card-image">
                    ${track.cover_url ? 
                        `<img src="${track.cover_url}" alt="cover" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : 
                        `<i class="fa-solid fa-music"></i>`
                    }
                </div>
                <div class="card-info">
                    <div class="track-title-text">${track.title}</div>
                    <div class="track-author">${track.artist}</div>
                </div>
            `;

            /* Клик по карточке - воспроизведение */
            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger, .track-context-menu, .edit-track-btn, .add-to-playlist-btn, .delete-track-btn')) return;
                if (!track.file_url) return;
                currentPlaylist = tracks;
                currentTrackIndex = index;
                playTrack(currentTrackIndex);
            });

            /* Кнопка "Три точки" (открытие/закрытие меню) */
            const menuTrigger = card.querySelector('.track-menu-trigger');
            const contextMenu = card.querySelector('.track-context-menu');
            
            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.track-context-menu.active').forEach(menu => {
                    if (menu !== contextMenu) menu.classList.remove('active');
                });
                contextMenu.classList.toggle('active');
            });

            tracksList.appendChild(card);
        });
        
        /* Закрытие меню при клике вне карточки */
        document.addEventListener('click', () => {
            document.querySelectorAll('.track-context-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        });
    }
    
    /* Функция для воспроизведения трека по индексу*/
    function playTrack(index) {
        if (index < 0 || index >= currentPlaylist.length) return;

        showPlayer();
        
        const track = currentPlaylist[index];

        audioPlayer.pause();
        audioPlayer.src = track.file_url;
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Ошибка воспроизведения:", err);
                }
            });
        }

        document.querySelector('.track-name').textContent = track.title;
        document.querySelector('.track-artist').textContent = track.artist;

        const trackCoverElement = document.querySelector('.track-cover');
        if (track.cover_url) {
            trackCoverElement.style.backgroundImage = `url(${track.cover_url})`;
            trackCoverElement.style.backgroundSize = 'cover';
            trackCoverElement.style.backgroundPosition = 'center';
            trackCoverElement.style.backgroundColor = 'transparent';
        } else {
            trackCoverElement.style.backgroundImage = '';
            trackCoverElement.style.backgroundColor = '#333';
        }

        /* Обновление визуального состояния кнопки "Лайк" в зависимости от статуса текущего трека */
        updateLikeVisuals(track.is_liked);

        if (queueOverlay.classList.contains('active')) {
            renderQueue();
        }
    }

    /* Автоматическое переключение на следующий трек после окончания текущего */
    audioPlayer.addEventListener('ended', () => {
        if (isRepeat) {
            playTrack(currentTrackIndex);
        }
        else if (isShuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * currentPlaylist.length);
            } while (randomIndex === currentTrackIndex);
            currentTrackIndex = randomIndex;
            playTrack(currentTrackIndex);
        }
        else {
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        }
    });

    /* Кнопка "Вперед" */
    document.querySelector('.next-button').onclick = () => {
        if (currentPlaylist.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
        playTrack(currentTrackIndex);
    };
    /* Кнопка "Назад" */
    document.querySelector('.prev-button').onclick = () => {
        if (currentPlaylist.length === 0) return;
        currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playTrack(currentTrackIndex);
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
            const currentTrack = currentPlaylist[currentTrackIndex];
            let otherTracks = currentPlaylist.filter((_, index) => index !== currentTrackIndex);
            for (let i = otherTracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
            }
            currentPlaylist = [currentTrack, ...otherTracks];
            currentTrackIndex = 0;
        }
        updateControlStyles();
        if (queueOverlay.classList.contains('active')) {
            renderQueue();
        }
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
            displayTracks = [currentPlaylist[currentTrackIndex]];
        } else {
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

    /* Сортировка(общая для треков и плейлистов) */
    let currentSort = 'newest';

    function sortAndRenderTracks() {
        if (!allUserTracks.length) return;
        
        let sorted = [...allUserTracks];
        
        if (!currentSort || currentSort === 'default') {
            renderTracks(allUserTracks);
            return;
        }
        
        switch(currentSort) {
            case 'newest':
                sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            case 'oldest':
                sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
                break;
            case 'title':
                sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'artist':
                sorted.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
                break;
        }
        
        if (filterLiked?.classList.contains('active')) {
            renderTracks(sorted.filter(t => t.is_liked));
        } else {
            renderTracks(sorted);
        }
    }

    document.querySelectorAll('.sort-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortType = btn.dataset.sort;
            
            if (btn.classList.contains('active')) {
                currentSort = 'default';
                document.querySelectorAll('.sort-button').forEach(b => b.classList.remove('active'));
            } else {
                currentSort = sortType;
                document.querySelectorAll('.sort-button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            
            sortAndRenderTracks();
        });
    });

    /* Управление видимостью плеера */
    function showPlayer() {
        const player = document.querySelector('.player');
        player.classList.add('visible');
    }

    function hidePlayer() {
        const player = document.querySelector('.player');
        player.classList.remove('visible');
    }

    /* Глобальное делегирование для кнопок контекстного меню треков */
    document.body.addEventListener('click', async (e) => {
        /* Редактирование трека */
        const editBtn = e.target.closest('.edit-track-btn');
        if (editBtn) {
            e.stopPropagation();
            const card = editBtn.closest('.track-card');
            const trackId = editBtn.dataset.trackId;
            const trackTitle = card?.querySelector('.track-title-text')?.textContent;
            const trackArtist = card?.querySelector('.track-author')?.textContent;
            if (trackId) {
                card?.querySelector('.track-context-menu')?.classList.remove('active');
                showEditTrackModal(trackId, trackTitle, trackArtist);
            }
            return;
        }
        
        /* Добавление в плейлист */
        const addBtn = e.target.closest('.add-to-playlist-btn');
        if (addBtn) {
            e.stopPropagation();
            const card = addBtn.closest('.track-card');
            const trackId = addBtn.dataset.trackId;
            const trackTitle = card?.querySelector('.track-title-text')?.textContent;
            const trackArtist = card?.querySelector('.track-author')?.textContent;
            if (trackId) {
                card?.querySelector('.track-context-menu')?.classList.remove('active');
                showAddToPlaylistModal(trackId, trackTitle, trackArtist);
            }
            return;
        }
        
        /* Удаление трека */
        const deleteBtn = e.target.closest('.delete-track-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const card = deleteBtn.closest('.track-card');
            const trackId = deleteBtn.dataset.trackId;
            if (trackId) {
                card?.querySelector('.track-context-menu')?.classList.remove('active');
                const track = allUserTracks.find(t => t.id == trackId);
                if (track) {
                    const confirm = await Swal.fire({
                        title: 'Удалить трек?',
                        text: 'Трек будет удалён из библиотеки и всех плейлистов',
                        icon: 'warning',
                        iconColor: '#9b2c3d',
                        showCancelButton: true,
                        confirmButtonColor: '#9b2c3d',
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        background: '#181818',
                        color: '#fff'
                    });
                    if (confirm.isConfirmed) {
                        try {
                            await supabase.from('playlist_tracks').delete().eq('track_id', track.id);
                            await supabase.from('tracks').delete().eq('id', track.id);
                            if (track.file_url) {
                                const filePath = track.file_url.split('/').pop();
                                await supabase.storage.from('songs').remove([filePath]);
                            }
                            if (track.cover_url) {
                                const coverPath = track.cover_url.split('/').pop();
                                await supabase.storage.from('covers').remove([coverPath]);
                            }
                            toast("Трек удалён");
                            allUserTracks = allUserTracks.filter(t => t.id !== track.id);
                            currentPlaylist = currentPlaylist.filter(t => t.id !== track.id);
                            if (filterLiked?.classList.contains('active')) {
                                renderTracks(allUserTracks.filter(t => t.is_liked));
                            } else {
                                renderTracks(allUserTracks);
                            }
                            loadPlaylists();
                            if (currentTrackIndex !== -1 && currentPlaylist[currentTrackIndex]?.id === track.id) {
                                if (currentPlaylist.length > 0) playTrack(0);
                                else hidePlayer();
                            }
                        } catch (err) {
                            console.error(err);
                            toast("Ошибка при удалении", "error");
                        }
                    }
                }
            }
            return;
        }
    });
});