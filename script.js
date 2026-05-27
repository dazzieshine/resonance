window.addEventListener('DOMContentLoaded', () => {

    /* SUPABASE */
    const supabaseUrl = 'https://fiyribauhmrqxrhrcdll.supabase.co';
    const supabaseKey = 'sb_publishable_ZpadGEdXoMzEuuBCqTyfEA_LJUfMLA7';
    const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;
    if (!supabase) console.error("Критическая ошибка: библиотека Supabase не найдена!");

    /* ЭЛЕМЕНТЫ СТРАНИЦЫ */
    const navLinks = document.querySelectorAll('.nav-menu a');
    const allSections = document.querySelectorAll('.content-section');
    const homeView = document.getElementById('home-view');
    const libraryView = document.getElementById('library-view');
    const loginView = document.getElementById('login-view');
    const regView = document.getElementById('registration-view');
    const profileView = document.getElementById('profile-view');

    const uploadFormContainer = document.getElementById('upload-form-container');
    const openUploadModalButton = document.getElementById('open-upload-modal');
    const startUploadButton = document.getElementById('start-upload-button');
    const trackTitleInput = document.getElementById('track-title');
    const trackArtistInput = document.getElementById('track-artist');
    const trackFileInput = document.getElementById('track-file');

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

    const queueOverlay = document.getElementById('queue-overlay');
    const queueBtn = document.querySelector('.queue-button');
    const closeQueue = document.getElementById('close-queue');

    const filterAll = document.getElementById('filter-all');
    const filterLiked = document.getElementById('filter-liked');
    const filterPlaylists = document.getElementById('filter-playlists');
    const tracksList = document.getElementById('tracks-list');
    const playlistsViewContainer = document.getElementById('playlists-view-container');
    const createPlaylistButton = document.getElementById('create-playlist-button');

    const playlistFormContainer = document.getElementById('playlist-form-container');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const savePlaylistButton = document.getElementById('save-playlist-button');
    const closePlaylistModal = document.getElementById('close-playlist-modal');

    let currentEditCoverUrl = null;

    let isRegistered = false;
    let currentUser = localStorage.getItem('my_user_uuid') || null;
    if (currentUser) isRegistered = true;

    let allUserTracks = [];
    let currentPlaylist = [];
    let currentTrackIndex = -1;
    let currentTrackId = null;
    let isRepeat = false;
    let isShuffle = false;
    let currentEditTrackId = null;
    let searchQuery = '';
    let originalPlaylists = [];

    /* БЫСТРОДЕЙСТВИЕ */

    // Защита от XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Очистка кеша при изменениях
    function clearCache() {
        if (currentUser) {
            localStorage.removeItem(`cached_tracks_${currentUser}`);
            localStorage.removeItem(`cached_playlists_${currentUser}`);
        }
    }

    // Кеширование треков
    function cacheTracks(tracks) {
        if (!currentUser) return;
        localStorage.setItem(`cached_tracks_${currentUser}`, JSON.stringify({
            data: tracks,
            timestamp: Date.now()
        }));
    }

    function loadCachedTracks() {
        if (!currentUser) return null;
        const cached = localStorage.getItem(`cached_tracks_${currentUser}`);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        // Кеш живёт 5 минут
        if (Date.now() - timestamp > 30 * 60 * 1000) return null;
        
        return data;
    }

    // Кеширование плейлистов
    function cachePlaylists(playlists) {
        if (!currentUser) return;
        localStorage.setItem(`cached_playlists_${currentUser}`, JSON.stringify({
            data: playlists,
            timestamp: Date.now()
        }));
    }

    function loadCachedPlaylists() {
        if (!currentUser) return null;
        const cached = localStorage.getItem(`cached_playlists_${currentUser}`);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > 5 * 60 * 1000) return null;
        
        return data;
    }

    createPlaylistButton?.addEventListener('click', () => {
        if (!currentUser) { 
            toast("Войдите в аккаунт", "error"); 
            return; 
        }
        if (!allUserTracks.length) {
            toast("Сначала загрузите хотя бы один трек", "error");
            return;
        }
        playlistFormContainer.style.display = 'flex';
        playlistNameInput.value = '';
        playlistNameInput.focus();
        renderPlaylistTracks();
    });

    /* DRAG & DROP */
    function setupImageSquare(squareId, fileInputId, previewImgId, placeholderId, onFileSelect) {
        const square = document.getElementById(squareId);
        const fileInput = document.getElementById(fileInputId);
        const previewImg = document.getElementById(previewImgId);
        const placeholder = document.getElementById(placeholderId);
        if (!square || !fileInput) return;

        function updateDisplay(file) {
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    if (placeholder) placeholder.style.display = 'none';
                    square.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            } else {
                previewImg.style.display = 'none';
                if (placeholder) placeholder.style.display = 'flex';
                square.classList.remove('has-image');
            }
            if (onFileSelect) onFileSelect(file);
        }

        square.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0] || null;
            updateDisplay(file);
        });
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
            square.classList.add('drag-over');
        });
        square.addEventListener('dragleave', () => square.classList.remove('drag-over'));
        square.addEventListener('drop', (e) => {
            e.preventDefault();
            square.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (validTypes.includes(file.type)) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    updateDisplay(file);
                } else {
                    toast("Неподдерживаемый формат", "error");
                }
            }
        });
    }

    setupImageSquare('track-cover-square', 'track-cover-input', 'track-cover-preview', 'track-cover-placeholder', (file) => {
        window.newTrackCover = file;
    });

    setupImageSquare('edit-cover-square', 'edit-track-cover-input', 'edit-cover-preview', 'edit-cover-placeholder', (file) => {
        window.newEditCover = file;
    });

    setupImageSquare('playlist-cover-square', 'playlist-cover-input', 'playlist-cover-preview', 'playlist-cover-placeholder', (file) => {
        window.newPlaylistCover = file;
    });

    setupImageSquare('edit-playlist-cover-square', 'edit-playlist-cover-input', 'edit-playlist-cover-preview', 'edit-playlist-cover-placeholder', (file) => {
        window.newEditPlaylistCover = file;
    });

    setupImageSquare('avatar-square', 'edit-profile-avatar-input', 'avatar-preview', 'avatar-placeholder', (file) => {
        window.newAvatarFile = file;
    });

    function setupDragAndDrop(zoneId, fileInputId, options = {}) {
        const zone = document.getElementById(zoneId);
        const fileInput = document.getElementById(fileInputId);
        if (!zone || !fileInput) return;

        const { onFileSelect = null, filenameSpanId = null } = options;

        function updateDisplay(file) {
            if (filenameSpanId) {
                const span = document.getElementById(filenameSpanId);
                if (span) span.textContent = file ? file.name : '';
            }
            zone.classList.toggle('has-file', !!file);
        }

        zone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0] || null;
            updateDisplay(file);
            if (onFileSelect) onFileSelect(file);
        });
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const acceptAttr = fileInput.accept;
                const isValid = !acceptAttr || acceptAttr.split(',').some(type => {
                    if (type.startsWith('.')) return file.name.endsWith(type);
                    if (type.includes('/')) return file.type === type;
                    return false;
                });
                if (isValid) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    updateDisplay(file);
                    if (onFileSelect) onFileSelect(file);
                } else {
                    toast("Неподдерживаемый формат", "error");
                }
            }
        });
    }

    setupDragAndDrop('audio-dropzone', 'track-file', {
        filenameSpanId: 'dropzone-filename',
        onFileSelect: (file) => {
        }
    });

    /* ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ */
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

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < minLength) return "Пароль должен быть не короче 8 символов";
        if (!hasUpperCase) return "Добавьте хотя бы одну заглавную букву";
        if (!hasNumber) return "Добавьте хотя бы одну цифру";
        return null;
    }

    function hideAllSections() {
        allSections.forEach(s => s.style.display = 'none');
    }

    function showPlayer() {
        document.querySelector('.player').classList.add('visible');
    }
    function hidePlayer() {
        document.querySelector('.player').classList.remove('visible');
    }

    function updateControlStyles() {
        shuffleBtn.style.color = isShuffle ? '#a855f7' : '#fff';
        repeatBtn.style.color = isRepeat ? '#a855f7' : '#fff';
    }

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

    const formatTime = (sec) => {
        if (isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    };

    /* ПЛЕЕР */
    const onMouseMove = (e) => {
        if (!isDragging || !activeBar) return;
        
        const rect = activeBar.getBoundingClientRect();
        let p = ((e.clientX - rect.left) / rect.width) * 100;
        p = Math.max(0, Math.min(100, p));
        
        activeFill.style.width = p + '%';
        if (activeHandle) activeHandle.style.left = p + '%';
        
        if (activeBar.classList.contains('progress-bar') && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
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
            
            const rect = bar.getBoundingClientRect();
            let p = ((e.clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            fill.style.width = p + '%';
            if (handle) handle.style.left = p + '%';
            
            if (bar.classList.contains('progress-bar') && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
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

    playPauseBtn.addEventListener('click', () => {
        if (!audioPlayer.src) return;
        
        if (audioPlayer.paused) {
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                });
            }
        } else {
            audioPlayer.pause();
        }
    });

    audioPlayer.addEventListener('play', () => playPauseIcon.classList.replace('fa-play', 'fa-pause'));
    audioPlayer.addEventListener('pause', () => playPauseIcon.classList.replace('fa-pause', 'fa-play'));
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
        
        // Сохраняем длительность трека
        const currentTrackObj = currentPlaylist[currentTrackIndex];
        if (currentTrackObj && !currentTrackObj.duration) {
            const duration = Math.floor(audioPlayer.duration);
            currentTrackObj.duration = duration;
            
            // Обновляем в allUserTracks
            const trackInAll = allUserTracks.find(t => t.id === currentTrackObj.id);
            if (trackInAll) trackInAll.duration = duration;
            
            // Сохраняем в localStorage
            const durations = JSON.parse(localStorage.getItem('track_durations') || '{}');
            durations[currentTrackObj.id] = duration;
            localStorage.setItem('track_durations', JSON.stringify(durations));
            updateHomePage();
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (isRepeat) playTrack(currentTrackIndex);
        else if (isShuffle) {
            let randomIndex;
            do { randomIndex = Math.floor(Math.random() * currentPlaylist.length); } while (randomIndex === currentTrackIndex);
            currentTrackIndex = randomIndex;
            playTrack(currentTrackIndex);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        }
    });

    document.querySelector('.next-button').onclick = () => {
        if (currentPlaylist.length) {
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        }
    };
    document.querySelector('.prev-button').onclick = () => {
        if (currentPlaylist.length) {
            currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        }
    };

    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        if (isRepeat) isShuffle = false;
        updateControlStyles();
        if (queueOverlay.classList.contains('active')) renderQueue();
    });
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        if (isShuffle) {
            isRepeat = false;
            const currentTrack = currentPlaylist[currentTrackIndex];
            let otherTracks = currentPlaylist.filter((_, idx) => idx !== currentTrackIndex);
            for (let i = otherTracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
            }
            currentPlaylist = [currentTrack, ...otherTracks];
            currentTrackIndex = 0;
        }
        updateControlStyles();
        if (queueOverlay.classList.contains('active')) renderQueue();
    });

    let lastVolume = 70, isMuted = false;
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

    const likeBtn = document.querySelector('.like-button');
    likeBtn.addEventListener('click', async () => {
        if (!currentTrackId) return;
        
        const track = allUserTracks.find(t => t.id === currentTrackId);
        if (!track) return;
        
        const newStatus = !track.is_liked;
        track.is_liked = newStatus;
        updateLikeVisuals(newStatus);
        
        const { error } = await supabase.from('tracks').update({ is_liked: newStatus }).eq('id', currentTrackId);
        if (error) {
            track.is_liked = !newStatus;
            updateLikeVisuals(!newStatus);
            toast("Не удалось сохранить лайк", "error");
            return;
        }
        
        const currentTrackInPlaylist = currentPlaylist.find(t => t.id === currentTrackId);
        if (currentTrackInPlaylist) currentTrackInPlaylist.is_liked = newStatus;
        
        clearCache();
        
        updateHomePage();
        loadRecommendations();
        
        if (filterLiked.classList.contains('active')) {
            filterItems();
        }
        
        if (libraryView.style.display === 'block') {
            if (filterLiked.classList.contains('active')) {
                renderTracks(allUserTracks.filter(t => t.is_liked));
            } else {
                renderTracks(allUserTracks);
            }
        }
        
        if (profileView.style.display === 'block') {
            loadProfileStatsAndAvatar();
        }

        refreshAllData();
    });

    /* УНИВЕРСАЛЬНОЕ ОБНОВЛЕНИЕ ВСЕГО */
    function refreshAllData() {
        updateHomePage();
        loadRecommendations();
        loadRecentTracks();
        
        if (libraryView.style.display === 'block') {
            if (filterLiked.classList.contains('active')) {
                renderTracks(allUserTracks.filter(t => t.is_liked));
            } else {
                renderTracks(allUserTracks);
            }
        }
        
        if (filterPlaylists.classList.contains('active')) {
            loadPlaylists();
        }
        
        if (profileView.style.display === 'block') {
            loadProfileStatsAndAvatar();
        }
        
        clearCache();
    }

    /* ОЧЕРЕДЬ */
    function renderQueue() {
        const queueList = document.getElementById('queue-list');
        queueList.innerHTML = '';
        let displayTracks = isRepeat ? [currentPlaylist[currentTrackIndex]] : currentPlaylist;
        displayTracks.forEach((track, index) => {
            const isCurrent = (track.id === currentPlaylist[currentTrackIndex]?.id);
            const item = document.createElement('div');
            item.className = `queue-item ${isCurrent ? 'current' : ''}`;
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; width:100%;">
                    <span style="opacity:0.5; width:20px; font-size:12px;">${index + 1}</span>
                    <div style="flex-grow:1; overflow:hidden;">
                        <div style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${track.title || 'Без названия'}</div>
                        <div style="font-size:11px; opacity:0.6;">${track.artist || 'Неизвестен'}</div>
                    </div>
                    ${isCurrent ? `<i class="fas ${isRepeat ? 'fa-redo-alt' : 'fa-volume-up'}" style="color:#a855f7"></i>` : ''}
                </div>
            `;
            item.onclick = () => {
                const mainIndex = currentPlaylist.findIndex(t => t.id === track.id);
                currentTrackIndex = mainIndex;
                playTrack(currentTrackIndex);
            };
            queueList.appendChild(item);
        });
    }
    queueBtn.onclick = (e) => {
        e.stopPropagation();
        if (queueOverlay.classList.contains('active')) queueOverlay.classList.remove('active');
        else { renderQueue(); queueOverlay.classList.add('active'); }
    };
    closeQueue.onclick = () => queueOverlay.classList.remove('active');

    /* ПРОФИЛЬ И СТАТИСТИКА */
    async function loadProfileStatsAndAvatar() {
        if (!currentUser) {
            const avatarImg = document.getElementById('avatar-img');
            const avatarIcon = document.getElementById('avatar-icon');
            if (avatarImg) {
                avatarImg.style.display = 'none';
                avatarImg.src = '';
            }
            if (avatarIcon) avatarIcon.style.display = 'block';
            return;
        }
        
        const statTracks = document.getElementById('stat-tracks');
        const statPlaylists = document.getElementById('stat-playlists');
        const statLiked = document.getElementById('stat-liked');
        const avatarImg = document.getElementById('avatar-img');
        const avatarIcon = document.getElementById('avatar-icon');
        const profileDisplayName = document.getElementById('profile-display-name');
        const profileUsername = document.getElementById('profile-username');

        const { data: userData, error } = await supabase
            .from('users_data')
            .select('avatar_url, username, display_name')
            .eq('id', currentUser)
            .single();
        
        if (error || !userData) {
            console.error('Ошибка загрузки профиля:', error);
            const avatarImg = document.getElementById('avatar-img');
            const avatarIcon = document.getElementById('avatar-icon');
            if (avatarImg) avatarImg.style.display = 'none';
            if (avatarIcon) avatarIcon.style.display = 'block';
            return;
        }
        
        const displayName = userData.display_name || userData.username;
        localStorage.setItem('my_user_name', displayName);
        
        if (profileDisplayName) profileDisplayName.textContent = displayName;
        if (profileUsername) profileUsername.textContent = `@${userData.username}`;
        
        const { count: tracksCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('user_id', currentUser);
        const { count: playlistsCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('user_id', currentUser);
        const { count: likedCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('user_id', currentUser).eq('is_liked', true);
        
        if (statTracks) statTracks.textContent = tracksCount || 0;
        if (statPlaylists) statPlaylists.textContent = playlistsCount || 0;
        if (statLiked) statLiked.textContent = likedCount || 0;

        if (avatarImg && avatarIcon) {
            if (userData.avatar_url) {
                avatarImg.src = `${userData.avatar_url}?t=${Date.now()}`;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarIcon.style.display = 'block';
            }
        }
    }

    /* ТРЕКИ */
    async function loadUserTracks() {
        if (!currentUser) {
            allUserTracks = [];
            sortAndRenderTracks();
            currentPlaylist = [];
            hidePlayer();
            tracksList.innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Требуется авторизация</h3><p>Войдите в аккаунт, чтобы увидеть свои треки</p></div>`;
            return;
        }
        
        const cached = loadCachedTracks();
        if (cached) {
            allUserTracks = cached;
            currentPlaylist = [...allUserTracks];
            
            if (allUserTracks.length === 0) {
                hidePlayer();
                tracksList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><h3>Здесь пока ничего нет</h3><p>Загрузите свой первый трек</p></div>`;
                return;
            }
            
            renderTracks(allUserTracks);
            filterItems();
            updateHomePage();
            loadRecommendations();
            loadRecentTracks();
            return;
        }
        
        const { data: tracks } = await supabase
            .from('tracks')
            .select('id, title, artist, cover_url, file_url, is_liked, duration')
            .eq('user_id', currentUser);
        
        if (!tracks) return;
        
        allUserTracks = tracks;
        currentPlaylist = [...allUserTracks];
        cacheTracks(tracks);
        
        if (allUserTracks.length === 0) {
            hidePlayer();
            tracksList.innerHTML = `<div class="empty-state"><i class="fas fa-compact-disc"></i><h3>Здесь пока ничего нет</h3><p>Загрузите свой первый трек</p></div>`;
            return;
        }
        
        renderTracks(allUserTracks);
        filterItems();
        updateHomePage();
        loadRecommendations();
        loadRecentTracks();
    }

    function renderTracks(tracks) {
        if (!tracksList) return;
        tracksList.innerHTML = '';
        
        if (!tracks.length) {
            tracksList.innerHTML = `
                <div class="not-found-placeholder">
                    <i class="fas fa-search"></i>
                    <h3>Плейлисты не найдены</h3>
                    <p>По запросу "${searchQuery}" ничего не найдено</p>
                </div>
                `;
            return;
        }
        
        tracks.forEach((track, index) => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <button class="track-menu-trigger"><i class="fas fa-ellipsis-v"></i></button>
                <div class="track-context-menu">
                    <button class="edit-track-btn" data-track-id="${track.id}"><i class="fas fa-pen"></i> Редактировать</button>
                    <button class="add-to-playlist-btn" data-track-id="${track.id}"><i class="fas fa-folder-plus"></i> Добавить в плейлист</button>
                    <button class="delete-track-btn" data-track-id="${track.id}"><i class="fas fa-trash"></i> Удалить</button>
                </div>
                <div class="card-image">${track.cover_url ? `<img src="${track.cover_url}" alt="cover">` : '<i class="fa-solid fa-music"></i>'}</div>
                <div class="card-info"><div class="track-title-text">${track.title}</div><div class="track-author">${track.artist || 'Неизвестен'}</div></div>
                <div class="track-duration">${formatTime(track.duration || 0)}</div>
            `;
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger, .track-context-menu, .edit-track-btn, .add-to-playlist-btn, .delete-track-btn')) return;
                if (!track.file_url) return;
                currentPlaylist = tracks;
                currentTrackIndex = index;
                playTrack(currentTrackIndex);
            });
            
            const menuTrigger = card.querySelector('.track-menu-trigger');
            const contextMenu = card.querySelector('.track-context-menu');
            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.track-context-menu.active').forEach(menu => menu.classList.remove('active'));
                contextMenu.classList.toggle('active');
            });
            
            tracksList.appendChild(card);
        });
        
        document.addEventListener('click', () => {
            document.querySelectorAll('.track-context-menu.active').forEach(menu => menu.classList.remove('active'));
        });
    }

    function saveDurationHandler() {
        if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;
        
        const currentTrackObj = currentPlaylist[currentTrackIndex];
        if (!currentTrackObj) return;
        
        const duration = Math.floor(audioPlayer.duration);
    
        currentTrackObj.duration = duration;
        
        const trackInAll = allUserTracks.find(t => t.id === currentTrackObj.id);
        if (trackInAll) trackInAll.duration = duration;
        
        const durations = JSON.parse(localStorage.getItem('track_durations') || '{}');
        durations[currentTrackObj.id] = duration;
        localStorage.setItem('track_durations', JSON.stringify(durations));
        
        updateHomePage();
    }

    function playTrack(index) {
        audioPlayer.removeEventListener('loadedmetadata', saveDurationHandler);
        if (index < 0 || index >= currentPlaylist.length) return;
        showPlayer();
        const track = currentPlaylist[index];
        currentTrackId = track.id;
        
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';

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
        
        updateLikeVisuals(track.is_liked);

        audioPlayer.src = track.file_url;
        audioPlayer.load();

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    saveToRecent(track);
                })
                .catch(error => {
                    setTimeout(() => {
                        const retryPromise = audioPlayer.play();
                        if (retryPromise !== undefined) {
                            retryPromise.catch(err => null);
                        }
                    }, 100);
                });
        }
        
        if (queueOverlay.classList.contains('active')) renderQueue();
    }

    /* СОРТИРОВКА */
    let currentSort = 'newest';
    function sortAndRenderTracks() {
        if (!allUserTracks.length) return;
        let sorted = [...allUserTracks];
        switch (currentSort) {
            case 'newest': sorted.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
            case 'oldest': sorted.sort((a, b) => (a.id || 0) - (b.id || 0)); break;
            case 'title': sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
            case 'artist': sorted.sort((a, b) => (a.artist || '').localeCompare(b.artist || '')); break;
        }
        if (filterLiked?.classList.contains('active')) renderTracks(sorted.filter(t => t.is_liked));
        else renderTracks(sorted);
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

    /* ПЛЕЙЛИСТЫ */
    async function loadPlaylists() {
        const grid = document.getElementById('playlists-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        if (!currentUser) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Требуется авторизация</h3><p>Войдите в аккаунт, чтобы увидеть свои плейлисты</p></div>`;
            return;
        }
        
        const cached = loadCachedPlaylists();
        if (cached) {
            originalPlaylists = cached;
            renderPlaylists(originalPlaylists);
            return;
        }

        const { data } = await supabase.from('playlists').select('*').eq('user_id', currentUser);
        
        if (!data || !data.length) { 
            originalPlaylists = []; 
            renderPlaylists([]); 
            return; 
        }
        
        for (const p of data) {
            const { count } = await supabase.from('playlist_tracks').select('*', { count: 'exact', head: true }).eq('playlist_id', p.id);
            p.track_count = count || 0;
            const duration = await getPlaylistDuration(p.id);
            p.duration = duration;
        }
        
        originalPlaylists = data;
        cachePlaylists(data);

        data.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <button class="track-menu-trigger playlist-menu-trigger"><i class="fas fa-ellipsis-v"></i></button>
                <div class="track-context-menu playlist-context-menu">
                    <button class="view-playlist-btn" data-id="${playlist.id}" data-name="${playlist.name}"><i class="fas fa-list"></i> Просмотр</button>
                    <button class="edit-playlist-btn" data-id="${playlist.id}"><i class="fas fa-pen"></i> Редактировать</button>
                    <button class="delete-playlist-btn" data-id="${playlist.id}"><i class="fas fa-trash"></i> Удалить</button>
                </div>
                <div class="card-image playlist-cover">${playlist.cover_url ? `<img src="${playlist.cover_url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : '<i class="fas fa-folder"></i>'}</div>
                <div class="card-info">
                    <div class="track-title-text">${playlist.name}</div>
                    <div class="track-author">Треков: ${playlist.track_count || 0}</div>
                    <div class="track-duration">${formatPlaylistDuration(playlist.duration || 0)}</div>
                </div>
            `;
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger')) return;
                if (e.target.closest('.playlist-context-menu button')) return;
                playPlaylist(playlist.id);
            });
            
            const menuTrigger = card.querySelector('.playlist-menu-trigger');
            const contextMenu = card.querySelector('.playlist-context-menu');
            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.playlist-context-menu.active').forEach(menu => menu.classList.remove('active'));
                contextMenu.classList.toggle('active');
            });
            
            card.querySelector('.view-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                openPlaylistView(playlist.id, playlist.name);
            });
            
            card.querySelector('.edit-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                showEditPlaylistModal(playlist.id);
            });
            
            card.querySelector('.delete-playlist-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                const confirm = await Swal.fire({ title: 'Удалить плейлист?', text: 'Треки при этом не удалятся', icon: 'warning', iconColor: '#9b2c3d', showCancelButton: true, confirmButtonColor: '#9b2c3d', confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', background: '#181818', color: '#fff' });
                if (confirm.isConfirmed) {
                    await supabase.from('playlist_tracks').delete().eq('playlist_id', playlist.id);
                    await supabase.from('playlists').delete().eq('id', playlist.id);
                    toast("Плейлист удалён");
                    clearCache();
                    loadPlaylists();
                }
            });
            
            grid.appendChild(card);
        });
    }

    function renderPlaylists(playlists) {
        const grid = document.getElementById('playlists-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        if (!playlists.length) {
            if (searchQuery.trim()) {
                grid.innerHTML = `
                    <div class="not-found-placeholder">
                        <i class="fas fa-search"></i>
                        <h3>Плейлисты не найдены</h3>
                        <p>По запросу "${searchQuery}" ничего не найдено</p>
                    </div>
                `;
            } else {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <h3>Плейлистов пока нет</h3>
                        <p>Создайте первый плейлист</p>
                    </div>
                `;
            }
            return;
        }
        
        playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.innerHTML = `
                <button class="track-menu-trigger playlist-menu-trigger"><i class="fas fa-ellipsis-v"></i></button>
                <div class="track-context-menu playlist-context-menu">
                    <button class="view-playlist-btn" data-id="${playlist.id}" data-name="${playlist.name}"><i class="fas fa-list"></i> Просмотр</button>
                    <button class="edit-playlist-btn" data-id="${playlist.id}"><i class="fas fa-pen"></i> Редактировать</button>
                    <button class="delete-playlist-btn" data-id="${playlist.id}"><i class="fas fa-trash"></i> Удалить</button>
                </div>
                <div class="card-image playlist-cover">${playlist.cover_url ? `<img src="${playlist.cover_url}">` : '<i class="fas fa-folder"></i>'}</div>
                <div class="track-title-text">${playlist.name}</div>
                <div class="track-author">Треков: ${playlist.track_count || 0}</div>
                <div class="track-duration">${formatPlaylistDuration(playlist.duration || 0)}</div>
            `;
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger')) return;
                if (e.target.closest('.playlist-context-menu button')) return;
                playPlaylist(playlist.id);
            });
            
            const menuTrigger = card.querySelector('.playlist-menu-trigger');
            const contextMenu = card.querySelector('.playlist-context-menu');
            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.playlist-context-menu.active').forEach(menu => menu.classList.remove('active'));
                contextMenu.classList.toggle('active');
            });
            
            card.querySelector('.view-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                openPlaylistView(playlist.id, playlist.name);
            });
            
            card.querySelector('.edit-playlist-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.remove('active');
                showEditPlaylistModal(playlist.id);
            });
            
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
                    originalPlaylists = originalPlaylists.filter(p => p.id !== playlist.id);
                    renderPlaylists(originalPlaylists);
                }
            });
            
            grid.appendChild(card);
        });
    }

    async function playPlaylist(playlistId) {
        const { data: playlistTracks } = await supabase.from('playlist_tracks').select('track_id').eq('playlist_id', playlistId);
        if (!playlistTracks || !playlistTracks.length) { toast("В плейлисте нет треков", "error"); return; }
        const trackIds = playlistTracks.map(item => item.track_id);
        const { data: tracks } = await supabase.from('tracks').select('*').in('id', trackIds);
        if (!tracks || !tracks.length) { toast("Не удалось загрузить треки", "error"); return; }
        const orderedTracks = trackIds.map(id => tracks.find(t => t.id === id)).filter(t => t);
        currentPlaylist = orderedTracks;
        currentTrackIndex = 0;
        isShuffle = false; isRepeat = false;
        updateControlStyles();
        playTrack(0);
        if (queueOverlay.classList.contains('active')) renderQueue();
    }

    let currentPlaylistId = null;
    async function openPlaylistView(playlistId, playlistName) {
        currentPlaylistId = playlistId;
        document.getElementById('playlist-view-title').textContent = playlistName;
        const container = document.getElementById('playlist-tracks-list');
        container.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
        const { data: playlistTracks } = await supabase.from('playlist_tracks').select('track_id').eq('playlist_id', playlistId);
        if (!playlistTracks || !playlistTracks.length) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">В плейлисте нет треков</p>';
            document.getElementById('playlist-view-modal').style.display = 'flex';
            return;
        }
        const trackIds = playlistTracks.map(item => item.track_id);
        const { data: tracks } = await supabase.from('tracks').select('*').in('id', trackIds);
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
                        ${track.cover_url ? `<img src="${track.cover_url}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` : '<i class="fas fa-music" style="color:#7b2cbf;"></i>'}
                    </div>
                    <div style="flex:1;"><div style="font-weight:500;">${track.title}</div><div style="font-size:11px; color:#888;">${track.artist}</div></div>
                    <button class="remove-from-playlist-btn" data-playlist-id="${playlistId}" data-track-id="${track.id}" style="background:none; border:none; color:#b3b3b3; cursor:pointer; padding:8px;"><i class="fas fa-trash"></i></button>
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
                await supabase.from('playlist_tracks').delete().eq('playlist_id', btn.dataset.playlistId).eq('track_id', btn.dataset.trackId);
                toast("Трек удалён из плейлиста");
                openPlaylistView(playlistId, playlistName);
                loadPlaylists();
            });
        });
        document.getElementById('playlist-view-modal').style.display = 'flex';
    }

    document.getElementById('close-playlist-view')?.addEventListener('click', () => document.getElementById('playlist-view-modal').style.display = 'none');

    let currentEditPlaylistId = null, currentEditPlaylistCoverUrl = null;
    document.getElementById('edit-playlist')?.addEventListener('click', () => { if (currentPlaylistId) showEditPlaylistModal(currentPlaylistId); });
    
    async function showEditPlaylistModal(playlistId) {
        currentEditPlaylistId = playlistId;
        const { data: playlist } = await supabase.from('playlists').select('*').eq('id', playlistId).single();
        if (!playlist) return;
        document.getElementById('edit-playlist-name').value = playlist.name;
        currentEditPlaylistCoverUrl = playlist.cover_url || null;
        const previewImg = document.getElementById('edit-playlist-cover-preview');
        const placeholder = document.getElementById('edit-playlist-cover-placeholder');
        if (currentEditPlaylistCoverUrl && previewImg) {
            previewImg.src = currentEditPlaylistCoverUrl;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            if (previewImg) previewImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
        }
        const coverInput = document.getElementById('edit-playlist-cover-input');
        if (coverInput) coverInput.value = '';
        window.newEditPlaylistCover = null;
        document.getElementById('edit-playlist-modal').style.display = 'flex';
    }

    document.getElementById('save-playlist-edit')?.addEventListener('click', async () => {
        const newName = document.getElementById('edit-playlist-name').value.trim();
        if (!newName) { toast("Введите название", "error"); return; }
        let newCoverUrl = currentEditPlaylistCoverUrl;
        if (window.newEditPlaylistCover) {
            const file = window.newEditPlaylistCover;
            const ext = file.name.split('.').pop();
            const fileName = `playlist_cover_${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage.from('covers').upload(fileName, file);
            if (!uploadErr) {
                const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName);
                newCoverUrl = urlData.publicUrl;
            } else {
                toast("Ошибка загрузки обложки", "error");
            }
        }
        const { error } = await supabase.from('playlists').update({ name: newName, cover_url: newCoverUrl }).eq('id', currentEditPlaylistId);
        if (error) toast("Ошибка сохранения", "error");
        else {
            toast("Плейлист обновлён");
            clearCache();
            document.getElementById('edit-playlist-modal').style.display = 'none';
            document.getElementById('playlist-view-modal').style.display = 'none';
            loadPlaylists();
            window.newEditPlaylistCover = null;
            const coverInput = document.getElementById('edit-playlist-cover-input');
            if (coverInput) coverInput.value = '';
            const previewImg = document.getElementById('edit-playlist-cover-preview');
            const placeholder = document.getElementById('edit-playlist-cover-placeholder');
            if (previewImg) previewImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
        }
    });

    document.getElementById('delete-playlist')?.addEventListener('click', async () => {
        const confirm = await Swal.fire({ title: 'Удалить плейлист?', text: 'Треки при этом не удалятся', icon: 'warning', iconColor: '#9b2c3d', showCancelButton: true, confirmButtonColor: '#9b2c3d', confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', background: '#181818', color: '#fff' });
        if (confirm.isConfirmed) {
            await supabase.from('playlist_tracks').delete().eq('playlist_id', currentPlaylistId);
            await supabase.from('playlists').delete().eq('id', currentPlaylistId);
            toast("Плейлист удалён");
            clearCache();
            document.getElementById('playlist-view-modal').style.display = 'none';
            loadPlaylists();
            refreshAllData();
        }
    });

    // Подсчёт общей длительности плейлиста
    async function getPlaylistDuration(playlistId) {
        const { data: playlistTracks } = await supabase
            .from('playlist_tracks')
            .select('track_id')
            .eq('playlist_id', playlistId);
        
        if (!playlistTracks || !playlistTracks.length) return 0;
        
        const trackIds = playlistTracks.map(item => item.track_id);
        const { data: tracks } = await supabase
            .from('tracks')
            .select('duration')
            .in('id', trackIds);
        
        if (!tracks) return 0;
        
        return tracks.reduce((total, track) => total + (track.duration || 0), 0);
    }

    // Форматирование длительности
    function formatPlaylistDuration(seconds) {
        if (!seconds || seconds === 0) return '0 мин';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} ч ${minutes} мин`;
        }
        return `${minutes} мин`;
    }

    /* СОЗДАНИЕ ПЛЕЙЛИСТА */
    function renderPlaylistTracks() {
        const container = document.getElementById('playlist-track-list');
        if (!container) return;
        container.innerHTML = '';
        
        if (!allUserTracks.length) {
            container.innerHTML = `<p style="color:#888; text-align:center; padding:20px;">Нет загруженных треков</p>`;
            return;
        }
        
        allUserTracks.forEach(track => {
            const item = document.createElement('div');
            item.className = 'playlist-track-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = track.id;
            checkbox.style.display = 'none';

            const customCheckbox = document.createElement('span');
            customCheckbox.className = 'custom-checkbox';
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check';
            customCheckbox.appendChild(checkIcon);
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'playlist-track-info';
            infoDiv.innerHTML = `
                <div class="playlist-track-name">${track.title}</div>
                <div class="playlist-track-artist">${track.artist || 'Неизвестен'}</div>
            `;
            
            item.appendChild(checkbox);
            item.appendChild(customCheckbox);
            item.appendChild(infoDiv);
            
            item.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    customCheckbox.classList.add('checked');
                } else {
                    customCheckbox.classList.remove('checked');
                }
            });
            
            container.appendChild(item);
        });
    }

    /* РЕДАКТИРОВАНИЕ ТРЕКА */
    async function showEditTrackModal(trackId, currentTitle, currentArtist) {
        currentEditTrackId = trackId;
        document.getElementById('edit-track-title').value = currentTitle || '';
        document.getElementById('edit-track-artist').value = currentArtist || '';
        const { data: track } = await supabase.from('tracks').select('cover_url').eq('id', trackId).single();
        currentEditCoverUrl = track?.cover_url || null;
        const previewImg = document.getElementById('edit-cover-preview');
        const placeholder = document.getElementById('edit-cover-placeholder');
        if (currentEditCoverUrl && previewImg) {
            previewImg.src = currentEditCoverUrl;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            previewImg.style.display = 'none';
            placeholder.style.display = 'flex';
        }
        const coverInput = document.getElementById('edit-track-cover-input');
        if (coverInput) coverInput.value = '';
        window.newEditCover = null;
        document.getElementById('edit-track-modal').style.display = 'flex';
    }

    document.getElementById('save-track-edit')?.addEventListener('click', async () => {
        const newTitle = document.getElementById('edit-track-title').value.trim();
        const newArtist = document.getElementById('edit-track-artist').value.trim();
        const newCoverFile = document.getElementById('edit-track-cover-input').files[0] || window.newEditCover;
        if (!newTitle) { toast("Введите название", "error"); return; }
        let newCoverUrl = currentEditCoverUrl;
        if (newCoverFile) {
            const coverFileName = `${Date.now()}_cover.${newCoverFile.name.split('.').pop()}`;
            const { error: coverError } = await supabase.storage.from('covers').upload(coverFileName, newCoverFile);
            if (!coverError) newCoverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName).data.publicUrl;
            else toast("Ошибка загрузки обложки", "error");
        }
        const { error } = await supabase.from('tracks').update({
            title: newTitle, artist: newArtist || "Неизвестен", cover_url: newCoverUrl
        }).eq('id', currentEditTrackId);
        if (error) { toast("Ошибка обновления", "error"); return; }
        toast("Трек обновлён");
        clearCache();
        document.getElementById('edit-track-modal').style.display = 'none';
        loadUserTracks();
        refreshAllData(); 
    });

    /* ДОБАВЛЕНИЕ ТРЕКА В ПЛЕЙЛИСТ */
    let currentAddTrackId = null;
    async function showAddToPlaylistModal(trackId, trackTitle, trackArtist) {
        currentAddTrackId = trackId;
        document.getElementById('add-to-playlist-track-name').innerHTML = `${trackTitle}<br><span style="font-size:12px; color:#888;">${trackArtist || 'Неизвестен'}</span>`;
        
        const { data: playlists } = await supabase.from('playlists').select('*').eq('user_id', currentUser);
        if (!playlists || !playlists.length) { 
            toast("Нет плейлистов", "error"); 
            return; 
        }
        
        const { data: existingTracks } = await supabase.from('playlist_tracks').select('playlist_id').eq('track_id', trackId);
        const existingPlaylistIds = existingTracks?.map(p => p.playlist_id) || [];
        
        const container = document.getElementById('playlist-check-list');
        container.innerHTML = '';
        
        playlists.forEach(playlist => {
            const isChecked = existingPlaylistIds.includes(playlist.id);
            
            const item = document.createElement('div');
            item.className = 'playlist-simple-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = playlist.id;
            checkbox.checked = isChecked;
            checkbox.style.display = 'none';
            
            const customCheckbox = document.createElement('span');
            customCheckbox.className = 'custom-checkbox';
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check';
            customCheckbox.appendChild(checkIcon);
            
            if (isChecked) customCheckbox.classList.add('checked');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'playlist-name';
            nameSpan.textContent = playlist.name;
            
            item.appendChild(checkbox);
            item.appendChild(customCheckbox);
            item.appendChild(nameSpan);
            
            item.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    customCheckbox.classList.add('checked');
                } else {
                    customCheckbox.classList.remove('checked');
                }
            });
            
            container.appendChild(item);
        });
        
        document.getElementById('add-to-playlist-modal').style.display = 'flex';
    }

    /* ФИЛЬТРАЦИЯ И ПОИСК */
    function filterItems() {
        const query = searchQuery.trim().toLowerCase();
        if (filterPlaylists?.classList.contains('active')) {
            if (!originalPlaylists.length) {
                renderPlaylists([]);
                return;
            }
            if (!query) {
                renderPlaylists(originalPlaylists);
            } else {
                const filtered = originalPlaylists.filter(p => p.name.toLowerCase().includes(query));
                renderPlaylists(filtered);
            }
            return;
        }
        let tracksToFilter = allUserTracks;
        if (filterLiked?.classList.contains('active')) {
            tracksToFilter = allUserTracks.filter(t => t.is_liked);
        }
        if (!tracksToFilter.length) {
            renderTracks([]);
            return;
        }
        if (!query) {
            renderTracks(tracksToFilter);
        } else {
            const filtered = tracksToFilter.filter(t => 
                t.title.toLowerCase().includes(query) || 
                (t.artist && t.artist.toLowerCase().includes(query))
            );
            renderTracks(filtered);
        }
    }

    function switchLibrarySection(activeFilter, sectionToShow) {
        [filterAll, filterLiked, filterPlaylists].forEach(f => f?.classList.remove('active'));
        if (searchInput) { searchInput.value = ''; searchQuery = ''; if (clearSearchBtn) clearSearchBtn.style.display = 'none'; }
        filterItems();
        activeFilter.classList.add('active');
        const sortGroup = document.querySelector('.sort-group');
        if (sectionToShow === 'playlists') {
            tracksList.style.display = 'none';
            playlistsViewContainer.style.display = 'block';
            openUploadModalButton.style.display = 'none';
            createPlaylistButton.style.display = 'flex';
            if (sortGroup) sortGroup.style.display = 'none';
            if (currentUser) { loadPlaylists(); loadProfileStatsAndAvatar(); }
            else document.getElementById('playlists-grid').innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Требуется авторизация</h3><p>Войдите в аккаунт, чтобы увидеть плейлисты</p></div>`;
        } else {
            tracksList.style.display = 'grid';
            playlistsViewContainer.style.display = 'none';
            openUploadModalButton.style.display = 'flex';
            createPlaylistButton.style.display = 'none';
            if (sortGroup) sortGroup.style.display = 'flex';
        }
    }
    filterAll?.addEventListener('click', () => { switchLibrarySection(filterAll, 'tracks'); loadUserTracks(); });
    filterLiked?.addEventListener('click', () => { switchLibrarySection(filterLiked, 'tracks'); loadUserTracks(); });
    filterPlaylists?.addEventListener('click', () => switchLibrarySection(filterPlaylists, 'playlists'));

    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
            filterItems();
        });
        if (clearSearchBtn) clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            filterItems();
        });
    }

    /* МЕНЮ ПЛЕЕРА */
    const initPlayerMenu = () => {
        if (playerMenuTrigger && playerContextMenu) {
            const newBtn = playerMenuTrigger.cloneNode(true);
            playerMenuTrigger.parentNode.replaceChild(newBtn, playerMenuTrigger);
            newBtn.addEventListener('click', (e) => { e.stopPropagation(); playerContextMenu.classList.toggle('active'); });
            document.querySelector('.player-edit-track')?.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContextMenu.classList.remove('active');
                if (currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) { toast("Нет активного трека", "error"); return; }
                const track = currentPlaylist[currentTrackIndex];
                showEditTrackModal(track.id, track.title, track.artist);
            });
            document.querySelector('.player-add-to-playlist')?.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContextMenu.classList.remove('active');
                if (currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) { toast("Нет активного трека", "error"); return; }
                const track = currentPlaylist[currentTrackIndex];
                showAddToPlaylistModal(track.id, track.title, track.artist);
            });
        }
    };
    initPlayerMenu();
    document.addEventListener('click', (e) => {
        const menu = document.querySelector('.player-context-menu');
        const btn = document.querySelector('.player-menu-trigger');
        if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('active');
    });

    /* ЗАГРУЗКА ТРЕКА */
    openUploadModalButton?.addEventListener('click', () => {
        if (!isRegistered) { toast("Войдите в аккаунт", "error"); return; }
        uploadFormContainer.style.display = 'flex';
    });
    document.getElementById('close-upload-modal')?.addEventListener('click', () => {
        uploadFormContainer.style.display = 'none';
        trackTitleInput.value = '';
        trackArtistInput.value = '';
        const audioInput = document.getElementById('track-file');
        if (audioInput) audioInput.value = '';
        const dropzoneFilename = document.getElementById('dropzone-filename');
        if (dropzoneFilename) dropzoneFilename.textContent = '';
        const coverInput = document.getElementById('track-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('track-cover-preview');
        const placeholder = document.getElementById('track-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newTrackCover = null;
    });

    startUploadButton?.addEventListener('click', async () => {
        const file = trackFileInput.files[0];
        const coverFile = document.getElementById('track-cover-input').files[0] || window.newTrackCover;
        const title = trackTitleInput.value.trim();
        const artist = trackArtistInput.value.trim();
        if (!file || !title) { toast("Укажите название и выберите файл", "error"); return; }
        
        startUploadButton.disabled = true;
        startUploadButton.textContent = "Загрузка...";
        
        try {
            let audioDuration = 0;
            const tempAudio = document.createElement('audio');
            tempAudio.preload = 'metadata';
            tempAudio.src = URL.createObjectURL(file);
            
            await new Promise((resolve) => {
                tempAudio.addEventListener('loadedmetadata', () => {
                    audioDuration = Math.floor(tempAudio.duration);
                    resolve();
                });
                tempAudio.addEventListener('error', () => {
                    console.warn('Не удалось получить длительность');
                    resolve();
                });
            });
            URL.revokeObjectURL(tempAudio.src);
            
            const cleanName = file.name
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/_+/g, '_')
                .toLowerCase();
            const fileName = `${Date.now()}_${cleanName}`;
            const { error: uploadError } = await supabase.storage.from('songs').upload(fileName, file);
            if (uploadError) throw new Error(`Хранилище: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('songs').getPublicUrl(fileName);
            
            let coverUrl = null;
            if (coverFile) {
                const cleanName = coverFile.name
                    .replace(/[^a-zA-Z0-9._-]/g, '_')
                    .replace(/_+/g, '_')
                    .toLowerCase();
                const coverFileName = `${Date.now()}_${cleanName}`;
                const { error: coverError } = await supabase.storage.from('covers').upload(coverFileName, coverFile, { upsert: true });
                if (!coverError) {
                    coverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName).data.publicUrl;
                } else {
                    toast("Ошибка загрузки обложки", "error");
                }
            }
            
            const { error: dbError } = await supabase.from('tracks').insert({ 
                title, 
                artist: artist || "Неизвестен", 
                file_url: urlData.publicUrl, 
                cover_url: coverUrl, 
                user_id: currentUser,
                duration: audioDuration
            });
            
            if (dbError) throw dbError;
            
            Swal.fire({ 
                title: 'Трек добавлен!', 
                html: `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(artist || 'Неизвестен')}<br><span style="font-size: 12px; color: #888;">${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}</span>`, 
                icon: 'success', 
                iconColor: '#7b2cbf', 
                background: '#181818', 
                color: '#fff', 
                confirmButtonColor: '#7b2cbf' 
            });
            
            resetUploadModal();
            uploadFormContainer.style.display = 'none';
            clearCache();
            await loadUserTracks();
            loadUserTracks();
            updateHomePage();
            loadRecommendations();
            refreshAllData();
            
        } catch (err) { 
            console.error(err); 
            Swal.fire("Ошибка", err.message, "error"); 
        } finally { 
            startUploadButton.disabled = false; 
            startUploadButton.textContent = "Опубликовать"; 
        }
        
        window.newTrackCover = null;
    });

    /* ГЛОБАЛЬНОЕ ДЕЛЕГИРОВАНИЕ ДЛЯ КАРТОЧЕК ТРЕКОВ */
    document.body.addEventListener('click', async (e) => {
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
                        icon: 'warning', iconColor: '#9b2c3d',
                        showCancelButton: true, confirmButtonColor: '#9b2c3d', confirmButtonText: 'Удалить', cancelButtonText: 'Отмена',
                        background: '#181818', color: '#fff'
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
                            clearCache();
                            allUserTracks = allUserTracks.filter(t => t.id !== track.id);
                            currentPlaylist = currentPlaylist.filter(t => t.id !== track.id);
                            if (filterLiked?.classList.contains('active')) renderTracks(allUserTracks.filter(t => t.is_liked));
                            else renderTracks(allUserTracks);
                            loadPlaylists();
                            updateHomePage();
                            loadRecommendations();  
                            if (currentTrackIndex !== -1 && currentPlaylist[currentTrackIndex]?.id === track.id) {
                                if (currentPlaylist.length > 0) playTrack(0);
                                else hidePlayer();
                            }
                            refreshAllData();
                        } catch (err) { console.error(err); toast("Ошибка при удалении", "error"); }
                    }
                }
            }
            return;
        }
    });

    /* АВТОРИЗАЦИЯ */
    const toRegLink = document.getElementById('to-reg-link');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('reg-form');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.textContent.trim();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            allSections.forEach(s => s.style.display = 'none');
            if (sectionName === 'Главная') {
                homeView.style.display = 'block';
                if (currentUser && allUserTracks.length === 0) {
                    loadUserTracks();
                } else {
                    updateHomePage();
                    loadRecommendations();
                    loadRecentTracks();
                }
            }
            if (sectionName === 'Медиатека') { libraryView.style.display = 'block'; loadUserTracks(); }
            if (sectionName === 'Профиль') {
                if (isRegistered) { profileView.style.display = 'block'; loadProfileStatsAndAvatar(); }
                else loginView.style.display = 'block';
            }
        });
    });

    const logoHome = document.getElementById('logo-home');
    if (logoHome) {
        logoHome.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            const homeLink = Array.from(navLinks).find(link => link.textContent.trim() === 'Главная');
            if (homeLink) homeLink.classList.add('active');
            
            allSections.forEach(s => s.style.display = 'none');
            homeView.style.display = 'block';
            
            if (currentUser && allUserTracks.length === 0) {
                loadUserTracks();
            } else {
                updateHomePage();
                loadRecommendations();
                loadRecentTracks();
            }
        });
    }

    toRegLink?.addEventListener('click', (e) => { e.preventDefault(); hideAllSections(); regView.style.display = 'block'; });
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;
        const { data, error } = await supabase.from('users_data').select('id, username').eq('username', user).eq('password', pass).single();
        if (error || !data) toast("Неверный логин или пароль", "error");
        else {
            const recentGrid = document.getElementById('recent-tracks-grid');
            if (recentGrid) recentGrid.innerHTML = '';
            isRegistered = true;
            currentUser = data.id;
            localStorage.setItem('my_user_uuid', data.id);
            localStorage.setItem('my_user_name', data.display_name || data.username);
            
            await loadUserTracks();
            
            hideAllSections();
            profileView.style.display = 'block';
            await loadProfileStatsAndAvatar();
            refreshAllData(); 
            
            toast(`С возвращением, ${data.username}!`);
        }
    });

    regForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const passwordError = validatePassword(password);
        if (passwordError) { toast(passwordError, "error"); return; }
        try {
            const { data: existingUser } = await supabase.from('users_data').select('id, username').eq('username', username).maybeSingle();
            if (existingUser) {
                currentUser = existingUser.id;
                isRegistered = true;
                localStorage.setItem('my_user_uuid', existingUser.id);
                toast("С возвращением, " + username + "!");
                hideAllSections();
                profileView.style.display = 'block';
                await loadProfileStatsAndAvatar();
                return;
            }
            const { data: newData, error: insertError } = await supabase.from('users_data').insert([{ username, password }]).select('id, username').single();
            if (insertError) throw insertError;
            if (newData) {
                currentUser = newData.id;
                isRegistered = true;
                localStorage.setItem('my_user_uuid', newData.id);
                localStorage.setItem('my_user_name', newData.username);
                toast("Аккаунт успешно создан!");
                hideAllSections();
                profileView.style.display = 'block';
                await loadProfileStatsAndAvatar();
                await loadUserTracks();
            }
        } catch (err) { console.error(err); toast("Ошибка: Возможно, имя занято или проблема с базой", "error"); }
    });

    document.getElementById('logout-button')?.addEventListener('click', () => {
        const userId = currentUser;
        
        const avatarImg = document.getElementById('avatar-img');
        const avatarIcon = document.getElementById('avatar-icon');
        if (avatarImg) {
            avatarImg.style.display = 'none';
            avatarImg.src = '';
        }
        if (avatarIcon) avatarIcon.style.display = 'block';
        
        localStorage.removeItem('my_user_uuid');
        localStorage.removeItem('my_user_name');
        
        if (userId) {
            localStorage.removeItem(`cached_tracks_${userId}`);
            localStorage.removeItem(`cached_playlists_${userId}`);
            localStorage.removeItem(`recent_tracks_${userId}`);
        }
        
        currentUser = null;
        isRegistered = false;
        allUserTracks = [];
        currentPlaylist = [];
        currentTrackIndex = -1;
        
        hidePlayer();
        tracksList.innerHTML = '';
        
        const playlistsGrid = document.getElementById('playlists-grid');
        if (playlistsGrid) playlistsGrid.innerHTML = '';
        
        const recentGrid = document.getElementById('recent-tracks-grid');
        if (recentGrid) recentGrid.innerHTML = '';
        
        audioPlayer.pause();
        audioPlayer.src = '';
        document.querySelector('.track-name').textContent = 'Название трека';
        document.querySelector('.track-artist').textContent = 'Имя исполнителя';
        updateLikeVisuals(false);
        
        hideAllSections();
        homeView.style.display = 'block';
        
        updateHomePage();
        loadRecommendations();
        loadRecentTracks();
        refreshAllData();
        
        navLinks.forEach(l => l.classList.remove('active'));
        const homeLink = document.querySelector('.nav-menu a[href="#"]');
        if (homeLink) homeLink.classList.add('active');
        
        toast("Вы вышли", "info");
    });

    /* РЕДАКТИРОВАНИЕ ПРОФИЛЯ */
    const editProfileBtn = document.getElementById('edit-profile-button');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeProfileEdit = document.getElementById('close-profile-edit');
    const saveProfileEdit = document.getElementById('save-profile-edit');
    const editProfileAvatarInput = document.getElementById('edit-profile-avatar-input');
    const editProfileRemoveAvatar = document.getElementById('edit-profile-remove-avatar');
    const editProfileLogin = document.getElementById('edit-profile-login');
    const editProfileDisplayName = document.getElementById('edit-profile-display-name');
    const editProfileNewPass = document.getElementById('edit-profile-new-password');
    const editProfileConfirmPass = document.getElementById('edit-profile-confirm-password');
    const avatarPreviewImg = document.getElementById('avatar-preview');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');

    let newAvatarFile = null;

    editProfileBtn?.addEventListener('click', async () => {
        if (!currentUser) { toast("Войдите в аккаунт", "error"); return; }
        const { data, error } = await supabase.from('users_data').select('username, display_name, avatar_url').eq('id', currentUser).single();
        if (error) { toast("Ошибка загрузки данных", "error"); return; }
        editProfileLogin.value = data.username;
        editProfileDisplayName.value = data.display_name || data.username;
        if (data.avatar_url) {
            avatarPreviewImg.src = data.avatar_url;
            avatarPreviewImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else {
            avatarPreviewImg.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
        }
        newAvatarFile = null;
        if (editProfileAvatarInput) editProfileAvatarInput.value = '';
        editProfileNewPass.value = '';
        editProfileConfirmPass.value = '';
        editProfileModal.style.display = 'flex';
    });

    closeProfileEdit?.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
        if (editProfileAvatarInput) editProfileAvatarInput.value = '';
        avatarPreviewImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
        newAvatarFile = null;
        editProfileDisplayName.value = '';
        editProfileNewPass.value = '';
        editProfileConfirmPass.value = '';
    });

    editProfileRemoveAvatar?.addEventListener('click', () => {
        newAvatarFile = null;
        if (editProfileAvatarInput) editProfileAvatarInput.value = '';
        avatarPreviewImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
    });

    saveProfileEdit?.addEventListener('click', async () => {
        const newDisplayName = editProfileDisplayName.value.trim();
        if (!newDisplayName) { toast("Отображаемое имя не может быть пустым", "error"); return; }
        
        const newPassword = editProfileNewPass.value;
        const confirmPassword = editProfileConfirmPass.value;
        if (newPassword && newPassword !== confirmPassword) { toast("Пароли не совпадают", "error"); return; }
        if (newPassword) {
            const passError = validatePassword(newPassword);
            if (passError) { toast(passError, "error"); return; }
        }
        
        let finalAvatarUrl = null;
        
        if (window.newAvatarFile && window.newAvatarFile instanceof File) {
            const file = window.newAvatarFile;
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${currentUser}_${Date.now()}.${fileExt}`;
            
            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            
            if (uploadErr) {
                console.error('Ошибка загрузки:', uploadErr);
                toast("Ошибка загрузки аватара: " + uploadErr.message, "error");
                return;
            }
            
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
            finalAvatarUrl = urlData.publicUrl;
            
            const { error: updateAvatarErr } = await supabase
                .from('users_data')
                .update({ avatar_url: finalAvatarUrl })
                .eq('id', currentUser);
            
            if (updateAvatarErr) {
                console.error('Ошибка сохранения URL:', updateAvatarErr);
                toast("Ошибка сохранения аватара", "error");
                return;
            }
        }

        const updateObj = { display_name: newDisplayName };
        if (newPassword) updateObj.password = newPassword;
        
        const { error: updateErr } = await supabase
            .from('users_data')
            .update(updateObj)
            .eq('id', currentUser);
        
        if (updateErr) { 
            toast("Ошибка сохранения: " + updateErr.message, "error"); 
            return; 
        }
        
        localStorage.setItem('my_user_name', newDisplayName);
        await loadProfileStatsAndAvatar();
        toast("Профиль обновлён");
        editProfileModal.style.display = 'none';
        
        window.newAvatarFile = null;
        editProfileAvatarInput.value = '';
    });

    /* ЗАКРЫТИЕ ОСТАЛЬНЫХ МОДАЛОК КРЕСТИКОМ */
    document.getElementById('close-edit-track-modal')?.addEventListener('click', () => {
        document.getElementById('edit-track-modal').style.display = 'none';
        const coverInput = document.getElementById('edit-track-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('edit-cover-preview');
        const placeholder = document.getElementById('edit-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newEditCover = null;
        document.getElementById('edit-track-title').value = '';
        document.getElementById('edit-track-artist').value = '';
    });

    document.getElementById('close-edit-playlist-modal')?.addEventListener('click', () => {
        document.getElementById('edit-playlist-modal').style.display = 'none';
        const coverInput = document.getElementById('edit-playlist-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('edit-playlist-cover-preview');
        const placeholder = document.getElementById('edit-playlist-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newEditPlaylistCover = null;
        document.getElementById('edit-playlist-name').value = '';
    });

    document.getElementById('close-playlist-modal')?.addEventListener('click', () => {
        document.getElementById('playlist-form-container').style.display = 'none';
        document.getElementById('playlist-name-input').value = '';
        const coverInput = document.getElementById('playlist-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('playlist-cover-preview');
        const placeholder = document.getElementById('playlist-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newPlaylistCover = null;
        const checkboxes = document.querySelectorAll('#playlist-track-list input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    });

    /* СБРОС МОДАЛКИ ЗАГРУЗКИ ТРЕКА */
    function resetUploadModal() {
        if (trackTitleInput) trackTitleInput.value = '';
        if (trackArtistInput) trackArtistInput.value = '';
        const audioInput = document.getElementById('track-file');
        if (audioInput) audioInput.value = '';
        const audioFilename = document.getElementById('dropzone-filename');
        if (audioFilename) audioFilename.textContent = '';
        document.getElementById('audio-dropzone')?.classList.remove('has-file', 'drag-over');
        const coverInput = document.getElementById('track-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('track-cover-preview');
        const placeholder = document.getElementById('track-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newTrackCover = null;
    }

    document.getElementById('confirm-add-to-playlist')?.addEventListener('click', async () => {
        if (!currentAddTrackId) {
            toast("Трек не выбран", "error");
            return;
        }
        
        const checked = [...document.querySelectorAll('#playlist-check-list input[type="checkbox"]:checked')].map(el => el.value);
        
        const { data: playlists } = await supabase.from('playlists').select('id').eq('user_id', currentUser);
        if (!playlists) {
            toast("Ошибка загрузки плейлистов", "error");
            return;
        }
        
        const allPlaylistIds = playlists.map(p => p.id);
        
        for (const playlistId of checked) {
            const { data: existing } = await supabase
                .from('playlist_tracks')
                .select('id')
                .eq('playlist_id', playlistId)
                .eq('track_id', currentAddTrackId)
                .single();
            
            if (!existing) {
                await supabase
                    .from('playlist_tracks')
                    .insert({ playlist_id: playlistId, track_id: currentAddTrackId });
            }
        }
        
        const unchecked = allPlaylistIds.filter(id => !checked.includes(id));
        for (const playlistId of unchecked) {
            await supabase
                .from('playlist_tracks')
                .delete()
                .eq('playlist_id', playlistId)
                .eq('track_id', currentAddTrackId);
        }
        
        toast("Плейлисты обновлены");
        clearCache(); 
        document.getElementById('add-to-playlist-modal').style.display = 'none';
        document.getElementById('playlist-check-list').innerHTML = '';
        loadPlaylists();
    });

    document.getElementById('close-add-to-playlist-modal')?.addEventListener('click', () => {
        document.getElementById('add-to-playlist-modal').style.display = 'none';
        document.getElementById('playlist-check-list').innerHTML = '';
        currentAddTrackId = null;
    });

    document.getElementById('add-to-playlist-modal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('add-to-playlist-modal')) {
            document.getElementById('add-to-playlist-modal').style.display = 'none';
            document.getElementById('playlist-check-list').innerHTML = '';
            currentAddTrackId = null;
        }
    });

    /* СОЗДАНИЕ ПЛЕЙЛИСТА */
    createPlaylistButton?.addEventListener('click', () => {
        if (!currentUser) { 
            toast("Войдите в аккаунт", "error"); 
            return; 
        }
        if (!allUserTracks.length) {
            toast("Сначала загрузите хотя бы один трек", "error");
            return;
        }
        playlistFormContainer.style.display = 'flex';
        playlistNameInput.value = '';
        playlistNameInput.focus();
        renderPlaylistTracks();
    });

    savePlaylistButton?.addEventListener('click', async () => {
        const name = playlistNameInput.value.trim();
        if (!name) { 
            toast("Введите название", "error"); 
            return; 
        }
        
        const checked = [];
        document.querySelectorAll('#playlist-track-list input[type="checkbox"]').forEach(cb => {
            if (cb.checked) checked.push(cb.value);
        });
        
        let coverUrl = null;
        if (window.newPlaylistCover) {
            const ext = window.newPlaylistCover.name.split('.').pop();
            const fileName = `playlist_cover_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('covers').upload(fileName, window.newPlaylistCover);
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName);
                coverUrl = urlData.publicUrl;
            } else {
                toast("Ошибка загрузки обложки", "error");
            }
        }
        
        try {
            const { data, error } = await supabase.from('playlists').insert({
                name, 
                user_id: currentUser, 
                cover_url: coverUrl
            }).select().single();
            
            if (error) throw error;
            
            if (checked.length) {
                const rows = checked.map(trackId => ({ 
                    playlist_id: data.id, 
                    track_id: trackId 
                }));
                await supabase.from('playlist_tracks').insert(rows);
            }
            
            toast("Плейлист создан");
            
            playlistFormContainer.style.display = 'none';
            playlistNameInput.value = '';
            
            window.newPlaylistCover = null;
            const coverInput = document.getElementById('playlist-cover-input');
            if (coverInput) coverInput.value = '';
            const previewImg = document.getElementById('playlist-cover-preview');
            const placeholder = document.getElementById('playlist-cover-placeholder');
            if (previewImg) previewImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
            
            document.querySelectorAll('#playlist-track-list input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                const customCheckbox = cb.closest('.playlist-track-item')?.querySelector('.custom-checkbox');
                if (customCheckbox) customCheckbox.classList.remove('checked');
            });
            
            originalPlaylists = [];
            clearCache();
            loadPlaylists();
            refreshAllData();
            
        } catch (err) {
            console.error(err);
            toast("Ошибка создания: " + err.message, "error");
        }
    });

    closePlaylistModal?.addEventListener('click', () => {
        playlistFormContainer.style.display = 'none';
        playlistNameInput.value = '';
        const coverInput = document.getElementById('playlist-cover-input');
        if (coverInput) coverInput.value = '';
        const previewImg = document.getElementById('playlist-cover-preview');
        const placeholder = document.getElementById('playlist-cover-placeholder');
        if (previewImg) previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
        window.newPlaylistCover = null;
        document.querySelectorAll('#playlist-track-list input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            const customCheckbox = cb.closest('.playlist-track-item')?.querySelector('.custom-checkbox');
            if (customCheckbox) customCheckbox.classList.remove('checked');
        });
    });

    /* ЗАКРЫТИЕ МОДАЛОК (ВНЕ ЗОНЫ ОКНА) */

    // Закрытие модалки создания плейлиста
    playlistFormContainer?.addEventListener('click', (e) => {
        if (e.target === playlistFormContainer) {
            playlistFormContainer.style.display = 'none';
            playlistNameInput.value = '';
            window.newPlaylistCover = null;
        }
    });

    // Закрытие модалки загрузки трека по клику на фон
    uploadFormContainer?.addEventListener('click', (e) => {
        if (e.target === uploadFormContainer) {
            uploadFormContainer.style.display = 'none';
            resetUploadModal();
        }
    });

    // Закрытие модалки редактирования трека
    const editTrackModal = document.getElementById('edit-track-modal');
    editTrackModal?.addEventListener('click', (e) => {
        if (e.target === editTrackModal) {
            editTrackModal.style.display = 'none';
        }
    });

    // Закрытие модалки добавления в плейлист
    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    addToPlaylistModal?.addEventListener('click', (e) => {
        if (e.target === addToPlaylistModal) {
            addToPlaylistModal.style.display = 'none';
            document.getElementById('playlist-check-list').innerHTML = '';
            currentAddTrackId = null;
        }
    });

    // Закрытие модалки профиля
    editProfileModal?.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    /* ОБНОВЛЕНИЕ ГЛАВНОЙ СТРАНИЦЫ */
    function updateHomePage() {
        const welcomeSpan = document.getElementById('welcome-username');
        if (welcomeSpan) {
            if (currentUser) {
                const displayName = localStorage.getItem('my_user_name') || 'Музыкант';
                welcomeSpan.textContent = displayName;
            } else {
                welcomeSpan.textContent = 'Гость';
            }
        }

        if (!allUserTracks.length && currentUser) {
            const previewTracks = document.getElementById('preview-tracks');
            if (previewTracks) previewTracks.textContent = '...';
            return;
        }

        const welcomeTexts = [
            "Твоя музыкальная вселенная ждёт",
            "Настроение создаётся здесь",
            "Что послушаем сегодня?",
            "Музыка начинается здесь",
            "Твой плейлист — твои правила",
            "Время для любимых треков",
            "Звучит как план",
            "Западные сервисы недоступны — а мы здесь",
            "Импортозамещение в действии",
            "Музыка без границ и блокировок",
            "Пока они блокируют, мы добавляем треки",
            "Твой музыкальный уголок в интернете",
            "Здесь живёт твоя музыка",
            "Музыка, которая всегда с тобой",
            "Министерство правды не одобряет, но мы слушаем",
            "Книги жгут, а мы сохраняем музыку",
            "Здесь нет цензуры, только музыка"
        ];
        
        const randomPhrase = welcomeTexts[Math.floor(Math.random() * welcomeTexts.length)];
        const welcomeTextElement = document.querySelector('.welcome-text');
        if (welcomeTextElement) {
            welcomeTextElement.textContent = randomPhrase;
        }
        
        const previewTracks = document.getElementById('preview-tracks');
        const previewLiked = document.getElementById('preview-liked');
        const totalMinutesSpan = document.getElementById('total-minutes');
        
        if (previewTracks && currentUser) {
            const tracksCount = allUserTracks.length;
            const likedCount = allUserTracks.filter(t => t.is_liked).length;
            
            previewTracks.textContent = tracksCount;
            previewLiked.textContent = likedCount;
            
            let totalSeconds = 0;
            const durations = JSON.parse(localStorage.getItem('track_durations') || '{}');
            allUserTracks.forEach(track => {
                const duration = track.duration || durations[track.id] || 0;
                totalSeconds += duration;
            });
            
            const totalMinutes = Math.floor(totalSeconds / 60);
            if (totalMinutesSpan) totalMinutesSpan.textContent = totalMinutes || 0;
        } else if (previewTracks) {
            previewTracks.textContent = '0';
            if (previewLiked) previewLiked.textContent = '0';
            if (totalMinutesSpan) totalMinutesSpan.textContent = '0';
        }
    }

    function loadRecommendations() {
        const recommendGrid = document.getElementById('recommend-grid');
        if (!currentUser) {
            if (recommendGrid) {
                recommendGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-music"></i>
                        <p>Войдите в аккаунт, чтобы видеть рекомендации</p>
                    </div>
                `;
            }
            return;
        }

        if (!recommendGrid) return;
        
        const shuffled = [...allUserTracks];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const recommendations = shuffled.slice(0, 8);
        
        recommendGrid.innerHTML = '';
        recommendations.forEach(track => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-image">
                    ${track.cover_url ? `<img src="${track.cover_url}" alt="cover">` : '<i class="fa-solid fa-music"></i>'}
                </div>
                <div class="card-info">
                    <div class="track-title-text">${track.title}</div>
                    <div class="track-author">${track.artist || 'Неизвестен'}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                const index = allUserTracks.findIndex(t => t.id === track.id);
                if (index !== -1) {
                    currentPlaylist = [...allUserTracks];
                    currentTrackIndex = index;
                    playTrack(currentTrackIndex);
                    saveToRecent(track);
                }
            });
            recommendGrid.appendChild(card);
        });
    }

    function saveToRecent(track) {
        if (!currentUser) return;
        
        let recent = JSON.parse(localStorage.getItem(`recent_tracks_${currentUser}`) || '[]');
        recent = recent.filter(t => t.id !== track.id);
        recent.unshift({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover_url: track.cover_url,
            timestamp: Date.now()
        });
        recent = recent.slice(0, 8);
        localStorage.setItem(`recent_tracks_${currentUser}`, JSON.stringify(recent));
        loadRecentTracks();
    }

    function loadRecentTracks() {
        const recentGrid = document.getElementById('recent-tracks-grid');
        const clearBtn = document.getElementById('clear-recent');
        
        if (!currentUser) {
            if (recentGrid) {
                recentGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-headphones"></i>
                        <p>Войдите в аккаунт, чтобы видеть историю</p>
                    </div>
                `;
            }
            return;
        }

        if (!recentGrid) return;
        
        const recent = JSON.parse(localStorage.getItem(`recent_tracks_${currentUser}`) || '[]');
        
        if (recent.length === 0) {
            recentGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-headphones"></i>
                    <p>Послушайте что-нибудь, чтобы появилась история</p>
                </div>
            `;
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }
        
        if (clearBtn) clearBtn.style.display = 'flex';
        recentGrid.innerHTML = '';
        
        recent.forEach(track => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="card-image">
                    ${track.cover_url ? `<img src="${track.cover_url}" alt="cover">` : '<i class="fa-solid fa-music"></i>'}
                </div>
                <div class="card-info">
                    <div class="track-title-text">${escapeHtml(track.title)}</div>
                    <div class="track-author">${escapeHtml(track.artist || 'Неизвестен')}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                const fullTrack = allUserTracks.find(t => t.id === track.id);
                if (fullTrack) {
                    const index = allUserTracks.findIndex(t => t.id === track.id);
                    currentPlaylist = [...allUserTracks];
                    currentTrackIndex = index;
                    playTrack(currentTrackIndex);
                    saveToRecent(fullTrack);
                } else {
                    toast("Трек больше не доступен", "error");
                    const updatedRecent = JSON.parse(localStorage.getItem(`recent_tracks_${currentUser}`) || '[]')
                        .filter(t => t.id !== track.id);
                    localStorage.setItem(`recent_tracks_${currentUser}`, JSON.stringify(updatedRecent));
                    loadRecentTracks();
                }
            });
            recentGrid.appendChild(card);
        });
    }

    function setActiveNavOnLoad() {
        const homeLink = Array.from(navLinks).find(link => link.textContent.trim() === 'Главная');
        if (homeLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            homeLink.classList.add('active');
        }
    }

    setActiveNavOnLoad();

    document.getElementById('clear-recent')?.addEventListener('click', () => {
        if (currentUser) {
            localStorage.removeItem(`recent_tracks_${currentUser}`);
            loadRecentTracks();
            toast("История очищена");
        }
    });

    if (currentUser) {
        loadProfileStatsAndAvatar();
        loadUserTracks();
        setActiveNavOnLoad();
    } else {
        const avatarImg = document.getElementById('avatar-img');
        const avatarIcon = document.getElementById('avatar-icon');
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarIcon) avatarIcon.style.display = 'block';
        updateHomePage();
        loadRecommendations();
        loadRecentTracks();
        setActiveNavOnLoad();
    }
});