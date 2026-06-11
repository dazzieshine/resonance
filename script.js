window.addEventListener('DOMContentLoaded', () => {

    const log = console.log.bind(console);
    const warn = console.warn.bind(console);
    const error = console.error.bind(console);

    /* SUPABASE */
    const supabaseUrl = 'https://fiyribauhmrqxrhrcdll.supabase.co';
    const supabaseKey = 'sb_publishable_ZpadGEdXoMzEuuBCqTyfEA_LJUfMLA7';
    const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

    /* ЭЛЕМЕНТЫ СТРАНИЦЫ */
    const navLinks = document.querySelectorAll('.nav-menu a');
    const allSections = document.querySelectorAll('.content-section');
    const homeView = document.getElementById('home-view');
    const libraryView = document.getElementById('library-view');
    const loginView = document.getElementById('login-view');
    const regView = document.getElementById('registration-view');
    const profileView = document.getElementById('profile-view');

    /* ЭЛЕМЕНТЫ АВТОРИЗАЦИИ */
    const uploadFormContainer = document.getElementById('upload-form-container');
    const openUploadModalButton = document.getElementById('open-upload-modal');
    const startUploadButton = document.getElementById('start-upload-button');
    const trackTitleInput = document.getElementById('track-title');
    const trackArtistInput = document.getElementById('track-artist');
    const trackFileInput = document.getElementById('track-file');

    /* ЭЛЕМЕНТЫ ПЛЕЕРА */
    let audioPlayer = document.getElementById('main-audio');
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
    const playerElement = document.querySelector('.player');

    /* ЭЛЕМЕНТЫ ОЧЕРЕДИ И ФИЛЬТРОВ */
    const queueOverlay = document.getElementById('queue-overlay');
    const queueBtn = document.querySelector('.queue-button');
    const closeQueue = document.getElementById('close-queue');
    const filterAll = document.getElementById('filter-all');
    const filterLiked = document.getElementById('filter-liked');
    const filterPlaylists = document.getElementById('filter-playlists');
    const tracksList = document.getElementById('tracks-list');
    const playlistsViewContainer = document.getElementById('playlists-view-container');
    const createPlaylistButton = document.getElementById('create-playlist-button');

    /* ЭЛЕМЕНТЫ РЕДАКТИРОВАНИЯ ТРЕКОВ И ПЛЕЙЛИСТОВ */
    const playlistFormContainer = document.getElementById('playlist-form-container');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const savePlaylistButton = document.getElementById('save-playlist-button');
    const closePlaylistModal = document.getElementById('close-playlist-modal');

    /* ЭЛЕМЕНТЫ РАСШИРЕННОГО ПЛЕЕРА */
    const expandedModal = document.getElementById('expanded-player-modal');
    const expandedCover = document.getElementById('expanded-cover-img');
    const expandedCoverWrapper = document.querySelector('.expanded-cover-wrapper');
    const expandedTrackName = document.getElementById('expanded-track-name');
    const expandedTrackArtist = document.getElementById('expanded-track-artist');
    const expandedPlayPauseBtn = document.querySelector('.expanded-play-pause');
    const expandedPlayPauseIcon = expandedPlayPauseBtn?.querySelector('i');
    const expandedPrevBtn = document.querySelector('.expanded-prev');
    const expandedNextBtn = document.querySelector('.expanded-next');
    const expandedShuffleBtn = document.querySelector('.expanded-shuffle');
    const expandedRepeatBtn = document.querySelector('.expanded-repeat');
    const expandedLikeBtn = document.querySelector('.expanded-like');
    const expandedProgressFill = document.querySelector('.expanded-progress-fill');
    const expandedCurrentTime = document.querySelector('.expanded-current-time');
    const expandedTotalTime = document.querySelector('.expanded-total-time');
    const expandedProgressBar = document.querySelector('.expanded-progress-bar');
    const expandedCoverMenu = document.getElementById('expanded-cover-menu');
    const expandedCoverQueue = document.getElementById('expanded-cover-queue');
    const expandedQueueContainer = document.getElementById('expanded-queue-container');
    const expandedQueueList = document.getElementById('expanded-queue-wrapper');
    const expandedQueueClose = document.getElementById('expanded-queue-close');
    const expandedContextMenu = document.getElementById('expanded-context-menu');
    const expandedEditTrackBtn = document.getElementById('expanded-edit-track');
    const expandedAddToPlaylistBtn = document.getElementById('expanded-add-to-playlist');
    const expandedCoverLyrics = document.getElementById('expanded-cover-lyrics');

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
    let isDragging = false;
    let activeBar = null;
    let activeFill = null;
    let activeHandle = null;
    let isQueueOpen = false;
    let ignoreModalClose = false;
    let ignoreModalCloseForPlaylist = false;
    let ignoreModalCloseForEditPlaylist = false;
    let ignoreModalCloseForEditTrack = false;
    let ignoreModalCloseForProfile = false;
    let isPlayingNow = false;
    let pendingPlayIndex = null;
    let nextAudio = document.getElementById('next-audio');
    let crossfadeDuration = 2000;
    let crossfadeAnimFrame = null;
    let isCrossfading = false;
    let crossfadeScheduled = false;
    let autoAdvance = false;
    repeatBtn.classList.toggle('active', isRepeat);
    shuffleBtn.classList.toggle('active', isShuffle);

    /* ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ */
    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        let targetAudio = isCrossfading ? nextAudio : audioPlayer;

        // Стрелка вправо: вперёд на 2 секунды
        if (e.code === 'ArrowRight') {
            if (targetAudio.duration && isFinite(targetAudio.duration)) {
                targetAudio.currentTime = Math.min(targetAudio.duration, targetAudio.currentTime + 2);
                const percent = (targetAudio.currentTime / targetAudio.duration) * 100;
                const progressFill = document.querySelector('.progress-fill');
                const progressHandle = document.querySelector('.progress-handle');
                if (progressFill) progressFill.style.width = `${percent}%`;
                if (progressHandle) progressHandle.style.left = `${percent}%`;
                if (typeof syncExpandedProgress === 'function') syncExpandedProgress();
            }
            e.preventDefault();
        }

        // Стрелка влево: назад на 2 секунды
        if (e.code === 'ArrowLeft') {
            if (targetAudio.duration && isFinite(targetAudio.duration)) {
                targetAudio.currentTime = Math.max(0, targetAudio.currentTime - 2);
                const percent = (targetAudio.currentTime / targetAudio.duration) * 100;
                const progressFill = document.querySelector('.progress-fill');
                const progressHandle = document.querySelector('.progress-handle');
                if (progressFill) progressFill.style.width = `${percent}%`;
                if (progressHandle) progressHandle.style.left = `${percent}%`;
                if (typeof syncExpandedProgress === 'function') syncExpandedProgress();
            }
            e.preventDefault();
        }

        // Стрелка вверх: громкость +5%
        if (e.code === 'ArrowUp') {
            e.preventDefault();
            let newVol = Math.min(1, audioPlayer.volume + 0.05);
            audioPlayer.volume = newVol;
            volumeFill.style.width = `${newVol * 100}%`;
            volumeHandle.style.left = `${newVol * 100}%`;
        }

        // Стрелка вниз: громкость -5%
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            let newVol = Math.max(0, audioPlayer.volume - 0.05);
            audioPlayer.volume = newVol;
            volumeFill.style.width = `${newVol * 100}%`;
            volumeHandle.style.left = `${newVol * 100}%`;
        }
    });

    // Парсинг артистов
    function parseArtists(artistString) {
        if (!artistString || artistString === 'Неизвестен') return [];

        let normalized = artistString
            .replace(/\s*\(feat\.?\s*([^)]+)\)/gi, ', $1')
            .replace(/\s*\[feat\.?\s*([^\]]+)\]/gi, ', $1')
            .replace(/\s*\(ft\.?\s*([^)]+)\)/gi, ', $1')
            .replace(/\s*\(with\s+([^)]+)\)/gi, ', $1')
            .replace(/\s*feat\.?\s+/gi, ', ')
            .replace(/\s*ft\.?\s+/gi, ', ')
            .replace(/\s*featuring\s+/gi, ', ')
            .replace(/\s*with\s+/gi, ', ')
            .replace(/\s*x\s+/gi, ', ')
            .replace(/\s*\+\s+/gi, ', ')
            .replace(/\s*&\s*/gi, ', ')
            .replace(/[\[\]\(\)]/g, '');

        const artists = normalized.split(',').map(a => a.trim()).filter(a => a.length > 0);

        return [...new Set(artists)];
    }

    async function saveTrackArtists(trackId, artistNames) {
        if (!artistNames.length) return;

        await supabase.from('track_artists').delete().eq('track_id', trackId);

        for (const name of artistNames) {
            let { data: existing } = await supabase
                .from('artists')
                .select('id')
                .eq('name', name)
                .single();

            let artistId;
            if (existing) {
                artistId = existing.id;
            } else {
                const { data: newArtist } = await supabase
                    .from('artists')
                    .insert({ name })
                    .select('id')
                    .single();
                artistId = newArtist.id;
            }

            await supabase
                .from('track_artists')
                .insert({ track_id: trackId, artist_id: artistId });
        }
    }

    async function loadTrackArtists(trackId) {
        const { data } = await supabase
            .from('track_artists')
            .select('artists(name)')
            .eq('track_id', trackId);

        if (!data || !data.length) return [];
        return data.map(item => item.artists.name);
    }

    // Функция склонения через Intl.PluralRules
    function plural(num, forms) {
        const pr = new Intl.PluralRules('ru-RU');
        const category = pr.select(num);
        return forms[category];
    }

    function declension(num, words) {
        const pr = new Intl.PluralRules('ru-RU');
        const category = pr.select(num);
        const map = { one: words[0], few: words[1], many: words[2] };
        return map[category] || words[2];
    }

    /* БЫСТРОДЕЙСТВИЕ */
    // Оптимизированная загрузка всех данных при входе в систему
    async function loadAllDataInParallel() {
        if (!currentUser) {

            return;
        }

        const startTime = performance.now();

        try {
            const [tracksResult, profileResult, playlistsResult] = await Promise.all([
                // Треки пользователя
                supabase
                    .from('tracks')
                    .select('id, title, artist_display, cover_url, file_url, is_liked, duration')
                    .eq('user_id', currentUser),

                // Данные профиля
                supabase
                    .from('users_data')
                    .select('avatar_url, display_name')
                    .eq('id', currentUser)
                    .single(),

                // Плейлисты
                supabase
                    .from('playlists')
                    .select('id, name, cover_url, user_id, created_at')
                    .eq('user_id', currentUser)
            ]);

            // Обрабютка треков
            if (tracksResult.data) {
                allUserTracks = tracksResult.data;
                currentPlaylist = [...allUserTracks];

                for (const track of allUserTracks) {
                    track.artists = await loadTrackArtists(track.id);
                    track.artist = track.artist_display;
                }

                // Сохранение в кеш
                cacheTracks(allUserTracks);

                if (libraryView.style.display === 'block') {
                    if (filterLiked?.classList.contains('active')) {
                        renderTracks(allUserTracks.filter(t => t.is_liked));
                    } else {
                        renderTracks(allUserTracks);
                    }
                }
            }

            // Обработка профиля
            if (profileResult.data) {
                const displayName = profileResult.data.display_name;
                localStorage.setItem('my_user_name', displayName);

                const profileDisplayName = document.getElementById('profile-display-name');
                if (profileDisplayName) profileDisplayName.textContent = displayName;

                const welcomeSpan = document.getElementById('welcome-username');
                if (welcomeSpan) welcomeSpan.textContent = displayName;

                const avatarImg = document.getElementById('avatar-img');
                const avatarIcon = document.getElementById('avatar-icon');
                if (profileResult.data.avatar_url) {
                    avatarImg.src = profileResult.data.avatar_url;
                    avatarImg.style.display = 'block';
                    avatarIcon.style.display = 'none';
                } else {
                    avatarImg.style.display = 'none';
                    avatarIcon.style.display = 'block';
                }
            }

            // Обработка плейлистов
            if (playlistsResult.data) {
                originalPlaylists = playlistsResult.data;

                for (const p of originalPlaylists) {
                    const { count } = await supabase
                        .from('playlist_tracks')
                        .select('*', { count: 'exact', head: true })
                        .eq('playlist_id', p.id);
                    p.track_count = count || 0;
                }

                cachePlaylists(originalPlaylists);

                if (filterPlaylists?.classList.contains('active')) {
                    renderPlaylists(originalPlaylists);
                }
            }

            // Обновление интерфейса
            updateHomePage();
            loadRecommendations();
            loadRecentTracks();

            await loadProfileStatsAndAvatar();

            const endTime = performance.now();

        } catch (error) {
            toast("Ошибка загрузки данных", "error");
        }
    }

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
        if (Date.now() - timestamp > 15 * 60 * 1000) return null;

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
        if (Date.now() - timestamp > 15 * 60 * 1000) return null;

        return data;
    }

    // Кеширование обложек
    function cacheImageUrl(url, key) {
        if (!url) return null;
        const cacheKey = `img_cache_${key}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached === url) return url;
        localStorage.setItem(cacheKey, url);
        return url;
    }

    function getCachedImageUrl(key) {
        return localStorage.getItem(`img_cache_${key}`);
    }

    function clearImageCache(key) {
        if (key) {
            localStorage.removeItem(`img_cache_${key}`);
        } else {
            // Очистить весь кеш изображений
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('img_cache_')) localStorage.removeItem(k);
            });
        }
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
        playlistFormContainer.style.opacity = '1';
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

            ignoreModalClose = true;
            if (squareId === 'playlist-cover-square') ignoreModalCloseForPlaylist = true;
            if (squareId === 'edit-playlist-cover-square') ignoreModalCloseForEditPlaylist = true;
            if (squareId === 'edit-cover-square') ignoreModalCloseForEditTrack = true;
            if (squareId === 'avatar-square') ignoreModalCloseForProfile = true;

            setTimeout(() => {
                ignoreModalClose = false;
                ignoreModalCloseForPlaylist = false;
                ignoreModalCloseForEditPlaylist = false;
                ignoreModalCloseForEditTrack = false;
                ignoreModalCloseForProfile = false;
            }, 500);
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

    /* ТОСТЫ */
    const toast = (title, icon = 'success') => {
        let iconColor = '#7B2CBF';
        if (icon === 'error') iconColor = '#CF6679';
        if (icon === 'info') iconColor = '#9D4EDD';

        Swal.fire({
            title: title,
            icon: icon,
            background: 'var(--surface)',
            color: 'var(--on-surface)',
            iconColor: iconColor,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            toast: true,
            position: 'bottom-start',
            customClass: {
                popup: 'custom-swal-toast',
                timerProgressBar: 'custom-timer-progress'
            }
        });
    };

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < minLength) {
            return `Пароль должен содержать минимум ${minLength} символов`;
        }
        if (!hasUpperCase) {
            return "Добавьте хотя бы одну заглавную букву (A-Z)";
        }
        if (!hasNumber) {
            return "Добавьте хотя бы одну цифру (0-9)";
        }
        return null;
    }

    function hideAllSections() {
        allSections.forEach(s => s.style.display = 'none');
    }

    function showPlayer() {
        const player = document.querySelector('.player');
        player.classList.add('visible');
    }

    function hidePlayer() {
        const player = document.querySelector('.player');
        player.classList.remove('visible');
        currentTimeEl.textContent = '0:00';
        totalTimeEl.textContent = '0:00';
        progressFill.style.width = '0%';
        document.querySelector('.progress-handle').style.left = '0%';
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
    window.initAudioListeners = function (player) {
        player.addEventListener('play', () => {
            if (player !== audioPlayer) return;

            const playIcon = document.querySelector('.play-pause-button i');
            const expPlayIcon = document.querySelector('.expanded-play-pause i');
            if (playIcon) playIcon.classList.replace('fa-play', 'fa-pause');
            if (expPlayIcon) expPlayIcon.classList.replace('fa-play', 'fa-pause');
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        });

        player.addEventListener('pause', () => {
            if (player !== audioPlayer) return;

            const playIcon = document.querySelector('.play-pause-button i');
            const expPlayIcon = document.querySelector('.expanded-play-pause i');
            if (playIcon) playIcon.classList.replace('fa-pause', 'fa-play');
            if (expPlayIcon) expPlayIcon.classList.replace('fa-pause', 'fa-play');
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        });

        player.addEventListener('timeupdate', () => {
            if (player !== audioPlayer) return;
            if (isCrossfading) return;

            if (player.duration) {
                const current = (player.currentTime / player.duration) * 100;
                if (progressFill) progressFill.style.width = `${current}%`;
                const progressHandle = document.querySelector('.progress-handle');
                if (progressHandle) progressHandle.style.left = `${current}%`;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(player.currentTime);

                if (expandedModal && expandedModal.classList.contains('active')) {
                    const eFill = document.querySelector('.expanded-progress .progress-fill');
                    const eHandle = document.querySelector('.expanded-progress .progress-handle');
                    const eCurr = document.querySelector('.expanded-current-time');
                    if (eFill) eFill.style.width = `${current}%`;
                    if (eHandle) eHandle.style.left = `${current}%`;
                    if (eCurr) eCurr.textContent = formatTime(player.currentTime);
                }
            }
        });

        player.addEventListener('loadedmetadata', () => {
            if (player !== audioPlayer) return;

            if (totalTimeEl) totalTimeEl.textContent = formatTime(player.duration);
            const expandedTotal = document.querySelector('.expanded-total-time');
            if (expandedTotal) expandedTotal.textContent = formatTime(player.duration);

            const currentTrackObj = currentPlaylist[currentTrackIndex];
            if (currentTrackObj && !currentTrackObj.duration) {
                const duration = Math.floor(player.duration);
                currentTrackObj.duration = duration;
                const trackInAll = allUserTracks.find(t => t.id === currentTrackObj.id);
                if (trackInAll) trackInAll.duration = duration;
                const durations = JSON.parse(localStorage.getItem('track_durations') || '{}');
                durations[currentTrackObj.id] = duration;
                localStorage.setItem('track_durations', JSON.stringify(durations));
                updateHomePage();
            }
        });

        // Триггеры для кроссфейда
        player.addEventListener('timeupdate', () => {
            if (player !== audioPlayer) return;
            if (isCrossfading) return;

            const toggle = document.getElementById('track-delay-toggle');
            if (toggle && !toggle.checked) return;

            const remaining = player.duration - player.currentTime;
            if (remaining <= crossfadeDuration / 1000 && !crossfadeScheduled && player.duration && !player.paused) {
                const nextIndex = getNextTrackIndex();
                if (nextIndex === -1 || nextIndex === currentTrackIndex) return;
                crossfadeScheduled = true;
                autoAdvance = true;
                startCrossfade(nextIndex);
            }
        });

        player.addEventListener('ended', () => {
            if (player !== audioPlayer) return;

            const toggle = document.getElementById('track-delay-toggle');
            const crossfadeEnabled = toggle ? toggle.checked : false;

            if (crossfadeEnabled && !isCrossfading && !crossfadeScheduled) {
                const nextIndex = getNextTrackIndex();
                if (nextIndex !== -1 && nextIndex !== currentTrackIndex) {
                    preloadNextTrack();
                    autoAdvance = true;
                    startCrossfade(nextIndex);
                }
            } else if (!crossfadeEnabled) {
                const nextIndex = getNextTrackIndex();
                if (nextIndex !== -1 && nextIndex !== currentTrackIndex) {
                    currentTrackIndex = nextIndex;
                    isPlayingNow = false;
                    playTrack(currentTrackIndex);
                }
            }
        });
    };

    initAudioListeners(audioPlayer);


    const onMouseMove = (e) => {
        if (!isDragging || !activeBar) return;

        const rect = activeBar.getBoundingClientRect();
        let p = ((e.clientX - rect.left) / rect.width) * 100;
        p = Math.max(0, Math.min(100, p));

        activeFill.style.width = p + '%';
        if (activeHandle) activeHandle.style.left = p + '%';

        let targetAudio = isCrossfading ? nextAudio : audioPlayer;
        if (activeBar.classList.contains('progress-bar') && isFinite(targetAudio.duration) && targetAudio.duration > 0) {
            const newTime = (p / 100) * targetAudio.duration;
            if (isFinite(newTime)) targetAudio.currentTime = newTime;
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

            if (bar.classList.contains('progress-bar') && isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
                const newTime = (p / 100) * audioPlayer.duration;
                if (isFinite(newTime)) audioPlayer.currentTime = newTime;
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
        syncBothAudios(audioPlayer.paused);
    });

    document.querySelector('.next-button').onclick = () => {
        if (currentPlaylist.length) {
            const nextIdx = getNextTrackIndex();
            if (nextIdx !== -1 && nextIdx !== currentTrackIndex) {
                currentTrackIndex = nextIdx;
                playTrack(currentTrackIndex);
                preloadNextTrack();   // ✅ добавить
            }
            if (queueOverlay.classList.contains('active')) renderQueue();
            updateExpandedQueue();
        }
    };

    document.querySelector('.prev-button').onclick = () => {
        if (!currentPlaylist.length) return;
        const THRESHOLD = 5;
        if (audioPlayer.currentTime > THRESHOLD) {
            audioPlayer.currentTime = 0;
            const percent = 0;
            progressFill.style.width = '0%';
            document.querySelector('.progress-handle').style.left = '0%';
            currentTimeEl.textContent = formatTime(0);
            if (expandedModal && expandedModal.classList.contains('active')) {
                syncExpandedProgress();
            }
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            playTrack(currentTrackIndex);
            preloadNextTrack();
        }
    };

    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        if (isRepeat) isShuffle = false;
        repeatBtn.classList.toggle('active', isRepeat);
        shuffleBtn.classList.toggle('active', isShuffle);
        if (queueOverlay.classList.contains('active')) renderQueue();
        if (expandedRepeatBtn) expandedRepeatBtn.classList.toggle('active', isRepeat);
        if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);
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

            if (expandedModal && expandedModal.classList.contains('active')) {
                renderExpandedQueue();
            }
        }
        shuffleBtn.classList.toggle('active', isShuffle);
        repeatBtn.classList.toggle('active', isRepeat);
        if (queueOverlay.classList.contains('active')) renderQueue();
        if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);
        if (expandedRepeatBtn) expandedRepeatBtn.classList.toggle('active', isRepeat);
        preloadNextTrack();
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
        const savedSearch = searchQuery;
        const savedSearchInputValue = searchInput ? searchInput.value : '';

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

        if (savedSearch && searchInput) {
            searchInput.value = savedSearchInputValue;
            searchQuery = savedSearch;
            if (libraryView.style.display === 'block' && !filterPlaylists.classList.contains('active')) {
                filterItems();
            }
        }
    }

    /* ОЧЕРЕДЬ */
    // Функция для рендера очереди в оверлее
    function renderQueue() {
        const queueList = document.getElementById('queue-list');
        if (!queueList) return;

        queueList.innerHTML = '';

        let queueTracks = [];
        if (currentTrackIndex !== -1 && currentPlaylist.length > 0) {
            queueTracks = currentPlaylist.slice(currentTrackIndex);
            if (isRepeat) {
                queueTracks = [...queueTracks, ...currentPlaylist.slice(0, currentTrackIndex)];
            }
        } else {
            queueTracks = currentPlaylist;
        }

        queueTracks.forEach((track, idx) => {
            const isCurrent = (idx === 0);
            const item = document.createElement('div');
            item.className = `queue-item ${isCurrent ? 'current' : ''}`;
            item.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; width:100%;">
                <span style="opacity:0.5; width:20px; font-size:12px;">${idx + 1}</span>
                <div style="flex-grow:1; overflow:hidden;">
                    <div style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(track.title || 'Без названия')}</div>
                    <div style="font-size:11px; opacity:0.6;">${escapeHtml(track.artist || 'Неизвестен')}</div>
                </div>
                ${isCurrent ? '<i class="fas fa-volume-up" style="color:#a855f7"></i>' : ''}
            </div>
        `;
            item.onclick = () => {
                const realIndex = currentPlaylist.findIndex(t => t.id === track.id);
                if (realIndex !== -1) {
                    currentTrackIndex = realIndex;
                    playTrack(currentTrackIndex);
                    if (queueOverlay.classList.contains('active')) renderQueue();
                    if (expandedModal && expandedModal.classList.contains('active')) renderExpandedQueue();
                }
            };
            queueList.appendChild(item);
        });
    }

    // Кнопка "Очередь" в основном плеере
    queueBtn.onclick = (e) => {
        e.stopPropagation();
        if (!expandedModal?.classList.contains('active')) {
            openExpandedPlayer();
        }
        setTimeout(() => {
            if (isLyricsOpen) {
                closeLyrics();
            }
            const twoColumns = document.querySelector('.expanded-two-columns');
            const rightBlock = document.querySelector('.expanded-right-block');
            if (twoColumns && rightBlock) {
                let queueContainer = rightBlock.querySelector('.expanded-queue-container');
                if (!queueContainer) {
                    queueContainer = document.createElement('div');
                    queueContainer.className = 'expanded-queue-container';
                    queueContainer.innerHTML = `<div class="expanded-queue-wrapper"><div id="queue-previous-list"></div><div class="queue-section-header">Сейчас играет</div><div id="queue-current-container"></div><div class="queue-section-header">Далее в очереди</div><div id="queue-upcoming-list"></div></div>`;
                    rightBlock.appendChild(queueContainer);
                }
                const lyricsContainer = rightBlock.querySelector('.lyrics-container');
                if (lyricsContainer) lyricsContainer.style.display = 'none';
                queueContainer.style.display = 'flex';
                twoColumns.classList.add('queue-open');
                if (typeof renderExpandedQueue === 'function') renderExpandedQueue();
                const queueBtnPc = document.getElementById('expanded-cover-queue');
                if (queueBtnPc) queueBtnPc.classList.add('active');
                const lyricsBtnPc = document.getElementById('expanded-cover-lyrics');
                if (lyricsBtnPc) lyricsBtnPc.classList.remove('active');
                const mobileQueue = document.getElementById('mobile-queue-toggle');
                if (mobileQueue) mobileQueue.classList.add('active');
                const mobileLyrics = document.getElementById('mobile-lyrics-toggle');
                if (mobileLyrics) mobileLyrics.classList.remove('active');
            }
        }, 100);
    };

    closeQueue.onclick = () => queueOverlay.classList.remove('active');

    /* ПРОФИЛЬ И СТАТИСТИКА */
    // Кликабельная статистика на главной
    const statTracks = document.getElementById('preview-tracks');
    const statLiked = document.getElementById('preview-liked');
    const statMinutes = document.getElementById('total-minutes');

    if (statTracks && statTracks.parentElement) {
        statTracks.parentElement.style.cursor = 'pointer';
        statTracks.parentElement.addEventListener('click', () => {
            navLinks.forEach(link => {
                if (link.textContent.trim() === 'Медиатека') {
                    link.click();
                }
            });
            if (filterAll) filterAll.click();
        });
    }

    if (statLiked && statLiked.parentElement) {
        statLiked.parentElement.style.cursor = 'pointer';
        statLiked.parentElement.addEventListener('click', () => {
            navLinks.forEach(link => {
                if (link.textContent.trim() === 'Медиатека') {
                    link.click();
                }
            });
            if (filterLiked) filterLiked.click();
        });
    }

    if (statMinutes && statMinutes.parentElement) {
        statMinutes.parentElement.style.cursor = 'pointer';
        statMinutes.parentElement.addEventListener('click', () => {
            if (!allUserTracks.length) {
                toast('Нет треков для статистики', 'info');
                return;
            }

            const longestTrack = [...allUserTracks].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];
            let longestInfo = 'Нет данных';
            if (longestTrack && longestTrack.duration) {
                const minutes = Math.floor(longestTrack.duration / 60);
                const seconds = longestTrack.duration % 60;
                longestInfo = `<strong>${escapeHtml(longestTrack.title)}</strong><br>${minutes}:${seconds.toString().padStart(2, '0')} мин.`;
            }

            const likedTracks = allUserTracks.filter(t => t.is_liked);
            const artistStats = {};
            likedTracks.forEach(track => {
                const artists = track.artists || (track.artist_display ? [track.artist_display] : []);
                artists.forEach(artist => {
                    if (artist && artist !== 'Неизвестен') {
                        artistStats[artist] = (artistStats[artist] || 0) + 1;
                    }
                });
            });

            let topArtistName = 'Нет лайков';
            if (Object.keys(artistStats).length > 0) {
                const sortedArtists = Object.entries(artistStats).sort((a, b) => b[1] - a[1]);
                topArtistName = escapeHtml(sortedArtists[0][0]);
            }

            const totalMinutes = parseInt(statMinutes.textContent) || 0;
            const hours = Math.floor(totalMinutes / 60);
            const restMinutes = totalMinutes % 60;
            const totalTimeInfo = hours > 0
                ? `${hours} ч ${restMinutes} мин.`
                : `${totalMinutes} мин.`;

            Swal.fire({
                title: 'Твоя музыкальная статистика',
                html: `
                    <div style="margin-top: 16px;">
                        <div style="margin-bottom: 28px;">
                            <div style="font-weight: 700; margin-bottom: 16px; color: #9D4EDD;">Самый долгий трек</div>
                            <div style="font-weight: 400; line-height: 1.5;">${longestInfo}</div>
                        </div>
                        <div style="margin-bottom: 28px;">
                            <div style="font-weight: 700; margin-bottom: 16px; color: #9D4EDD;">Любимый исполнитель</div>
                            <div style="font-weight: 400; line-height: 1.5;">${topArtistName}</div>
                        </div>
                        <div>
                            <div style="font-weight: 700; margin-bottom: 16px; color: #9D4EDD;">Всего прослушано</div>
                            <div style="font-weight: 400; line-height: 1.5;">${totalTimeInfo}</div>
                        </div>
                    </div>
                `,
                background: '#1E1E1E',
                color: '#FFFFFF',
                confirmButtonText: 'Круто!',
                iconHtml: '<i class="fas fa-music" style="font-size: 68px; color: #9D4EDD;"></i>',
                customClass: {
                    popup: 'custom-swal-popup',
                    confirmButton: 'swal2-confirm'
                },
                buttonsStyling: false
            });
        });
    }

    /* Статистика в профиле */
    async function loadProfileStatsAndAvatar() {
        if (!currentUser) {
            const avatarImg = document.getElementById('avatar-img');
            const avatarIcon = document.getElementById('avatar-icon');
            if (avatarImg) {
                avatarImg.style.display = 'none';
                avatarImg.src = '';
            }
            if (avatarIcon) avatarIcon.style.display = 'block';

            const profileUsername = document.getElementById('profile-username');
            if (profileUsername) profileUsername.style.display = 'none';

            return;
        }

        const statTracks = document.getElementById('stat-tracks');
        const statPlaylists = document.getElementById('stat-playlists');
        const statLiked = document.getElementById('stat-liked');
        const statMinutes = document.getElementById('stat-minutes');
        const avatarImg = document.getElementById('avatar-img');
        const avatarIcon = document.getElementById('avatar-icon');
        const profileDisplayName = document.getElementById('profile-display-name');
        const profileUsername = document.getElementById('profile-username');

        const cachedTracks = loadCachedTracks();
        const cachedPlaylists = loadCachedPlaylists();

        // Если есть кешированные данные, используются они, а не делаются запросы к БД
        if (cachedTracks && cachedPlaylists) {
            const tracksCount = cachedTracks.length;
            const likedCount = cachedTracks.filter(t => t.is_liked).length;
            const playlistsCount = cachedPlaylists.length;

            let totalSeconds = 0;
            cachedTracks.forEach(track => {
                totalSeconds += track.duration || 0;
            });
            const totalMinutes = Math.floor(totalSeconds / 60);

            if (statTracks) statTracks.textContent = tracksCount;
            if (statPlaylists) statPlaylists.textContent = playlistsCount;
            if (statLiked) statLiked.textContent = likedCount;
            if (statMinutes) statMinutes.textContent = totalMinutes || 0;

            const tracksLabel = document.querySelector('#stat-tracks')?.closest('.stat-item')?.querySelector('.stat-label');
            const playlistsLabel = document.querySelector('#stat-playlists')?.closest('.stat-item')?.querySelector('.stat-label');
            const likedLabel = document.querySelector('#stat-liked')?.closest('.stat-item')?.querySelector('.stat-label');
            const minutesLabel = document.querySelector('#stat-minutes')?.closest('.stat-item')?.querySelector('.stat-label');

            if (tracksLabel) tracksLabel.textContent = declension(tracksCount, ['трек', 'трека', 'треков']);
            if (playlistsLabel) playlistsLabel.textContent = declension(playlistsCount, ['плейлист', 'плейлиста', 'плейлистов']);
            if (likedLabel) likedLabel.textContent = declension(likedCount, ['лайк', 'лайка', 'лайков']);
            if (minutesLabel) minutesLabel.textContent = declension(totalMinutes, ['минута', 'минуты', 'минут']);

            // Загрузка аватара и имени из кеша
            const { data: userData, error } = await supabase
                .from('users_data')
                .select('avatar_url, display_name')
                .eq('id', currentUser)
                .single();

            if (!error && userData) {
                const displayName = userData.display_name || userData.username;
                localStorage.setItem('my_user_name', displayName);
                if (profileDisplayName) profileDisplayName.textContent = displayName;
                if (profileUsername) profileUsername.style.display = 'none';

                if (avatarImg && avatarIcon) {
                    if (userData.avatar_url) {
                        const cachedAvatarUrl = cacheImageUrl(userData.avatar_url, `avatar_${currentUser}`);
                        avatarImg.src = cachedAvatarUrl;
                        avatarImg.style.display = 'block';
                        avatarIcon.style.display = 'none';
                    } else {
                        avatarImg.style.display = 'none';
                        avatarIcon.style.display = 'block';
                    }
                }
            }

            return;
        }

        // Если нет кеша, загружаются данные из БД
        const { data: userData, error } = await supabase
            .from('users_data')
            .select('avatar_url, display_name')
            .eq('id', currentUser)
            .single();

        if (error || !userData) {
            const avatarImg = document.getElementById('avatar-img');
            const avatarIcon = document.getElementById('avatar-icon');
            if (avatarImg) avatarImg.style.display = 'none';
            if (avatarIcon) avatarIcon.style.display = 'block';

            if (profileUsername) profileUsername.style.display = 'none';
            return;
        }

        const displayName = userData.display_name || userData.username;
        localStorage.setItem('my_user_name', displayName);

        if (profileDisplayName) profileDisplayName.textContent = displayName;

        if (profileUsername) {
            profileUsername.style.display = 'none';
        }

        const { count: tracksCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('user_id', currentUser);
        const { count: playlistsCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('user_id', currentUser);
        const { count: likedCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('user_id', currentUser).eq('is_liked', true);

        if (statTracks) statTracks.textContent = tracksCount || 0;
        if (statPlaylists) statPlaylists.textContent = playlistsCount || 0;
        if (statLiked) statLiked.textContent = likedCount || 0;

        const { data: tracks } = await supabase
            .from('tracks')
            .select('duration')
            .eq('user_id', currentUser);

        let totalSeconds = 0;
        if (tracks && tracks.length) {
            totalSeconds = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
        }

        const totalMinutes = Math.floor(totalSeconds / 60);
        if (statMinutes) statMinutes.textContent = totalMinutes || 0;

        // Подписи (.stat-label) с правильными падежами
        const tracksLabel = document.querySelector('#stat-tracks')?.closest('.stat-item')?.querySelector('.stat-label');
        const playlistsLabel = document.querySelector('#stat-playlists')?.closest('.stat-item')?.querySelector('.stat-label');
        const likedLabel = document.querySelector('#stat-liked')?.closest('.stat-item')?.querySelector('.stat-label');
        const minutesLabel = document.querySelector('#stat-minutes')?.closest('.stat-item')?.querySelector('.stat-label');

        if (tracksLabel) tracksLabel.textContent = declension(tracksCount || 0, ['трек', 'трека', 'треков']);
        if (playlistsLabel) playlistsLabel.textContent = declension(playlistsCount || 0, ['плейлист', 'плейлиста', 'плейлистов']);
        if (likedLabel) likedLabel.textContent = declension(likedCount || 0, ['лайк', 'лайка', 'лайков']);
        if (minutesLabel) minutesLabel.textContent = declension(totalMinutes || 0, ['минута', 'минуты', 'минут']);

        if (avatarImg && avatarIcon) {
            if (userData.avatar_url) {
                const cachedAvatarUrl = cacheImageUrl(userData.avatar_url, `avatar_${currentUser}`);
                const isCached = getCachedImageUrl(`avatar_${currentUser}`) === userData.avatar_url;
                avatarImg.src = isCached ? cachedAvatarUrl : `${cachedAvatarUrl}?t=${Date.now()}`;
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
            .select('id, title, artist_display, cover_url, file_url, is_liked, duration')
            .eq('user_id', currentUser);

        if (!tracks) return;

        for (const track of tracks) {
            track.artists = await loadTrackArtists(track.id);
            track.artist = track.artist_display;
            track.album = track.album_display || 'Unknown Album';
            track.duration = track.duration || 0;
        }

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
            const isLikedFilter = filterLiked?.classList.contains('active');
            const hasSearchQuery = searchQuery.trim().length > 0;

            if (isLikedFilter && !hasSearchQuery) {
                tracksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>Нет любимых треков</h3>
                        <p>Поставьте лайк треку, и он появится в этом разделе</p>
                    </div>
                `;
            } else if (hasSearchQuery) {
                tracksList.innerHTML = `
                    <div class="not-found-placeholder">
                        <i class="fas fa-search"></i>
                        <h3>Ничего не найдено</h3>
                        <p>По запросу "${escapeHtml(searchQuery)}" ничего не найдено</p>
                    </div>
                `;
            } else {
                tracksList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-music"></i>
                        <h3>Здесь пока ничего нет</h3>
                        <p>Загрузите свой первый трек</p>
                    </div>
                `;
            }
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
                <div class="card-info">
                    <div class="track-title-text">${escapeHtml(track.title)}</div>
                    <div class="track-author">${escapeHtml(track.artist || track.artist_display || 'Неизвестен')}</div>
                </div>
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

            let scrollHandler = null;

            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();

                document.querySelectorAll('.track-context-menu.active, .playlist-context-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });

                contextMenu.classList.toggle('active');

                if (contextMenu.classList.contains('active')) {
                    scrollHandler = () => {
                        contextMenu.classList.remove('active');
                        window.removeEventListener('scroll', scrollHandler);
                    };
                    window.addEventListener('scroll', scrollHandler);
                } else {
                    if (scrollHandler) {
                        window.removeEventListener('scroll', scrollHandler);
                        scrollHandler = null;
                    }
                }
            });

            tracksList.appendChild(card);
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.track-context-menu.active').forEach(menu => menu.classList.remove('active'));
        });
    }

    // Функция для воспроизведения трека по индексу в текущем плейлисте
    function playTrack(index) {
        // Защита от двойного вызова
        if (isPlayingNow) {
            pendingPlayIndex = index;
            return;
        }

        const rightBlock = document.querySelector('.expanded-right-block');
        if (rightBlock) {
            const lyricsContainer = rightBlock.querySelector('.lyrics-container');
            if (!lyricsContainer || lyricsContainer.style.display !== 'flex') {
                if (isLyricsOpen) {
                    isLyricsOpen = false;
                }
                if (lyricsSyncInterval) {
                    clearInterval(lyricsSyncInterval);
                    lyricsSyncInterval = null;
                }
                const allLyricsBtns = document.querySelectorAll('#lyrics-toggle-button, .mobile-lyrics-toggle, #expanded-cover-lyrics');
                allLyricsBtns.forEach(btn => btn?.classList.remove('active'));
            }
        }

        isLoadingTrack = true;
        isPlayingNow = true;

        try {
            currentTimeEl.textContent = '0:00';
            totalTimeEl.textContent = '0:00';
            progressFill.style.width = '0%';
            document.querySelector('.progress-handle').style.left = '0%';

            if (index < 0 || index >= currentPlaylist.length) {
                isPlayingNow = false;
                return;
            }

            showPlayer();
            const track = currentPlaylist[index];
            currentTrackId = track.id;

            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            audioPlayer.src = '';

            document.querySelector('.track-name').textContent = track.title || 'Без названия';

            let artistName = 'Неизвестен';
            if (track.artist) {
                artistName = track.artist;
            } else if (track.artist_display) {
                artistName = track.artist_display;
            } else if (track.artists && track.artists.length > 0) {
                artistName = track.artists.join(', ');
            }
            document.querySelector('.track-artist').textContent = artistName;

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

            const playHandler = () => {
                audioPlayer.removeEventListener('canplay', playHandler);
                audioPlayer.play()
                    .then(() => {
                        saveToRecent(track);
                        isPlayingNow = false;
                        isLoadingTrack = false;
                        syncPlayPauseIcon();

                        if (pendingPlayIndex !== null) {
                            const pending = pendingPlayIndex;
                            pendingPlayIndex = null;
                            playTrack(pending);
                        }
                    })
                    .catch(error => {
                        isPlayingNow = false;
                        isLoadingTrack = false;
                        syncPlayPauseIcon();
                        if (pendingPlayIndex !== null) {
                            const pending = pendingPlayIndex;
                            pendingPlayIndex = null;
                            setTimeout(() => playTrack(pending), 100);
                        }
                    });
            };

            audioPlayer.addEventListener('canplay', playHandler, { once: true });

            setTimeout(() => {
                if (isPlayingNow && audioPlayer.readyState >= 2) {
                    audioPlayer.removeEventListener('canplay', playHandler);
                    audioPlayer.play()
                        .then(() => {
                            saveToRecent(track);
                            isPlayingNow = false;
                            isLoadingTrack = false;
                            syncPlayPauseIcon();
                        })
                        .catch(() => {
                            isPlayingNow = false;
                            isLoadingTrack = false;
                            syncPlayPauseIcon();
                        });
                }
            }, 500);

            if (queueOverlay.classList.contains('active')) renderQueue();

            if (expandedModal && expandedModal.classList.contains('active')) {
                updateExpandedPlayer();
                syncExpandedProgress();
                renderExpandedQueue();

                setTimeout(() => {
                    const currentElement = document.querySelector('#queue-current-container .expanded-queue-item');
                    if (currentElement) {
                        currentElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 150);
            }
        } catch (err) {
            isPlayingNow = false;
        }

        setTimeout(() => {
            if (!expandedModal?.classList.contains('active') || (document.querySelector('.lyrics-container')?.style.display !== 'flex')) {
                const allLyricsBtns = document.querySelectorAll('#lyrics-toggle-button, .mobile-lyrics-toggle, #expanded-cover-lyrics');
                allLyricsBtns.forEach(btn => btn?.classList.remove('active'));
                isLyricsOpen = false;
                if (lyricsSyncInterval) {
                    clearInterval(lyricsSyncInterval);
                    lyricsSyncInterval = null;
                }
            }
        }, 10);
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
            case 'artist':
                sorted.sort((a, b) => {
                    const aArtist = a.artists?.[0] || a.artist_display || '';
                    const bArtist = b.artists?.[0] || b.artist_display || '';
                    return aArtist.localeCompare(bArtist);
                });
                break;
        }
        if (filterLiked?.classList.contains('active')) renderTracks(sorted.filter(t => t.is_liked));
        else renderTracks(sorted);
    }

    // Инициализация обработчиков для кнопок сортировки
    function initSortButtons() {
        const sortBtns = document.querySelectorAll('.sort-button');
        sortBtns.forEach(btn => {
            if (btn._listener) btn.removeEventListener('click', btn._listener);

            const handler = () => {
                const sortType = btn.dataset.sort;
                const isPlaylistsVisible = playlistsViewContainer && playlistsViewContainer.style.display === 'block';

                // Для треков
                if (!isPlaylistsVisible) {
                    if (btn.classList.contains('active')) {
                        currentSort = 'default';
                        sortBtns.forEach(b => b.classList.remove('active'));
                    } else {
                        currentSort = sortType;
                        sortBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    sortAndRenderTracks();
                    return;
                }

                // Для плейлистов
                if (!originalPlaylists.length) return;

                if (btn.classList.contains('active')) {
                    sortBtns.forEach(b => b.classList.remove('active'));
                    renderPlaylists(originalPlaylists);
                    return;
                }

                sortBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const sorted = [...originalPlaylists];

                if (sortType === 'newest') {
                    sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
                } else if (sortType === 'oldest') {
                    sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
                } else if (sortType === 'title') {
                    sorted.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortType === 'duration') {
                    sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
                }

                renderPlaylists(sorted);
            };

            btn._listener = handler;
            btn.addEventListener('click', handler);
        });
    }

    initSortButtons();

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
            for (const p of originalPlaylists) {
                p.duration = await getPlaylistDuration(p.id);
            }
            renderPlaylists(originalPlaylists);
            return;
        }

        const { data } = await supabase
            .from('playlists')
            .select('id, name, cover_url, user_id, created_at')
            .eq('user_id', currentUser);

        if (!data || !data.length) {
            originalPlaylists = [];
            renderPlaylists([]);
            return;
        }

        for (const p of data) {
            const { count } = await supabase
                .from('playlist_tracks')
                .select('*', { count: 'exact', head: true })
                .eq('playlist_id', p.id);
            p.track_count = count || 0;
            const duration = await getPlaylistDuration(p.id);
            p.duration = duration;
        }

        originalPlaylists = data;

        originalPlaylists.forEach(playlist => {
            if (playlist.cover_url) {
                playlist.cover_url = cacheImageUrl(playlist.cover_url, `playlist_${playlist.id}`);
            }
        });

        cachePlaylists(originalPlaylists);
        renderPlaylists(originalPlaylists);
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
                <div class="card-image">
                    ${playlist.cover_url ? `<img src="${playlist.cover_url}" loading="lazy" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : '<i class="fas fa-folder"></i>'}
                </div>
                <div class="card-info">
                    <div class="track-title-text">${escapeHtml(playlist.name)}</div>
                    <div class="track-author">Треков: ${playlist.track_count || 0}</div>
                    <div class="track-duration">${formatPlaylistDuration(playlist.duration || 0)}</div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-trigger')) return;
                if (e.target.closest('.playlist-context-menu button')) return;
                playPlaylist(playlist.id);
            });

            const menuTrigger = card.querySelector('.track-menu-trigger');
            const contextMenu = card.querySelector('.track-context-menu');

            let scrollHandler = null;

            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();

                document.querySelectorAll('.track-context-menu.active, .playlist-context-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });

                contextMenu.classList.toggle('active');

                if (contextMenu.classList.contains('active')) {
                    scrollHandler = () => {
                        contextMenu.classList.remove('active');
                        window.removeEventListener('scroll', scrollHandler);
                    };
                    window.addEventListener('scroll', scrollHandler);
                } else {
                    if (scrollHandler) {
                        window.removeEventListener('scroll', scrollHandler);
                        scrollHandler = null;
                    }
                }
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
                    iconColor: '#CF6679',
                    showCancelButton: true,
                    confirmButtonText: 'Удалить',
                    cancelButtonText: 'Отмена',
                    background: '#1E1E1E',
                    color: '#FFFFFF',
                    customClass: {
                        popup: 'custom-swal-popup',
                        confirmButton: 'swal2-confirm',
                        cancelButton: 'swal2-cancel'
                    },
                    buttonsStyling: false
                });
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
        playTrack(0);
        if (queueOverlay.classList.contains('active')) renderQueue();
    }

    let currentPlaylistId = null;

    async function openPlaylistView(playlistId, playlistName) {
        currentPlaylistId = playlistId;
        document.getElementById('playlist-view-title').innerHTML = `${escapeHtml(playlistName)}`;

        const { data: playlistTracks } = await supabase.from('playlist_tracks').select('track_id').eq('playlist_id', playlistId);
        const trackCount = playlistTracks?.length || 0;

        let totalDuration = 0;
        if (trackCount > 0) {
            const trackIds = playlistTracks.map(item => item.track_id);
            const { data: tracks } = await supabase.from('tracks').select('duration').in('id', trackIds);
            if (tracks) {
                totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
            }
        }

        const statsContainer = document.getElementById('playlist-stats');
        const totalMinutes = Math.floor(totalDuration / 60);
        statsContainer.innerHTML = `
            <div class="playlist-stat-item">
                <div class="playlist-stat-value">${trackCount}</div>
                <div class="playlist-stat-label">${declension(trackCount, ['трек', 'трека', 'треков'])}</div>
            </div>
            <div class="playlist-stat-item">
                <div class="playlist-stat-value">${totalMinutes} ${declension(totalMinutes, ['минута', 'минуты', 'минут'])}</div>
                <div class="playlist-stat-label">длительность</div>
            </div>
        `;

        const container = document.getElementById('playlist-tracks-list');
        container.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
        if (!playlistTracks || !playlistTracks.length) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">В плейлисте нет треков</p>';
            document.getElementById('playlist-view-modal').style.display = 'flex';
            document.getElementById('playlist-view-modal').style.opacity = '1';
            return;
        }
        const trackIds = playlistTracks.map(item => item.track_id);
        const { data: tracks } = await supabase.from('tracks').select('*').in('id', trackIds);
        if (!tracks || !tracks.length) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Треки не найдены</p>';
            document.getElementById('playlist-view-modal').style.display = 'flex';
            document.getElementById('playlist-view-modal').style.opacity = '1';
            return;
        }
        const orderedTracks = trackIds.map(id => tracks.find(t => t.id === id)).filter(t => t);
        for (const track of orderedTracks) {
            if (!track.artists || track.artists.length === 0) {
                track.artists = await loadTrackArtists(track.id);
                track.artist = track.artists?.join(', ') || track.artist_display || 'Неизвестен';
            } else {
                track.artist = track.artists.join(', ');
            }
        }
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
                    <div style="flex:1;">
                        <div style="font-weight:500; text-align: left; gap:16px;">${track.title}</div>
                        <div style="font-size:11px; color:#888; text-align: left; gap:16px;">${track.artist || 'Неизвестен'}</div>
                    </div>
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
        document.getElementById('playlist-view-modal').style.opacity = '1';
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
        const saveBtn = document.getElementById('save-playlist-edit');
        const originalText = saveBtn.textContent;

        const newName = document.getElementById('edit-playlist-name').value.trim();
        if (!newName) {
            toast("Введите название", "error");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = "Сохранение...";

        try {
            let newCoverUrl = currentEditPlaylistCoverUrl;
            if (window.newEditPlaylistCover) {
                const file = window.newEditPlaylistCover;
                const ext = file.name.split('.').pop();
                const fileName = `playlist_cover_${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from('covers').upload(fileName, file);
                if (!uploadErr) {
                    const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName);
                    newCoverUrl = urlData.publicUrl;
                    clearImageCache(`playlist_${currentEditPlaylistId}`);
                } else {
                    toast("Ошибка загрузки обложки", "error");
                }
            }

            const { error } = await supabase.from('playlists').update({
                name: newName,
                cover_url: newCoverUrl
            }).eq('id', currentEditPlaylistId);

            if (error) {
                toast("Ошибка сохранения", "error");
            } else {
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
        } catch (err) {
            toast("Ошибка: " + err.message, "error");
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });

    document.getElementById('delete-playlist')?.addEventListener('click', async () => {
        const confirm = await Swal.fire({
            title: 'Удалить плейлист?',
            text: 'Треки при этом не удалятся',
            icon: 'warning',
            iconColor: '#CF6679',
            showCancelButton: true,
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            background: '#1E1E1E',
            color: '#FFFFFF',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            },
            buttonsStyling: false
        });
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
        if (!playlistTracks?.length) return 0;
        const trackIds = playlistTracks.map(item => item.track_id);
        const { data: tracks } = await supabase
            .from('tracks')
            .select('duration')
            .in('id', trackIds);
        if (!tracks) return 0;
        return tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    }

    // Форматирование длительности
    function formatPlaylistDuration(seconds) {
        if (!seconds || seconds === 0) return '0 мин';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} ${declension(hours, ['час', 'часа', 'часов'])} ${minutes} ${declension(minutes, ['минута', 'минуты', 'минут'])}`;
        }
        return `${minutes} ${declension(minutes, ['минута', 'минуты', 'минут'])}`;
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
        if (expandedContextMenu) expandedContextMenu.classList.remove('active');

        if (!currentUser) {
            toast("Войдите в аккаунт", "error");
            return;
        }

        currentEditTrackId = trackId;
        document.getElementById('edit-track-title').value = currentTitle || '';
        document.getElementById('edit-track-artist').value = currentArtist || '';

        // Сбрасываем выбор аудиофайла
        const audioInput = document.getElementById('edit-track-audio-input');
        if (audioInput) audioInput.value = '';
        const audioFilenameSpan = document.getElementById('edit-audio-filename');
        if (audioFilenameSpan) audioFilenameSpan.textContent = 'Заменить аудиофайл';

        let coverUrl = null;
        try {
            const { data: track } = await supabase
                .from('tracks')
                .select('cover_url, file_url')
                .eq('id', trackId)
                .single();
            coverUrl = track?.cover_url || null;
            window.currentAudioUrl = track?.file_url || null;
        } catch (e) {
        }

        currentEditCoverUrl = coverUrl;
        const previewImg = document.getElementById('edit-cover-preview');
        const placeholder = document.getElementById('edit-cover-placeholder');
        if (currentEditCoverUrl && previewImg) {
            previewImg.src = currentEditCoverUrl;
            previewImg.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (previewImg) previewImg.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
        }

        const coverInput = document.getElementById('edit-track-cover-input');
        if (coverInput) coverInput.value = '';
        window.newEditCover = null;
        window.newEditAudio = null;

        const editModal = document.getElementById('edit-track-modal');
        if (editModal) {
            editModal.style.display = 'flex';
            editModal.style.opacity = '1';
            editModal.style.zIndex = '10001';
        }
    }

    function setupEditAudioDropzone() {
        const zone = document.getElementById('edit-audio-dropzone');
        const fileInput = document.getElementById('edit-track-audio-input');
        const filenameSpan = document.getElementById('edit-audio-filename');

        if (!zone || !fileInput) return;

        function updateDisplay(file) {
            if (file) {
                filenameSpan.textContent = file.name;
                window.newEditAudio = file;
            } else {
                filenameSpan.textContent = 'Заменить аудиофайл';
                window.newEditAudio = null;
            }
        }

        zone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0] || null;
            updateDisplay(file);

            ignoreModalCloseForEditTrack = true;
            setTimeout(() => { ignoreModalCloseForEditTrack = false; }, 500);
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
                const validTypes = ['.mp3', '.wav', '.m4a', '.aac'];
                const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
                if (isValid) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                    updateDisplay(file);
                } else {
                    toast("Неподдерживаемый формат аудио", "error");
                }
            }
        });
    }

    setupEditAudioDropzone();

    document.getElementById('save-track-edit')?.addEventListener('click', async () => {
        const btn = document.getElementById('save-track-edit');
        const originalText = btn.textContent;

        const newTitle = document.getElementById('edit-track-title').value.trim();
        const newArtist = document.getElementById('edit-track-artist').value.trim();
        const newCoverFile = document.getElementById('edit-track-cover-input').files[0] || window.newEditCover;
        const newAudioFile = document.getElementById('edit-track-audio-input').files[0] || window.newEditAudio;

        if (!newTitle) {
            toast("Введите название", "error");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Сохранение...";

        try {
            let newCoverUrl = currentEditCoverUrl;
            let newFileUrl = window.currentAudioUrl;

            if (newCoverFile) {
                const coverFileName = `cover_${Date.now()}_${newCoverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const { error: coverError } = await supabase.storage.from('covers').upload(coverFileName, newCoverFile);
                if (!coverError) {
                    newCoverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName).data.publicUrl;
                    if (currentEditCoverUrl) {
                        const oldCoverPath = currentEditCoverUrl.split('/').pop();
                        await supabase.storage.from('covers').remove([oldCoverPath]);
                    }
                } else {
                    toast("Ошибка загрузки обложки", "error");
                }
            }

            if (newAudioFile) {
                const audioFileName = `song_${Date.now()}_${newAudioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const { error: audioError } = await supabase.storage.from('songs').upload(audioFileName, newAudioFile);
                if (!audioError) {
                    newFileUrl = supabase.storage.from('songs').getPublicUrl(audioFileName).data.publicUrl;
                    if (window.currentAudioUrl) {
                        const oldAudioPath = window.currentAudioUrl.split('/').pop();
                        await supabase.storage.from('songs').remove([oldAudioPath]);
                    }

                    const tempAudio = document.createElement('audio');
                    tempAudio.preload = 'metadata';
                    tempAudio.src = URL.createObjectURL(newAudioFile);
                    await new Promise((resolve) => {
                        tempAudio.addEventListener('loadedmetadata', () => {
                            window.newDuration = Math.floor(tempAudio.duration);
                            resolve();
                        });
                        tempAudio.addEventListener('error', () => resolve());
                    });
                    URL.revokeObjectURL(tempAudio.src);
                } else {
                    toast("Ошибка загрузки аудиофайла", "error");
                }
            }

            const updateData = {
                title: newTitle,
                artist_display: newArtist || "Неизвестен",
                cover_url: newCoverUrl
            };

            if (newFileUrl) {
                updateData.file_url = newFileUrl;
            }

            if (window.newDuration) {
                updateData.duration = window.newDuration;
            }

            const { error } = await supabase.from('tracks').update(updateData).eq('id', currentEditTrackId);

            if (error) {
                toast("Ошибка обновления", "error");
                return;
            }

            const parsedArtists = parseArtists(newArtist);
            if (parsedArtists.length) {
                await saveTrackArtists(currentEditTrackId, parsedArtists);
            }

            toast("Трек обновлён");
            clearCache();
            document.getElementById('edit-track-modal').style.display = 'none';
            loadUserTracks();
            refreshAllData();

            if (currentTrackId === currentEditTrackId && newFileUrl) {
                const wasPlaying = !audioPlayer.paused;
                const currentTime = audioPlayer.currentTime;
                audioPlayer.src = newFileUrl;
                audioPlayer.load();
                if (wasPlaying) {
                    audioPlayer.currentTime = currentTime;
                    audioPlayer.play();
                }
            }

        } catch (err) {
            toast("Ошибка: " + err.message, "error");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
            window.newDuration = null;
        }
    });

    /* ДОБАВЛЕНИЕ ТРЕКА В ПЛЕЙЛИСТ */
    let currentAddTrackId = null;
    async function showAddToPlaylistModal(trackId, trackTitle, trackArtist) {
        if (expandedContextMenu) expandedContextMenu.classList.remove('active');

        if (!currentUser) {
            toast("Войдите в аккаунт", "error");
            return;
        }

        currentAddTrackId = trackId;
        document.getElementById('add-to-playlist-track-name').innerHTML = `${trackTitle}<br><span style="font-size:12px; color:#888;">${trackArtist || 'Неизвестен'}</span>`;

        const { data: playlists } = await supabase
            .from('playlists')
            .select('id, name')
            .eq('user_id', currentUser);

        if (!playlists || !playlists.length) {
            toast("Нет плейлистов. Создайте сначала плейлист", "error");
            return;
        }

        const { data: existingTracks } = await supabase
            .from('playlist_tracks')
            .select('playlist_id')
            .eq('track_id', trackId);

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

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                checkbox.checked = !checkbox.checked;
                if (checkbox.checked) {
                    customCheckbox.classList.add('checked');
                } else {
                    customCheckbox.classList.remove('checked');
                }
            });

            container.appendChild(item);
        });

        const addModal = document.getElementById('add-to-playlist-modal');
        if (addModal) {
            addModal.style.display = 'flex';
            addModal.style.opacity = '1';
            addModal.style.zIndex = '10001';
        }
    }

    /* ФИЛЬТРАЦИЯ И ПОИСК */
    function filterItems() {
        if (filterPlaylists?.classList.contains('active')) {
            const query = searchQuery.trim().toLowerCase();
            if (!originalPlaylists.length) {
                renderPlaylists([]);
                return;
            }
            let filtered = [...originalPlaylists];
            if (query) {
                filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
            }

            if (currentSort === 'newest') {
                filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
            } else if (currentSort === 'oldest') {
                filtered.sort((a, b) => a.created_at.localeCompare(b.created_at));
            } else if (currentSort === 'title') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            }

            renderPlaylists(filtered);
            return;
        }

        let tracksToFilter = allUserTracks;
        if (filterLiked?.classList.contains('active')) {
            tracksToFilter = allUserTracks.filter(t => t.is_liked);
        }

        const query = searchQuery.trim().toLowerCase();

        if (!tracksToFilter.length) {
            renderTracks([]);
            return;
        }

        if (!query) {
            renderTracks(tracksToFilter);
        } else {
            const filtered = tracksToFilter.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.artist_display && t.artist_display.toLowerCase().includes(query)) ||
                (t.artists && t.artists.some(a => a.toLowerCase().includes(query)))
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

        const artistBtn = document.querySelector('.sort-by-artist');
        const durationBtn = document.querySelector('.sort-by-duration');

        if (sectionToShow === 'playlists') {
            tracksList.style.display = 'none';
            playlistsViewContainer.style.display = 'block';
            openUploadModalButton.style.display = 'none';
            createPlaylistButton.style.display = 'flex';
            if (currentUser) { loadPlaylists(); loadProfileStatsAndAvatar(); }
            else document.getElementById('playlists-grid').innerHTML = `<div class="empty-state"><i class="fas fa-lock"></i><h3>Требуется авторизация</h3><p>Войдите в аккаунт, чтобы увидеть плейлисты</p></div>`;

            // ПЛЕЙЛИСТЫ: микрофон скрыт, часы показаны
            if (artistBtn) artistBtn.style.display = 'none';
            if (durationBtn) durationBtn.style.display = 'flex';
        } else {
            tracksList.style.display = 'grid';
            playlistsViewContainer.style.display = 'none';
            openUploadModalButton.style.display = 'flex';
            createPlaylistButton.style.display = 'none';
            if (sortGroup) sortGroup.style.display = 'flex';

            // ТРЕКИ: микрофон показан, часы скрыты
            if (artistBtn) artistBtn.style.display = 'flex';
            if (durationBtn) durationBtn.style.display = 'none';
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
        uploadFormContainer.style.opacity = '1';
    });
    document.getElementById('close-upload-modal')?.addEventListener('click', () => {
        uploadFormContainer.style.opacity = '0';
        setTimeout(() => {
            uploadFormContainer.style.display = 'none';
            uploadFormContainer.style.opacity = '';
        }, 200);
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
        const originalButtonText = startUploadButton.textContent;
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

            const parsedArtists = parseArtists(artist);

            const { data: newTrack, error: dbError } = await supabase.from('tracks').insert({
                title,
                artist_display: artist || "Неизвестен",
                file_url: urlData.publicUrl,
                cover_url: coverUrl,
                user_id: currentUser,
                duration: audioDuration
            }).select().single();

            if (dbError) throw dbError;

            if (parsedArtists.length && newTrack) {
                await saveTrackArtists(newTrack.id, parsedArtists);
            }

            let coverPreviewUrl = null;
            if (coverFile) {
                coverPreviewUrl = URL.createObjectURL(coverFile);
            }

            Swal.fire({
                title: 'Трек добавлен!',
                html: `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin: 16px 0 8px 0;">
                        ${coverPreviewUrl ?
                        `<img src="${coverPreviewUrl}" style="width: 120px; height: 120px; border-radius: 16px; object-fit: cover; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">` :
                        `<div style="width: 120px; height: 120px; background: linear-gradient(135deg, #2A2A2A 0%, #1E1E1E 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                                <i class="fas fa-music" style="color: #9D4EDD; font-size: 48px;"></i>
                            </div>`
                    }
                        <div style="text-align: center;">
                            <div style="font-weight: 700; font-size: 20px; margin-bottom: 8px; color: #FFFFFF;">${escapeHtml(title)}</div>
                            <div style="font-size: 15px; color: #B3B3B3; margin-bottom: 6px;">${escapeHtml(artist || 'Неизвестен')}</div>
                            <div style="font-size: 13px; color: #888;">${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}</div>
                        </div>
                    </div>
                `,
                icon: 'success',
                iconColor: '#7B2CBF',
                background: '#1E1E1E',
                color: '#FFFFFF',
                showConfirmButton: true,
                confirmButtonText: 'Отлично!',
                confirmButtonColor: '#7B2CBF',
                showCancelButton: false,
                width: '380px',
                padding: '1.5rem',
                customClass: {
                    popup: 'custom-swal-popup',
                    confirmButton: 'swal2-confirm'
                },
                buttonsStyling: false,
                didOpen: () => {
                    // Убираем кастомную иконку, если она появилась
                    const iconElement = document.querySelector('.swal2-icon');
                    if (iconElement && iconElement.innerHTML.includes('fa-check-circle')) {
                        iconElement.innerHTML = '';
                    }
                }
            });

            if (coverPreviewUrl) {
                setTimeout(() => URL.revokeObjectURL(coverPreviewUrl), 3000);
            }

            resetUploadModal();
            uploadFormContainer.style.opacity = '0';
            setTimeout(() => {
                uploadFormContainer.style.display = 'none';
                uploadFormContainer.style.opacity = '';
            }, 200);
            clearCache();
            await loadUserTracks();
            loadUserTracks();
            updateHomePage();
            loadRecommendations();
            refreshAllData();

        } catch (err) {
            Swal.fire("Ошибка", err.message, "error");
        } finally {
            startUploadButton.disabled = false;
            startUploadButton.textContent = originalButtonText;
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
                        icon: 'warning',
                        iconColor: '#CF6679',
                        showCancelButton: true,
                        confirmButtonText: 'Удалить',
                        cancelButtonText: 'Отмена',
                        background: '#1E1E1E',
                        color: '#FFFFFF',
                        customClass: {
                            popup: 'custom-swal-popup',
                            confirmButton: 'swal2-confirm',
                            cancelButton: 'swal2-cancel'
                        },
                        buttonsStyling: false
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
                        } catch (err) { error(err); toast("Ошибка при удалении", "error"); }
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
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;

        if (!email || !pass) {
            toast("Заполните все поля", "error");
            return;
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: pass
            });

            if (authError) throw authError;

            const { data: userData, error: userError } = await supabase
                .from('users_data')
                .select('id, username, display_name')
                .eq('id', authData.user.id)
                .single();

            if (userError) throw userError;

            isRegistered = true;
            currentUser = userData.id;
            localStorage.setItem('my_user_uuid', userData.id);
            localStorage.setItem('my_user_name', userData.display_name || userData.username);

            await loadAllDataInParallel();
            hideAllSections();
            profileView.style.display = 'block';
            refreshAllData();

            toast(`С возвращением, ${userData.display_name || userData.username}!`);

        } catch (error) {
            toast("Неверный email или пароль", "error");
        }
    });

    regForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";

        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (!email || !password) {
            toast("Заполните все поля", "error");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            toast(passwordError, "error");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: email.split('@')[0],
                        display_name: email.split('@')[0]
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('rate limit')) {
                    toast("Слишком много попыток. Попробуйте позже.", "error");
                } else if (authError.message.includes('User already registered')) {
                    toast("Этот email уже зарегистрирован", "error");
                } else {
                    toast(authError.message, "error");
                }
                return;
            }

            if (authData.user?.identities?.length === 0) {
                toast("Этот email уже зарегистрирован. Попробуйте войти.", "info");
                return;
            }

            Swal.fire({
                title: '✅ Почти готово!',
                html: `
                    <div style="text-align: center;">
                        <i class="fas fa-envelope" style="font-size: 48px; color: #9D4EDD; margin-bottom: 16px;"></i>
                        <p style="margin-bottom: 8px;">Письмо с подтверждением отправлено на</p>
                        <p style="font-weight: bold; color: #9D4EDD; margin-bottom: 16px;">${escapeHtml(email)}</p>
                        <p style="font-size: 14px; color: #888;">Перейдите по ссылке в письме, чтобы войти в аккаунт.</p>
                        <p style="font-size: 12px; color: #666; margin-top: 16px;">Если письмо не пришло, проверьте папку Спам</p>
                    </div>
                `,
                icon: 'info',
                iconColor: '#9D4EDD',
                background: '#1E1E1E',
                color: '#FFFFFF',
                confirmButtonText: 'Понятно',
                confirmButtonColor: '#7B2CBF',
                customClass: {
                    popup: 'custom-swal-popup',
                    confirmButton: 'swal2-confirm'
                },
                buttonsStyling: false
            });

            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';

            setTimeout(() => {
                hideAllSections();
                loginView.style.display = 'block';
            }, 2000);

        } catch (err) {
            toast("Ошибка регистрации: " + err.message, "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    document.getElementById('logout-button')?.addEventListener('click', async () => {
        await supabase.auth.signOut();

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

        const { data, error } = await supabase
            .from('users_data')
            .select('display_name, avatar_url')
            .eq('id', currentUser)
            .single();

        if (error) { toast("Ошибка загрузки данных", "error"); return; }
        editProfileDisplayName.value = data.display_name || '';
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
        editProfileModal.style.opacity = '1';
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
        const btn = saveProfileEdit;
        const originalText = btn.textContent;

        const newDisplayName = editProfileDisplayName.value.trim();
        if (!newDisplayName) {
            toast("Отображаемое имя не может быть пустым", "error");
            return;
        }

        const newPassword = editProfileNewPass.value;
        const confirmPassword = editProfileConfirmPass.value;
        if (newPassword && newPassword !== confirmPassword) {
            toast("Пароли не совпадают", "error");
            return;
        }
        if (newPassword) {
            const passError = validatePassword(newPassword);
            if (passError) {
                toast(passError, "error");
                return;
            }
        }

        btn.disabled = true;
        btn.textContent = "Сохранение...";

        try {
            let finalAvatarUrl = null;

            if (window.newAvatarFile && window.newAvatarFile instanceof File) {
                const file = window.newAvatarFile;
                const fileExt = file.name.split('.').pop();
                const fileName = `avatar_${currentUser}_${Date.now()}.${fileExt}`;

                const { error: uploadErr } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file, { upsert: true });

                if (uploadErr) {
                    toast("Ошибка загрузки аватара: " + uploadErr.message, "error");
                    return;
                }

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                finalAvatarUrl = urlData.publicUrl;

                clearImageCache(`avatar_${currentUser}`);

                const { error: updateAvatarErr } = await supabase
                    .from('users_data')
                    .update({ avatar_url: finalAvatarUrl })
                    .eq('id', currentUser);

                if (updateAvatarErr) {
                    toast("Ошибка сохранения аватара", "error");
                    return;
                }
            }

            const { error: updateDisplayErr } = await supabase
                .from('users_data')
                .update({ display_name: newDisplayName })
                .eq('id', currentUser);

            if (updateDisplayErr) {
                toast("Ошибка сохранения имени: " + updateDisplayErr.message, "error");
                return;
            }

            if (newPassword) {
                const { error: updatePasswordErr } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (updatePasswordErr) {
                    toast("Ошибка смены пароля: " + updatePasswordErr.message, "error");
                    return;
                }

                toast("Пароль успешно изменен!", "success");
            }

            localStorage.setItem('my_user_name', newDisplayName);
            await loadProfileStatsAndAvatar();
            toast("Профиль обновлён");
            editProfileModal.style.display = 'none';

            window.newAvatarFile = null;
            editProfileAvatarInput.value = '';

        } catch (err) {
            toast("Ошибка: " + err.message, "error");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
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
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.style.justifyContent = 'center';
            placeholder.style.alignItems = 'center';
            placeholder.style.margin = '0 auto';
        }
        window.newTrackCover = null;

        const coverSquare = document.getElementById('track-cover-square');
        if (coverSquare) {
            coverSquare.classList.remove('has-image');
            coverSquare.style.justifyContent = 'center';
            coverSquare.style.alignItems = 'center';
        }
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
        playlistFormContainer.style.opacity = '1';
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

        savePlaylistButton.disabled = true;
        const originalButtonText = savePlaylistButton.textContent;
        savePlaylistButton.textContent = "Создание...";

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
                cover_url: coverUrl,
                created_at: new Date().toISOString()
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
            toast("Ошибка создания: " + err.message, "error");
        } finally {
            savePlaylistButton.disabled = false;
            savePlaylistButton.textContent = originalButtonText;
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
    function closeModalWithDelay(modal, callback) {
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '';
            if (callback) callback();
        }, 200);
    }

    let isDraggingFromInput = false;

    playlistFormContainer?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.upload-box, input')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    playlistFormContainer?.addEventListener('mouseup', (e) => {
        if (ignoreModalCloseForPlaylist || ignoreModalClose) {
            ignoreModalCloseForPlaylist = false;
            ignoreModalClose = false;
            isDraggingFromInput = false;
            return;
        }
        if (!isDraggingFromInput && e.target === playlistFormContainer) {
            closeModalWithDelay(playlistFormContainer, () => {
                playlistNameInput.value = '';
                window.newPlaylistCover = null;
                const coverInput = document.getElementById('playlist-cover-input');
                if (coverInput) coverInput.value = '';
                const previewImg = document.getElementById('playlist-cover-preview');
                const placeholder = document.getElementById('playlist-cover-placeholder');
                if (previewImg) previewImg.style.display = 'none';
                if (placeholder) placeholder.style.display = 'flex';
                window.newPlaylistCover = null;
            });
        }
        isDraggingFromInput = false;
    });

    let ignoreCloseAfterFileSelect = false;
    let justOpenedFileDialog = false;

    // Перехват клика по всем элементам, которые открывают файловый диалог
    const fileTriggers = document.querySelectorAll('#track-cover-square, #audio-dropzone, #track-cover-input, #track-file');
    fileTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            justOpenedFileDialog = true;
            setTimeout(() => {
                justOpenedFileDialog = false;
            }, 1000);
        });
    });

    const fileInputs = document.querySelectorAll('#track-cover-input, #track-file');
    fileInputs.forEach(input => {
        input.addEventListener('change', () => {
            justOpenedFileDialog = true;
            setTimeout(() => {
                justOpenedFileDialog = false;
            }, 500);
        });
    });

    uploadFormContainer?.addEventListener('mousedown', (e) => {
        if (e.target.type === 'file') {
            ignoreCloseAfterFileSelect = true;
            setTimeout(() => { ignoreCloseAfterFileSelect = false; }, 500);
        }

        if (e.target.closest('.upload-box, input, textarea, .dropzone, .cover-square')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    uploadFormContainer?.addEventListener('mouseup', (e) => {
        const isFileRelated = e.target.closest('#track-cover-input, #track-file, #track-cover-square, #audio-dropzone');
        if (isFileRelated) {
            return;
        }

        if (ignoreCloseAfterFileSelect) {
            ignoreCloseAfterFileSelect = false;
            isDraggingFromInput = false;
            return;
        }
        if (!isDraggingFromInput && e.target === uploadFormContainer) {
            closeModalWithDelay(uploadFormContainer, resetUploadModal);
        }
        isDraggingFromInput = false;
    });

    const editTrackModal = document.getElementById('edit-track-modal');
    editTrackModal?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.upload-box, input')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    editTrackModal?.addEventListener('mouseup', (e) => {
        if (ignoreModalCloseForEditTrack || ignoreModalClose) {
            ignoreModalCloseForEditTrack = false;
            ignoreModalClose = false;
            isDraggingFromInput = false;
            return;
        }
        if (!isDraggingFromInput && e.target === editTrackModal) {
            closeModalWithDelay(editTrackModal);
        }
        isDraggingFromInput = false;
    });

    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    addToPlaylistModal?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.upload-box')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    addToPlaylistModal?.addEventListener('mouseup', (e) => {
        if (!isDraggingFromInput && e.target === addToPlaylistModal) {
            closeModalWithDelay(addToPlaylistModal, () => {
                document.getElementById('playlist-check-list').innerHTML = '';
                currentAddTrackId = null;
            });
        }
        isDraggingFromInput = false;
    });

    editProfileModal?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.upload-box, input')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    editProfileModal?.addEventListener('mouseup', (e) => {
        if (ignoreModalCloseForProfile || ignoreModalClose) {
            ignoreModalCloseForProfile = false;
            ignoreModalClose = false;
            isDraggingFromInput = false;
            return;
        }
        if (!isDraggingFromInput && e.target === editProfileModal) {
            closeModalWithDelay(editProfileModal);
        }
        isDraggingFromInput = false;
    });

    const editPlaylistModal = document.getElementById('edit-playlist-modal');
    editPlaylistModal?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.upload-box, input')) {
            isDraggingFromInput = true;
        } else {
            isDraggingFromInput = false;
        }
    });

    editPlaylistModal?.addEventListener('mouseup', (e) => {
        if (ignoreModalCloseForEditPlaylist || ignoreModalClose) {
            ignoreModalCloseForEditPlaylist = false;
            ignoreModalClose = false;
            isDraggingFromInput = false;
            return;
        }
        if (!isDraggingFromInput && e.target === editPlaylistModal) {
            closeModalWithDelay(editPlaylistModal, () => {
                const coverInput = document.getElementById('edit-playlist-cover-input');
                if (coverInput) coverInput.value = '';
                const previewImg = document.getElementById('edit-playlist-cover-preview');
                const placeholder = document.getElementById('edit-playlist-cover-placeholder');
                if (previewImg) previewImg.style.display = 'none';
                if (placeholder) placeholder.style.display = 'flex';
                window.newEditPlaylistCover = null;
                document.getElementById('edit-playlist-name').value = '';
            });
        }
        isDraggingFromInput = false;
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

        const previewTracks = document.getElementById('preview-tracks');
        const previewLiked = document.getElementById('preview-liked');
        const totalMinutesSpan = document.getElementById('total-minutes');

        if (!allUserTracks.length && currentUser) {
            if (previewTracks) previewTracks.textContent = '0';
            return;
        }

        // Случайная фраза
        const textPhrases = [
            'Твоя музыкальная вселенная ждёт',
            'Настроение создаётся здесь',
            'Что послушаем сегодня?',
            'Музыка начинается здесь',
            'Твой плейлист — твои правила',
            'Время для любимых треков',
            'Звучит как план',
            'Западные сервисы недоступны — а мы здесь',
            'Импортозамещение в действии',
            'Музыка без границ и блокировок',
            'Пока они блокируют, мы добавляем треки',
            'Твой музыкальный уголок в интернете',
            'Здесь живёт твоя музыка',
            'Музыка, которая всегда с тобой',
            'Министерство правды не одобряет, но мы слушаем',
            'Книги жгут, а мы сохраняем музыку',
            'Здесь нет цензуры, только музыка',
            'Переноси весь свой плейлист к нам',
            'У нас можно слушать и приличные треки',
            'Закастоми свой плейлист',
            'Подкидываем идеи для плейлистов: «поплакать», «для спорта», «можно слушать с родителями»',
            'Диджеи, можно хранить ваши треки у нас!',
            'Никогда не поздно создать плейлист «поплакать»',
            'Мы — сервер, где играют твои треки'
        ];

        const htmlPhrase = [
            'На трек Дрейка можно поставить <span class="crossed">фото Ивана Золо</span> своё селфи. Попробуй!',
            'Опа, у меня тоже есть птички',
            'Привет от dazziessshine! Код писал ночью, не ругайтесь',
            'Рэп придумал мой кент',
            'Я на седьмом этаже, это как шестой, но на один повыше',
            'Встреть третью мировую с любимыми треками'
        ];

        const useHtmlPhrase = Math.random() < 0.1;
        const welcomeTextElement = document.querySelector('.welcome-text');
        if (welcomeTextElement) {
            if (useHtmlPhrase) {
                const randomHtmlPhrase = htmlPhrase[Math.floor(Math.random() * htmlPhrase.length)];
                welcomeTextElement.innerHTML = randomHtmlPhrase;
            } else {
                const randomPhrase = textPhrases[Math.floor(Math.random() * textPhrases.length)];
                welcomeTextElement.textContent = randomPhrase;
            }
        }

        if (previewTracks && currentUser) {
            const tracksCount = allUserTracks.length;
            const likedCount = allUserTracks.filter(t => t.is_liked).length;

            previewTracks.textContent = `${tracksCount} ${declension(tracksCount, ['трек', 'трека', 'треков'])}`;
            previewLiked.textContent = `${likedCount} ${declension(likedCount, ['лайк', 'лайка', 'лайков'])}`;

            let totalSeconds = 0;
            const durations = JSON.parse(localStorage.getItem('track_durations') || '{}');
            allUserTracks.forEach(track => {
                const duration = track.duration || durations[track.id] || 0;
                totalSeconds += duration;
            });

            const totalMinutes = Math.floor(totalSeconds / 60);
            if (totalMinutesSpan) totalMinutesSpan.textContent = `${totalMinutes || 0} ${declension(totalMinutes || 0, ['минута', 'минуты', 'минут'])}`;
        } else if (previewTracks) {
            previewTracks.textContent = '0';
            if (previewLiked) previewLiked.textContent = '0';
            if (totalMinutesSpan) totalMinutesSpan.textContent = '0';
        }
    }

    // Рекомендации
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

        if (!allUserTracks.length) {
            recommendGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-heart"></i>
                    <p>Загрузите треки, чтобы получать рекомендации</p>
                </div>
            `;
            return;
        }

        function extractArtists(artistStr) {
            if (!artistStr || artistStr === 'Неизвестен') return [];

            let normalized = artistStr
                .replace(/\s*\(feat\.\s*([^)]+)\)/gi, ', $1')
                .replace(/\s*feat\.\s+/gi, ', ')
                .replace(/\s*ft\.\s+/gi, ', ')
                .replace(/\s*featuring\s+/gi, ', ')
                .replace(/\s*&\s*/g, ', ');

            const artists = normalized.split(',').map(a => a.trim()).filter(a => a.length > 0);
            return [...new Set(artists)];
        }

        const likedTracks = allUserTracks.filter(t => t.is_liked);
        const likedArtistsSet = new Set();

        likedTracks.forEach(track => {
            const artists = track.artists && track.artists.length ? track.artists : extractArtists(track.artist_display || track.artist);
            artists.forEach(artist => likedArtistsSet.add(artist.toLowerCase()));
        });

        let recommended = [];

        if (likedArtistsSet.size > 0) {
            recommended = allUserTracks.filter(track => {
                if (track.is_liked) return false;
                if (track.id === currentTrackId) return false;

                const trackArtists = track.artists && track.artists.length ? track.artists : extractArtists(track.artist_display || track.artist);
                const trackArtistsLower = trackArtists.map(a => a.toLowerCase());

                return trackArtistsLower.some(artist => likedArtistsSet.has(artist));
            });
        }

        if (recommended.length < 8) {
            const remaining = allUserTracks.filter(t =>
                !recommended.includes(t) &&
                t.id !== currentTrackId &&
                !t.is_liked
            );

            const shuffled = [...remaining];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            const needed = 8 - recommended.length;
            recommended.push(...shuffled.slice(0, needed));
        }

        if (recommended.length === 0) {
            const notLiked = allUserTracks.filter(t => !t.is_liked && t.id !== currentTrackId);
            for (let i = notLiked.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [notLiked[i], notLiked[j]] = [notLiked[j], notLiked[i]];
            }
            recommended = notLiked.slice(0, 8);
        }

        recommended = recommended.slice(0, 8);

        renderRecommendations(recommended);
    }

    function renderRecommendations(tracks) {
        const recommendGrid = document.getElementById('recommend-grid');
        if (!recommendGrid) return;

        if (!tracks.length) {
            recommendGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-star"></i>
                    <p>Рекомендаций пока нет</p>
                </div>
            `;
            return;
        }

        recommendGrid.innerHTML = '';
        tracks.forEach(track => {
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

    /* ФУНКЦИИ РАСШИРЕННОГО ПЛЕЕРА */
    // Функция обновления данных в расширенном плеере
    function updateExpandedPlayer() {
        if (!currentPlaylist[currentTrackIndex]) return;
        const track = currentPlaylist[currentTrackIndex];
        expandedTrackName.textContent = track.title || 'Название трека';

        let artistName = 'Неизвестен';
        if (track.artist) {
            artistName = track.artist;
        } else if (track.artist_display) {
            artistName = track.artist_display;
        } else if (track.artists && track.artists.length > 0) {
            artistName = track.artists.join(', ');
        }
        expandedTrackArtist.textContent = artistName;

        if (track.cover_url) {
            expandedCover.src = track.cover_url;
        } else {
            expandedCover.src = '';
        }

        if (expandedLikeBtn) {
            const likeIcon = expandedLikeBtn.querySelector('i');
            if (track.is_liked) {
                likeIcon.classList.replace('fa-regular', 'fa-solid');
            } else {
                likeIcon.classList.replace('fa-solid', 'fa-regular');
            }
        }
    }

    // Кнопка открытия расширенного плеера
    const expandPlayerButton = document.querySelector('.expand-player-button');
    if (expandPlayerButton) {
        const newBtn = expandPlayerButton.cloneNode(true);
        expandPlayerButton.parentNode.replaceChild(newBtn, expandPlayerButton);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (currentPlaylist.length > 0 && currentTrackIndex !== -1) {
                openExpandedPlayer();
            } else {
                toast("Нет активного трека", "info");
            }
        });
    }

    // Контекстное меню (три точки)
    if (expandedCoverMenu && expandedContextMenu) {
        const newMenuBtn = expandedCoverMenu.cloneNode(true);
        expandedCoverMenu.parentNode.replaceChild(newMenuBtn, expandedCoverMenu);

        newMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            expandedContextMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (expandedContextMenu && !expandedContextMenu.contains(e.target) && !newMenuBtn.contains(e.target)) {
                expandedContextMenu.classList.remove('active');
            }
        });
    }

    // Прогресс-бар
    function syncExpandedProgress() {
        if (isCrossfading) return;
        if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;

        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const fill = document.querySelector('.expanded-progress .progress-fill');
        const handle = document.querySelector('.expanded-progress .progress-handle');
        const current = document.querySelector('.expanded-current-time');
        const total = document.querySelector('.expanded-total-time');

        if (fill) fill.style.width = `${percent}%`;
        if (handle) handle.style.left = `${percent}%`;
        if (current) current.textContent = formatTime(audioPlayer.currentTime);
        if (total) total.textContent = formatTime(audioPlayer.duration);
    }

    function initExpandedProgressSlider() {
        const bar = document.querySelector('.expanded-progress .progress-bar');
        const fill = document.querySelector('.expanded-progress .progress-fill');
        const handle = document.querySelector('.expanded-progress .progress-handle');
        if (!bar) return;

        let dragging = false;
        const onMove = (e) => {
            if (!dragging) return;
            const rect = bar.getBoundingClientRect();
            let p = ((e.clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            fill.style.width = p + '%';
            handle.style.left = p + '%';
            let targetAudio = isCrossfading ? nextAudio : audioPlayer;
            if (isFinite(targetAudio.duration) && targetAudio.duration > 0) {
                const newTime = (p / 100) * targetAudio.duration;
                if (isFinite(newTime)) targetAudio.currentTime = newTime;
            }
        };
        const onUp = () => {
            dragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        bar.addEventListener('mousedown', (e) => {
            dragging = true;
            const rect = bar.getBoundingClientRect();
            let p = ((e.clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            fill.style.width = p + '%';
            handle.style.left = p + '%';
            let targetAudio = isCrossfading ? nextAudio : audioPlayer;
            if (isFinite(targetAudio.duration) && targetAudio.duration > 0) {
                const newTime = (p / 100) * targetAudio.duration;
                if (isFinite(newTime)) targetAudio.currentTime = newTime;
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    initExpandedProgressSlider();

    // Синхронизация расширенного плеера через события
    if (audioPlayer) {
        audioPlayer.addEventListener('loadedmetadata', () => {
            syncExpandedProgress();
            const total = document.querySelector('.expanded-total-time');
            if (total) total.textContent = formatTime(audioPlayer.duration);
        });
    }

    // Открытие расширенного плеера
    function openExpandedPlayer() {
        updateExpandedPlayer();
        if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);

        syncExpandedProgress();

        if (expandedModal) expandedModal.classList.add('active');

        // Синхронизируем состояние кнопки текста при открытии
        const lyricsBtn = document.getElementById('expanded-cover-lyrics');
        const mainLyricsBtn = document.getElementById('lyrics-toggle-button');

        if (isLyricsOpen) {
            if (lyricsBtn) lyricsBtn.classList.add('active');
            if (mainLyricsBtn) mainLyricsBtn.classList.add('active');
        } else {
            if (lyricsBtn) lyricsBtn.classList.remove('active');
            if (mainLyricsBtn) mainLyricsBtn.classList.remove('active');
        }

        const twoColumns = document.querySelector('.expanded-two-columns');
        const expandedQueueContainer_local = document.getElementById('expanded-queue-container');
        const expandedCoverQueue_local = document.getElementById('expanded-cover-queue');
        const expandedContextMenu_local = document.getElementById('expanded-context-menu');

        if (expandedQueueContainer_local) {
            expandedQueueContainer_local.style.display = 'flex';
            expandedQueueContainer_local.classList.remove('active');
        }
        if (twoColumns) twoColumns.classList.remove('queue-open');
        if (expandedCoverQueue_local) expandedCoverQueue_local.classList.remove('active');
        if (expandedContextMenu_local) expandedContextMenu_local.classList.remove('active');

        const previousContainer = document.getElementById('queue-previous-list');
        const currentContainer = document.getElementById('queue-current-container');
        const upcomingContainer = document.getElementById('queue-upcoming-list');

        if (!previousContainer || !currentContainer || !upcomingContainer) {
        }

        window.shouldCenterQueue = true;
        renderExpandedQueue();

        setTimeout(() => {
            const currentTrackElement = document.querySelector('#queue-current-container .expanded-queue-item');
            if (currentTrackElement) {
                currentTrackElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 200);

        if (expandedPlayPauseIcon) {
            if (audioPlayer.paused || !audioPlayer.src) {
                expandedPlayPauseIcon.classList.remove('fa-pause');
                expandedPlayPauseIcon.classList.add('fa-play');
            } else {
                expandedPlayPauseIcon.classList.remove('fa-play');
                expandedPlayPauseIcon.classList.add('fa-pause');
            }
        }

        // ФОРСИРОВАННОЕ ОТОБРАЖЕНИЕ ДЛЯ ПЛАНШЕТОВ
        if (window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches) {
            setTimeout(() => {
                const lyricsContainer = document.querySelector('.lyrics-container');
                if (lyricsContainer && isLyricsOpen) {
                    lyricsContainer.style.visibility = 'visible';
                    lyricsContainer.style.opacity = '1';
                    lyricsContainer.style.display = 'flex';
                    const lyricsPcBtn = document.getElementById('expanded-cover-lyrics');
                    const lyricsMobileBtn = document.getElementById('mobile-lyrics-toggle');
                    if (lyricsPcBtn) lyricsPcBtn.classList.add('active');
                    if (lyricsMobileBtn) lyricsMobileBtn.classList.add('active');
                    const queuePcBtn = document.getElementById('expanded-cover-queue');
                    const queueMobileBtn = document.getElementById('mobile-queue-toggle');
                    if (queuePcBtn) queuePcBtn.classList.remove('active');
                    if (queueMobileBtn) queueMobileBtn.classList.remove('active');
                } else if (lyricsContainer && !isLyricsOpen) {
                    lyricsContainer.style.display = 'none';
                }
                const lyricsScroll = document.querySelector('.lyrics-scroll-area');
                if (lyricsScroll) {
                    lyricsScroll.style.maskImage = 'none';
                    lyricsScroll.style.webkitMaskImage = 'none';
                }
            }, 100);
        }
    }

    function closeExpandedPlayer() {
        expandedModal.classList.remove('active');
        if (expandedContextMenu) expandedContextMenu.classList.remove('active');

        const lyricsBtn = document.getElementById('expanded-cover-lyrics');
        const mainLyricsBtn = document.getElementById('lyrics-toggle-button');
        if (lyricsBtn) lyricsBtn.classList.remove('active');
        if (mainLyricsBtn) mainLyricsBtn.classList.remove('active');

        isLyricsOpen = false;
        isLyricsLoading = false;

        if (lyricsSyncInterval) {
            clearInterval(lyricsSyncInterval);
            lyricsSyncInterval = null;
        }
    }

    document.getElementById('expanded-minimize')?.addEventListener('click', closeExpandedPlayer);

    // Открыть/закрыть очередь в расширенном плеере
    function toggleExpandedQueue() {
        const twoColumns = document.querySelector('.expanded-two-columns');
        const queueBtn = document.getElementById('expanded-cover-queue');
        const rightBlock = document.querySelector('.expanded-right-block');
        const queueContainer = rightBlock?.querySelector('.expanded-queue-container');
        const lyricsContainer = rightBlock?.querySelector('.lyrics-container');

        // Если текст открыт или загружается - переключение на очередь
        if (isLyricsOpen || isLyricsLoading) {
            if (lyricsContainer) lyricsContainer.style.display = 'none';
            if (queueContainer) queueContainer.style.display = 'flex';

            isLyricsOpen = false;
            isLyricsLoading = false;

            const lyricsBtn = document.getElementById('expanded-cover-lyrics');
            if (lyricsBtn) lyricsBtn.classList.remove('active');
            const mainLyricsBtn = document.getElementById('lyrics-toggle-button');
            if (mainLyricsBtn) mainLyricsBtn.classList.remove('active');

            if (queueBtn) queueBtn.classList.add('active');

            if (twoColumns && !twoColumns.classList.contains('queue-open')) {
                twoColumns.classList.add('queue-open');
            }

            renderExpandedQueue();
            return;
        }

        if (!twoColumns) return;

        if (twoColumns.classList.contains('queue-open')) {
            twoColumns.classList.remove('queue-open');
            if (queueBtn) queueBtn.classList.remove('active');
        } else {
            twoColumns.classList.add('queue-open');
            if (queueBtn) queueBtn.classList.add('active');
            if (queueContainer) {
                queueContainer.style.display = 'flex';
            }
            renderExpandedQueue();
        }
    }

    // Кнопки управления расширенным плеером
    if (expandedPlayPauseBtn) {
        expandedPlayPauseBtn.addEventListener('click', () => {
            if (!audioPlayer.src) return;
            syncBothAudios(audioPlayer.paused);
        });
    }

    if (expandedModal && expandedModal.classList.contains('active')) {
        updateExpandedPlayer();
        syncExpandedProgress();
        renderExpandedQueue();
    }

    let isLoadingTrack = false;

    function syncPlayPauseIcon() {
        if (isLoadingTrack) return;

        const playPauseIcon = document.querySelector('.player .play-pause-button i');
        const expandedPlayPauseIcon = document.querySelector('.expanded-play-pause i');

        if (audioPlayer.paused || !audioPlayer.src) {
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
            if (expandedPlayPauseIcon) {
                expandedPlayPauseIcon.classList.remove('fa-pause');
                expandedPlayPauseIcon.classList.add('fa-play');
            }
        } else {
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            }
            if (expandedPlayPauseIcon) {
                expandedPlayPauseIcon.classList.remove('fa-play');
                expandedPlayPauseIcon.classList.add('fa-pause');
            }
        }
    }

    // Кнопка "Следующий трек" в основном плеере
    document.querySelector('.player .next-button').onclick = () => {
        if (currentPlaylist.length) {
            const nextIdx = getNextTrackIndex();
            if (nextIdx !== -1 && nextIdx !== currentTrackIndex) {
                currentTrackIndex = nextIdx;
                playTrack(currentTrackIndex);
            }
            if (queueOverlay.classList.contains('active')) renderQueue();
            updateExpandedQueue();
            syncPlayPauseIcon();
        }
    };

    // Кнопка "Предыдущий"
    document.querySelector('.player .prev-button').onclick = () => {
        if (!currentPlaylist.length) return;

        const THRESHOLD = 5;

        if (audioPlayer.currentTime > THRESHOLD) {
            audioPlayer.currentTime = 0;
            const percent = 0;
            progressFill.style.width = '0%';
            document.querySelector('.progress-handle').style.left = '0%';
            currentTimeEl.textContent = formatTime(0);
            if (expandedModal && expandedModal.classList.contains('active')) {
                syncExpandedProgress();
            }
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            playTrack(currentTrackIndex);
            if (queueOverlay && queueOverlay.classList.contains('active')) renderQueue();
            if (expandedModal && expandedModal.classList.contains('active')) {
                renderExpandedQueue();
            }
            syncPlayPauseIcon();
        }
    };

    // Кнопка "Следующий" в расширенном
    if (expandedNextBtn) {
        expandedNextBtn.addEventListener('click', () => {
            if (currentPlaylist.length) {
                const nextIdx = getNextTrackIndex();
                if (nextIdx !== -1 && nextIdx !== currentTrackIndex) {
                    currentTrackIndex = nextIdx;
                    playTrack(currentTrackIndex);
                    syncPlayPauseIcon();
                    preloadNextTrack();
                }
            }
        });
    }

    // Кнопка "Предыдущий" в расширенном
    if (expandedPrevBtn) {
        expandedPrevBtn.addEventListener('click', () => {
            if (!currentPlaylist.length) return;
            const THRESHOLD = 5;
            if (audioPlayer.currentTime > THRESHOLD) {
                audioPlayer.currentTime = 0;
                syncExpandedProgress();
                syncPlayPauseIcon();
            } else {
                currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
                playTrack(currentTrackIndex);
                syncPlayPauseIcon();
                preloadNextTrack();
            }
        });
    }

    // Шаффл в расширенном
    if (expandedShuffleBtn) {
        expandedShuffleBtn.addEventListener('click', () => {
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
            expandedShuffleBtn.classList.toggle('active', isShuffle);
        });
        preloadNextTrack();
    }

    // Кнопка повтора в расширенном плеере
    if (expandedRepeatBtn) {
        expandedRepeatBtn.addEventListener('click', () => {
            isRepeat = !isRepeat;
            if (isRepeat) isShuffle = false;
            repeatBtn.classList.toggle('active', isRepeat);
            expandedRepeatBtn.classList.toggle('active', isRepeat);
            if (queueOverlay && queueOverlay.classList.contains('active')) renderQueue();
            if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);
            if (typeof renderExpandedQueue === 'function') renderExpandedQueue();
        });
    }

    // Лайк в расширенном
    if (expandedLikeBtn) {
        expandedLikeBtn.addEventListener('click', async () => {
            if (!currentTrackId) return;
            const track = allUserTracks.find(t => t.id === currentTrackId);
            if (!track) return;
            const newStatus = !track.is_liked;
            track.is_liked = newStatus;
            updateLikeVisuals(newStatus);

            const icon = expandedLikeBtn.querySelector('i');
            if (newStatus) icon.classList.replace('fa-regular', 'fa-solid');
            else icon.classList.replace('fa-solid', 'fa-regular');

            await supabase.from('tracks').update({ is_liked: newStatus }).eq('id', currentTrackId);
            refreshAllData();
        });
    }

    /* ОБНОВЛЕНИЯ */
    if (currentUser) {
        loadAllDataInParallel();
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

    document.body.style.opacity = '1';

    /* МОБИЛЬНАЯ АДАПТАЦИЯ */
    const queueButton = document.getElementById('mobile-queue-toggle');
    if (queueButton) {
        const freshQueueBtn = queueButton.cloneNode(true);
        queueButton.parentNode.replaceChild(freshQueueBtn, queueButton);
        freshQueueBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const rightBlock = document.querySelector('.expanded-right-block');
            const twoColumns = document.querySelector('.expanded-two-columns');
            const isLandscape = window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches;

            let lyricsContainer = null;
            if (rightBlock) {
                lyricsContainer = rightBlock.querySelector('.lyrics-container');
            }

            // Мобилки
            if (!isLandscape) {
                const overlay = document.createElement('div');
                overlay.className = 'mobile-queue-overlay';
                overlay.innerHTML = `
                <div class="queue-header">
                    <h3>Очередь</h3>
                    <button class="mobile-queue-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="queue-list" id="mobile-queue-list"></div>
            `;
                document.body.appendChild(overlay);
                const queueList = overlay.querySelector('#mobile-queue-list');

                function renderMobileQueue() {
                    queueList.innerHTML = '';
                    currentPlaylist.forEach((track, idx) => {
                        const isCurrent = idx === currentTrackIndex;
                        const item = document.createElement('div');
                        item.className = `queue-item ${isCurrent ? 'current' : ''}`;
                        item.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                            <span style="opacity:0.5; width:20px; font-size:12px;">${idx + 1}</span>
                            <div style="flex-grow:1; overflow:hidden;">
                                <div style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(track.title)}</div>
                                <div style="font-size:11px; opacity:0.6;">${escapeHtml(track.artist || track.artist_display || 'Неизвестен')}</div>
                            </div>
                            <button class="mobile-queue-like-btn" data-track-id="${track.id}" data-liked="${track.is_liked}" style="background:none; border:none; cursor:pointer; padding:0 8px;">
                                <i class="fa-${track.is_liked ? 'solid' : 'regular'} fa-heart" style="color: ${track.is_liked ? 'var(--primary)' : 'var(--on-surface-muted)'};"></i>
                            </button>
                        </div>
                    `;
                        item.addEventListener('click', (e) => {
                            if (e.target.closest('.mobile-queue-like-btn')) return;
                            currentTrackIndex = idx;
                            playTrack(idx);
                            overlay.remove();
                        });
                        const likeBtn = item.querySelector('.mobile-queue-like-btn');
                        if (likeBtn) {
                            likeBtn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                const trackId = track.id;
                                const newLikedStatus = !track.is_liked;
                                track.is_liked = newLikedStatus;
                                const trackInAll = allUserTracks.find(t => t.id === trackId);
                                if (trackInAll) trackInAll.is_liked = newLikedStatus;
                                const trackInPlaylist = currentPlaylist.find(t => t.id === trackId);
                                if (trackInPlaylist) trackInPlaylist.is_liked = newLikedStatus;
                                const icon = likeBtn.querySelector('i');
                                if (newLikedStatus) {
                                    icon.classList.remove('fa-regular');
                                    icon.classList.add('fa-solid');
                                    icon.style.color = 'var(--primary)';
                                } else {
                                    icon.classList.remove('fa-solid');
                                    icon.classList.add('fa-regular');
                                    icon.style.color = 'var(--on-surface-muted)';
                                }
                                likeBtn.dataset.liked = newLikedStatus;
                                await supabase.from('tracks').update({ is_liked: newLikedStatus }).eq('id', trackId);
                                if (currentTrackId === trackId) updateLikeVisuals(newLikedStatus);
                                refreshAllData();
                            });
                        }
                        queueList.appendChild(item);
                    });
                }

                renderMobileQueue();
                const observer = new MutationObserver(() => renderMobileQueue());
                observer.observe(queueList, { childList: true, subtree: true });
                overlay.querySelector('.mobile-queue-close').onclick = () => overlay.remove();
                overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
                return;
            }

            // Горизонтальные планшеты
            if (!rightBlock || !twoColumns) return;

            let queueContainer = rightBlock.querySelector('.expanded-queue-container');
            if (!queueContainer) {
                queueContainer = document.createElement('div');
                queueContainer.className = 'expanded-queue-container';
                queueContainer.innerHTML = `<div class="expanded-queue-wrapper"><div id="queue-previous-list"></div><div class="queue-section-header">Сейчас играет</div><div id="queue-current-container"></div><div class="queue-section-header">Далее в очереди</div><div id="queue-upcoming-list"></div></div>`;
                rightBlock.appendChild(queueContainer);
            }

            const lyricsMobileBtn = document.getElementById('mobile-lyrics-toggle');
            const lyricsPcBtn = document.getElementById('expanded-cover-lyrics');
            const queuePcBtn = document.getElementById('expanded-cover-queue');

            // Если текст открыт - закрыть
            if (lyricsContainer && lyricsContainer.style.display === 'flex') {
                lyricsContainer.style.display = 'none';
                if (lyricsSyncInterval) clearInterval(lyricsSyncInterval);
                isLyricsOpen = false;
                isLyricsLoading = false;
                if (lyricsMobileBtn) lyricsMobileBtn.classList.remove('active');
                if (lyricsPcBtn) lyricsPcBtn.classList.remove('active');

                if (twoColumns.classList.contains('queue-open')) {
                    twoColumns.classList.remove('queue-open');
                }

                queueContainer.style.display = 'flex';
                twoColumns.classList.add('queue-open');
                freshQueueBtn.classList.add('active');
                if (queuePcBtn) queuePcBtn.classList.add('active');
                renderExpandedQueue();
                void twoColumns.offsetHeight;
                return;
            }

            // Если текст не открыт - переключить очередь (открыть/закрыть)
            if (twoColumns.classList.contains('queue-open')) {
                twoColumns.classList.remove('queue-open');
                freshQueueBtn.classList.remove('active');
                if (queuePcBtn) queuePcBtn.classList.remove('active');
                queueContainer.style.display = 'none';
            } else {
                queueContainer.style.display = 'flex';
                twoColumns.classList.add('queue-open');
                freshQueueBtn.classList.add('active');
                if (queuePcBtn) queuePcBtn.classList.add('active');
                renderExpandedQueue();
                void twoColumns.offsetHeight;
            }
        });
    }

    // Кнопка текста (горизонтальные планшеты)
    const mobileLyricsBtn = document.getElementById('mobile-lyrics-toggle');
    if (mobileLyricsBtn) {
        const freshTextBtn = mobileLyricsBtn.cloneNode(true);
        mobileLyricsBtn.parentNode.replaceChild(freshTextBtn, mobileLyricsBtn);

        freshTextBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();

            const queuePcBtn = document.getElementById('expanded-cover-queue');
            const lyricsPcBtn = document.getElementById('expanded-cover-lyrics');

            if (!currentPlaylist.length || currentTrackIndex === -1) {
                toast("Нет активного трека", "info");
                return;
            }

            const rightBlock = document.querySelector('.expanded-right-block');
            const twoColumns = document.querySelector('.expanded-two-columns');
            if (!rightBlock || !twoColumns) return;

            let lyricsContainer = rightBlock.querySelector('.lyrics-container');
            if (!lyricsContainer) {
                lyricsContainer = document.createElement('div');
                lyricsContainer.className = 'lyrics-container';
                lyricsContainer.style.display = 'none';
                rightBlock.appendChild(lyricsContainer);
            }
            const queueContainer = rightBlock.querySelector('.expanded-queue-container');

            if (lyricsContainer.style.display === 'flex') {
                lyricsContainer.style.display = 'none';
                twoColumns.classList.remove('queue-open');
                freshTextBtn.classList.remove('active');
                if (queuePcBtn) queuePcBtn.classList.remove('active');
                if (lyricsPcBtn) lyricsPcBtn.classList.remove('active');
                if (queueContainer) queueContainer.style.display = 'flex';
                if (lyricsSyncInterval) clearInterval(lyricsSyncInterval);
                isLyricsOpen = false;
                return;
            }

            if (queueContainer) queueContainer.style.display = 'none';
            twoColumns.classList.add('queue-open');
            lyricsContainer.style.display = 'flex';
            freshTextBtn.classList.add('active');
            isLyricsOpen = true;
            //  Синхронизация кнопок с ПК
            if (queuePcBtn) queuePcBtn.classList.remove('active');
            if (lyricsPcBtn) lyricsPcBtn.classList.add('active');
            if (!lyricsContainer.querySelector('.lyrics-close-button')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'lyrics-close-button';
                closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                closeBtn.style.cssText = `
                    position: fixed; top: 16px; right: 16px;
                    background: var(--surface-high); color: var(--on-surface);
                    width: 44px; height: 44px; border-radius: 50%;
                    font-size: 0; z-index: 10001; cursor: pointer;
                    border: none; display: flex; align-items: center; justify-content: center;
                `;
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeLyrics();
                    const mobile = document.getElementById('mobile-lyrics-toggle');
                    if (mobile) mobile.classList.remove('active');
                    const two = document.querySelector('.expanded-two-columns');
                    if (two) two.classList.remove('queue-open');
                });
                lyricsContainer.appendChild(closeBtn);
            }

            if (!lyricsData || lyricsData.length === 0) {
                [...lyricsContainer.children].forEach(c => {
                    if (!c.classList.contains('lyrics-close-button')) c.remove();
                });
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'lyrics-loading';
                loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
                lyricsContainer.appendChild(loadingDiv);

                const track = currentPlaylist[currentTrackIndex];
                let artist = track.artist || track.artist_display || '';
                if (track.artists?.length) artist = track.artists.join(', ');
                const lyrics = await loadLyrics(artist, track.title);
                if (lyrics && lyrics.length) {
                    lyricsData = lyrics;
                    renderLyricsInContainer(lyricsContainer);
                    startLyricsSync(lyricsContainer);
                } else {
                    [...lyricsContainer.children].forEach(c => {
                        if (!c.classList.contains('lyrics-close-button')) c.remove();
                    });
                    const placeholder = document.createElement('div');
                    placeholder.className = 'lyrics-placeholder';
                    placeholder.innerHTML = '<i class="fas fa-microphone-slash"></i><p>Текст не найден</p>';
                    lyricsContainer.appendChild(placeholder);
                }
            } else {
                renderLyricsInContainer(lyricsContainer);
                startLyricsSync(lyricsContainer);
            }
        });
    }

    // Минимальная синхронизация подсветки кнопок при ресайзе (только для активного состояния)
    window.addEventListener('resize', () => {
        const mobileText = document.getElementById('mobile-lyrics-toggle');
        const mobileQueue = document.getElementById('mobile-queue-toggle');
        const pcText = document.getElementById('expanded-cover-lyrics');
        const pcQueue = document.getElementById('expanded-cover-queue');
        if (mobileText && pcText) {
            if (pcText.classList.contains('active')) mobileText.classList.add('active');
            else mobileText.classList.remove('active');
        }
        if (mobileQueue && pcQueue) {
            if (pcQueue.classList.contains('active')) mobileQueue.classList.add('active');
            else mobileQueue.classList.remove('active');
        }
    });

    // Функции для полноэкранной очереди
    let fullscreenOverlay = null;

    function createFullscreenQueue() {
        if (fullscreenOverlay) {
            fullscreenOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-queue-overlay';
        overlay.id = 'fullscreen-queue-overlay';
        overlay.innerHTML = `
        <div class="fullscreen-queue-header">
            <h3>Очередь</h3>
            <button class="fullscreen-queue-close" id="fullscreen-queue-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="fullscreen-queue-content" id="fullscreen-queue-content">
            <div class="empty-queue-message">Загрузка очереди...</div>
        </div>
    `;
        document.body.appendChild(overlay);

        const closeBtn = document.getElementById('fullscreen-queue-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (overlay && overlay.remove) overlay.remove();
                    fullscreenOverlay = null;
                }, 300);
            });
        }

        fullscreenOverlay = overlay;
        return overlay;
    }

    function openFullscreenQueue() {
        let overlay = document.getElementById('fullscreen-queue-overlay');
        if (!overlay) {
            overlay = createFullscreenQueue();
        }

        const content = document.getElementById('fullscreen-queue-content');
        if (content) {
            renderFullscreenQueue(content);
        }

        setTimeout(() => {
            if (overlay) overlay.classList.add('active');
        }, 10);
    }

    function renderFullscreenQueue(container) {
        if (!currentPlaylist.length || currentTrackIndex === -1) {
            container.innerHTML = '<div class="empty-queue-message">Нет треков</div>';
            return;
        }

        container.innerHTML = '';
        const total = currentPlaylist.length;
        const current = currentTrackIndex;

        // Предыдущие треки
        for (let i = 0; i < current; i++) {
            container.appendChild(createFullscreenQueueItem(currentPlaylist[i], i, false));
        }

        // Текущий трек
        container.appendChild(createFullscreenQueueItem(currentPlaylist[current], current, true));

        // Следующие треки
        for (let i = current + 1; i < total; i++) {
            container.appendChild(createFullscreenQueueItem(currentPlaylist[i], i, false));
        }

        // Сообщение о зацикливании
        if (current === total - 1 && total > 1) {
            const endMessage = document.createElement('div');
            endMessage.className = 'queue-loop-message';
            endMessage.textContent = 'Треки начнутся сначала';
            container.appendChild(endMessage);
        }
    }

    function createFullscreenQueueItem(track, index, isCurrent) {
        const item = document.createElement('div');
        item.className = `expanded-queue-item ${isCurrent ? 'current' : ''}`;

        let artistName = track.artist || track.artist_display || 'Неизвестен';
        const coverUrl = track.cover_url || '';
        const duration = track.duration ? formatTime(track.duration) : '';
        const isLiked = track.is_liked || false;

        item.innerHTML = `
        <div class="expanded-queue-item-cover" style="background-image: url('${coverUrl}');"></div>
        <div class="expanded-queue-item-info">
            <div class="expanded-queue-item-title">${escapeHtml(track.title)}</div>
            <div class="expanded-queue-item-artist">${escapeHtml(artistName)}</div>
        </div>
        <div class="expanded-queue-item-right">
            <button class="expanded-queue-like-btn ${isLiked ? 'liked' : ''}">
                <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <span class="expanded-queue-duration">${duration}</span>
        </div>
    `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.expanded-queue-like-btn')) return;
            currentTrackIndex = index;
            playTrack(currentTrackIndex);
            const overlay = document.getElementById('fullscreen-queue-overlay');
            if (overlay) overlay.classList.remove('active');
        });

        return item;
    }

    // Синхронизация мобильной навигации
    const mobileTabItems = document.querySelectorAll('.mobile-tab-item');
    function syncMobileNav() {
        if (!mobileTabItems.length) return;
        const activeLink = document.querySelector('.nav-menu a.active');
        if (!activeLink) return;
        const activeText = activeLink.textContent.trim().toLowerCase();
        mobileTabItems.forEach(item => {
            const section = item.dataset.section;
            if ((section === 'home' && activeText === 'главная') ||
                (section === 'library' && activeText === 'медиатека') ||
                (section === 'profile' && activeText === 'профиль')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    if (mobileTabItems.length) {
        mobileTabItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                let targetLink = null;
                if (section === 'home') targetLink = Array.from(navLinks).find(link => link.textContent.trim().toLowerCase() === 'главная');
                else if (section === 'library') targetLink = Array.from(navLinks).find(link => link.textContent.trim().toLowerCase() === 'медиатека');
                else if (section === 'profile') targetLink = Array.from(navLinks).find(link => link.textContent.trim().toLowerCase() === 'профиль');
                if (targetLink) targetLink.click();
            });
        });
        // Синхронизация при кликах по основному меню
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(syncMobileNav, 50);
            });
        });
        syncMobileNav();
    }

    // Перемещение кнопки play/pause в track-actions для мобильных
    function adaptMobilePlayer() {
        if (window.innerWidth <= 912) {
            const trackActions = document.querySelector('.track-actions');
            const originalPlayPause = document.querySelector('.player-controls .play-pause-button');
            const existingInActions = trackActions?.querySelector('.play-pause-button');

            if (originalPlayPause && trackActions && !existingInActions) {
                const newPlayPause = document.createElement('button');
                newPlayPause.className = 'control-button play-pause-button';
                const icon = document.createElement('i');
                icon.className = (audioPlayer.paused || !audioPlayer.src) ? 'fas fa-play' : 'fas fa-pause';
                newPlayPause.appendChild(icon);

                newPlayPause.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (audioPlayer.paused) audioPlayer.play();
                    else audioPlayer.pause();
                });

                const likeBtn = trackActions.querySelector('.like-button');
                if (likeBtn && likeBtn.nextSibling) {
                    trackActions.insertBefore(newPlayPause, likeBtn.nextSibling);
                } else {
                    trackActions.appendChild(newPlayPause);
                }
                originalPlayPause.remove();
            }
        } else {
            // Восстановление на десктопе
            const playerControls = document.querySelector('.player-controls .control-buttons');
            const mobilePlayPause = document.querySelector('.track-actions .play-pause-button');
            const originalInControls = document.querySelector('.player-controls .play-pause-button');

            if (mobilePlayPause && playerControls && !originalInControls) {
                const desktopPlayPause = document.createElement('button');
                desktopPlayPause.className = 'control-button play-pause-button';
                const icon = document.createElement('i');
                icon.className = (audioPlayer.paused || !audioPlayer.src) ? 'fas fa-play' : 'fas fa-pause';
                desktopPlayPause.appendChild(icon);

                desktopPlayPause.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (audioPlayer.paused) audioPlayer.play();
                    else audioPlayer.pause();
                });

                const prevBtn = playerControls.querySelector('.prev-button');
                if (prevBtn && prevBtn.nextSibling) {
                    playerControls.insertBefore(desktopPlayPause, prevBtn.nextSibling);
                } else {
                    playerControls.appendChild(desktopPlayPause);
                }
                mobilePlayPause.remove();
            }
        }
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        adaptMobilePlayer();
    });
    adaptMobilePlayer();

    // Открытие расширенного плеера по клику на основную область плеера
    function initMobilePlayerClick() {
        const player = document.querySelector('.player');
        if (!player) return;

        if (player._clickHandler) {
            player.removeEventListener('click', player._clickHandler);
        }

        function isClickOnButton(target) {
            const buttonsSelectors = [
                '.play-pause-button', '.like-button', '.player-menu-trigger',
                '.shuffle-button', '.prev-button', '.next-button', '.repeat-button',
                '.queue-button', '.volume-button', '.expand-player-button'
            ];
            let el = target;
            while (el && el !== player) {
                for (let selector of buttonsSelectors) {
                    if (el.matches && el.matches(selector)) return true;
                }
                el = el.parentElement;
            }
            return false;
        }

        const handler = (e) => {
            // Исключаение для горизонтальных планшетов
            const isLandscapeTablet = window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches;
            if (window.innerWidth > 1024 || isLandscapeTablet) return;
            if (isClickOnButton(e.target)) return;
            if (currentPlaylist.length > 0 && currentTrackIndex !== -1) {
                player.classList.add('player-click-animation');
                setTimeout(() => player.classList.remove('player-click-animation'), 150);
                openExpandedPlayer();
            }
        };

        player._clickHandler = handler;
        player.addEventListener('click', handler);
    }

    initMobilePlayerClick();
    window.addEventListener('resize', () => {

    });

    // Рендер очереди в расширенном плеере
    function renderExpandedQueue() {

        const previousContainer = document.getElementById('queue-previous-list');
        const currentContainer = document.getElementById('queue-current-container');
        const upcomingContainer = document.getElementById('queue-upcoming-list');

        if (!previousContainer || !currentContainer || !upcomingContainer) {
            return;
        }

        if (!currentPlaylist.length || currentTrackIndex === -1) {
            previousContainer.innerHTML = '';
            currentContainer.innerHTML = '<div class="empty-queue-message">Нет треков</div>';
            upcomingContainer.innerHTML = '<div class="empty-queue-message">Нет треков в очереди</div>';
            return;
        }

        const total = currentPlaylist.length;
        const current = currentTrackIndex;

        previousContainer.innerHTML = '';
        upcomingContainer.innerHTML = '';

        const existingCurrentItem = currentContainer.querySelector('.expanded-queue-item');
        if (existingCurrentItem && currentPlaylist[current]) {
            const newTrack = currentPlaylist[current];
            const coverEl = existingCurrentItem.querySelector('.expanded-queue-item-cover');
            const titleEl = existingCurrentItem.querySelector('.expanded-queue-item-title');
            const artistEl = existingCurrentItem.querySelector('.expanded-queue-item-artist');
            const likeBtn = existingCurrentItem.querySelector('.expanded-queue-like-btn');
            const durationSpan = existingCurrentItem.querySelector('.expanded-queue-duration');

            if (titleEl) titleEl.textContent = newTrack.title || 'Без названия';
            if (artistEl) {
                let artistName = newTrack.artist || newTrack.artist_display || 'Неизвестен';
                if (newTrack.artists?.length) artistName = newTrack.artists.join(', ');
                artistEl.textContent = artistName;
            }
            if (coverEl) {
                coverEl.style.backgroundImage = newTrack.cover_url ? `url('${newTrack.cover_url}')` : 'none';
            }
            if (durationSpan) {
                durationSpan.textContent = newTrack.duration ? formatTime(newTrack.duration) : '';
            }
            if (likeBtn) {
                const isLiked = newTrack.is_liked || false;
                const icon = likeBtn.querySelector('i');
                if (isLiked) {
                    likeBtn.classList.add('liked');
                    if (icon) icon.classList.replace('fa-regular', 'fa-solid');
                } else {
                    likeBtn.classList.remove('liked');
                    if (icon) icon.classList.replace('fa-solid', 'fa-regular');
                }
                likeBtn.dataset.trackId = newTrack.id;
            }
        } else if (currentPlaylist[current]) {
            currentContainer.innerHTML = '';
            currentContainer.appendChild(createExpandedQueueItem(currentPlaylist[current], current, true));
        }

        // Предыдущие треки
        for (let i = 0; i < current; i++) {
            previousContainer.appendChild(createExpandedQueueItem(currentPlaylist[i], i, false));
        }

        // Следующие треки
        for (let i = current + 1; i < total; i++) {
            upcomingContainer.appendChild(createExpandedQueueItem(currentPlaylist[i], i, false));
        }

        // Если это последний трек
        if (current === total - 1 && total > 1) {
            const endMessage = document.createElement('div');
            endMessage.className = 'queue-loop-message';
            endMessage.textContent = 'Треки начнутся сначала';
            upcomingContainer.appendChild(endMessage);
        }

        // Если всего 1 трек
        if (total === 1) {
            const endMessage = document.createElement('div');
            endMessage.className = 'queue-loop-message';
            endMessage.textContent = 'Это единственный трек';
            upcomingContainer.appendChild(endMessage);
        }
    }

    // Создание элемента очереди
    function createExpandedQueueItem(track, index, isCurrent, isLooped = false) {
        const item = document.createElement('div');
        item.className = `expanded-queue-item ${isCurrent ? 'current' : ''}`;
        item.dataset.index = index;
        item.dataset.trackId = track.id;

        let artistName = 'Неизвестен';
        if (track.artist) artistName = track.artist;
        else if (track.artist_display) artistName = track.artist_display;
        else if (track.artists && track.artists.length) artistName = track.artists.join(', ');

        const coverUrl = track.cover_url || '';
        const duration = track.duration ? formatTime(track.duration) : '';
        const isLiked = track.is_liked || false;

        // Единый шаблон для всех треков
        item.innerHTML = `
        <div class="expanded-queue-item-cover" style="background-image: url('${coverUrl}'); background-size: cover; background-position: center;"></div>
        <div class="expanded-queue-item-info">
            <div class="expanded-queue-item-title">${escapeHtml(track.title || 'Без названия')}</div>
            <div class="expanded-queue-item-artist">${escapeHtml(artistName)}</div>
        </div>
        <div class="expanded-queue-item-right">
            <button class="expanded-queue-like-btn ${isLiked ? 'liked' : ''}" data-track-id="${track.id}">
                <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <span class="expanded-queue-duration">${duration}</span>
        </div>
    `;

        // Клик по лайку
        const likeBtn = item.querySelector('.expanded-queue-like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const trackId = track.id;
                const newLikedStatus = !track.is_liked;

                track.is_liked = newLikedStatus;

                const foundTrack = allUserTracks.find(t => t.id === trackId);
                if (foundTrack) foundTrack.is_liked = newLikedStatus;

                const foundInPlaylist = currentPlaylist.find(t => t.id === trackId);
                if (foundInPlaylist) foundInPlaylist.is_liked = newLikedStatus;

                const icon = likeBtn.querySelector('i');
                if (newLikedStatus) {
                    likeBtn.classList.add('liked');
                    icon.classList.replace('fa-regular', 'fa-solid');
                } else {
                    likeBtn.classList.remove('liked');
                    icon.classList.replace('fa-solid', 'fa-regular');
                }

                await supabase.from('tracks').update({ is_liked: newLikedStatus }).eq('id', trackId);

                if (currentTrackId === trackId) {
                    updateLikeVisuals(newLikedStatus);
                }

                refreshAllData();
            });
        }

        // Клик по самому треку
        item.addEventListener('click', (e) => {
            if (e.target.closest('.expanded-queue-like-btn')) return;
            e.stopPropagation();
            if (index === currentTrackIndex) return;

            currentTrackIndex = index;
            playTrack(currentTrackIndex);

            const playPauseIcon = document.querySelector('.play-pause-button i');
            const expandedPlayPauseIcon = document.querySelector('.expanded-play-pause i');
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            }
            if (expandedPlayPauseIcon) {
                expandedPlayPauseIcon.classList.remove('fa-play');
                expandedPlayPauseIcon.classList.add('fa-pause');
            }

            if (queueOverlay && queueOverlay.classList.contains('active')) renderQueue();
            if (expandedModal && expandedModal.classList.contains('active')) renderExpandedQueue();
        });

        return item;
    }

    // Обновление очереди
    function updateExpandedQueue() {
        if (expandedModal && expandedModal.classList.contains('active')) {
            renderExpandedQueue();
        }
    }

    /* ТЕКСТЫ ПЕСЕН */
    let lyricsData = null;
    let lyricsSyncInterval = null;
    let lyricsCurrentLine = -1;
    let lyricsContainerDiv = null;
    let isLyricsOpen = false;
    let isLyricsLoading = false;
    let currentLyricsRequest = null;
    let lyricsScrollTimer = null;
    let userScrolledLyrics = false;

    function scrollToActiveLine(container) {
        const activeLine = container.querySelector('.lyrics-line.active');
        if (!activeLine || !userScrolledLyrics) return;

        const scrollArea = container.querySelector('.lyrics-scroll-area');
        if (!scrollArea) return;

        // Прокручивание к активной строке с небольшим отступом сверху
        const offsetTop = activeLine.offsetTop - scrollArea.offsetTop - 200;
        scrollArea.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    function onUserScroll(container) {
        userScrolledLyrics = true;
        if (lyricsScrollTimer) {
            clearTimeout(lyricsScrollTimer);
        }
        lyricsScrollTimer = setTimeout(() => {
            userScrolledLyrics = false;
            scrollToActiveLine(container);
        }, 1000);
    }

    function resetLyricsScroll() {
        if (lyricsScrollTimer) {
            clearTimeout(lyricsScrollTimer);
            lyricsScrollTimer = null;
        }
        userScrolledLyrics = false;
    }

    // Парсинг LRC
    function parseLyricsText(lrc) {
        if (!lrc) return [];
        const lines = lrc.split('\n');
        const result = [];
        const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
        for (const line of lines) {
            const match = line.match(regex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const millis = parseInt(match[3].padEnd(3, '0'));
                const time = minutes * 60 + seconds + millis / 1000;
                const text = match[4].trim();
                if (text) result.push({ time, text });
            }
        }
        return result;
    }

    // Загрузка из LRCLIB
    async function loadLyrics(artist, title, album = '', durationSec = 0) {
        // Проверка кеша
        const requestId = currentTrackId;
        const cached = loadCachedLyrics(artist, title);
        if (cached) return cached;

        // Прямой запрос со всеми параметрами (album, duration)
        const directUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}&album_name=${encodeURIComponent(album)}&duration=${Math.floor(durationSec)}`;
        try {
            const response = await fetch(directUrl, { headers: { 'User-Agent': 'ResonanceMusic/1.0' } });
            if (response.ok) {
                const data = await response.json();
                if (data.syncedLyrics) {
                    const parsed = parseLyricsText(data.syncedLyrics);
                    if (requestId !== currentTrackId) {
                        return null;
                    }
                    cacheLyrics(artist, title, parsed);
                    return parsed;
                }
            }
        } catch (e) {
        }

        // FALLBACK: поиск через /api/search
        try {
            const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${artist} ${title}`)}`;
            const searchResp = await fetch(searchUrl, { headers: { 'User-Agent': 'ResonanceMusic/1.0' } });
            if (searchResp.ok) {
                const results = await searchResp.json();
                if (requestId !== currentTrackId) {
                    return null;
                }
                const match = results.find(track =>
                    track.syncedLyrics &&
                    track.artistName?.toLowerCase() === artist.toLowerCase() &&
                    track.trackName?.toLowerCase() === title.toLowerCase()
                );
                if (match) {
                    const parsed = parseLyricsText(match.syncedLyrics);
                    cacheLyrics(artist, title, parsed);
                    return parsed;
                }
            }
        } catch (e) {
        }

        // Если ничего не нашли - null
        return null;
    }

    // Функция создания контейнера для текста
    function getOrCreateLyricsContainer() {
        const rightBlock = document.querySelector('.expanded-right-block');
        if (!rightBlock) return null;

        if (!lyricsContainerDiv) {
            lyricsContainerDiv = rightBlock.querySelector('.lyrics-container');
            if (!lyricsContainerDiv) {
                lyricsContainerDiv = document.createElement('div');
                lyricsContainerDiv.className = 'lyrics-container';
                lyricsContainerDiv.style.display = 'none';
                lyricsContainerDiv.style.height = '100%';
                lyricsContainerDiv.style.width = '100%';
                lyricsContainerDiv.style.flexDirection = 'column';
                rightBlock.appendChild(lyricsContainerDiv);
            }
        }
        return lyricsContainerDiv;
    }

    // Функция открытия текста песни
    async function openLyrics() {
        const track = currentPlaylist[currentTrackIndex];
        if (!track) {
            toast("Нет активного трека", "info");
            return;
        }

        const rightBlock = document.querySelector('.expanded-right-block');
        if (!rightBlock) {
            toast("Откройте расширенный плеер", "info");
            return;
        }

        let lyricsContainer = rightBlock.querySelector('.lyrics-container');
        if (!lyricsContainer) {
            lyricsContainer = document.createElement('div');
            lyricsContainer.className = 'lyrics-container';
            lyricsContainer.style.display = 'none';
            rightBlock.appendChild(lyricsContainer);
        }

        const queueContainer = rightBlock.querySelector('.expanded-queue-container');
        if (queueContainer) queueContainer.style.display = 'none';
        lyricsContainer.style.display = 'flex';

        const twoColumns = document.querySelector('.expanded-two-columns');
        if (twoColumns && !twoColumns.classList.contains('queue-open')) {
            twoColumns.classList.add('queue-open');
        }

        let artist = track.artist || track.artist_display || '';
        if (track.artists?.length) artist = track.artists.join(', ');

        // Кнопка закрытия текста
        let closeBtn = lyricsContainer.querySelector('.lyrics-close-button');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'lyrics-close-button';
            closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            closeBtn.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            background: var(--surface-high);
            color: var(--on-surface);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            font-size: 0;
            z-index: 10001;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeLyrics();
                const mobile = document.getElementById('mobile-lyrics-toggle');
                if (mobile) mobile.classList.remove('active');
                const two = document.querySelector('.expanded-two-columns');
                if (two) two.classList.remove('queue-open');
            });
            lyricsContainer.appendChild(closeBtn);
        }

        const children = [...lyricsContainer.children];
        for (const child of children) {
            if (child !== closeBtn) child.remove();
        }

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'lyrics-loading';
        loadingDiv.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
        lyricsContainer.appendChild(loadingDiv);

        lyricsData = await loadLyrics(artist, track.title);

        const spinner = lyricsContainer.querySelector('.lyrics-loading');
        if (spinner) spinner.remove();

        if (lyricsData && lyricsData.length > 0) {
            renderLyricsContent(lyricsContainer);
            startLyricsSync(lyricsContainer);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'lyrics-placeholder';
            placeholder.innerHTML = '<i class="fas fa-microphone-slash"></i><p>Текст не найден</p>';
            lyricsContainer.appendChild(placeholder);
        }
    }

    // Функция рендера текста песни
    function renderLyricsContent(container) {
        const closeBtn = container.querySelector('.lyrics-close-button');
        const children = [...container.children];
        for (const child of children) {
            if (child !== closeBtn) child.remove();
        }

        const attributionLine = {
            time: (lyricsData[lyricsData.length - 1]?.time || 0) + 0.5,
            text: 'Текст предоставлен LRCLIB (lrclib.net)'
        };
        const allLines = [...lyricsData, attributionLine];

        const scrollArea = document.createElement('div');
        scrollArea.className = 'lyrics-scroll-area';
        scrollArea.innerHTML = `
        <div class="lyrics-content">
            ${allLines.map((line, i) => `
                <div class="lyrics-line ${i === allLines.length - 1 ? 'attribution-line' : ''}" data-index="${i}" data-time="${line.time}">
                    ${escapeHtml(line.text)}
                </div>
            `).join('')}
        </div>
    `;

        container.appendChild(scrollArea);
        scrollArea.scrollTo({ top: 0, behavior: 'auto' });

        // Обработчики кликов
        scrollArea.querySelectorAll('.lyrics-line').forEach(line => {
            line.addEventListener('click', (e) => {
                e.stopPropagation();

                let targetAudio = isCrossfading ? nextAudio : audioPlayer;
                const time = parseFloat(line.dataset.time);

                if (!isNaN(time) && targetAudio.duration) {
                    if (isFinite(time) && isFinite(targetAudio.duration) && time <= targetAudio.duration) {
                        targetAudio.currentTime = time;
                    }
                    if (targetAudio.paused) targetAudio.play();
                }

                scrollArea.querySelectorAll('.lyrics-line').forEach(l => l.classList.remove('selected'));
                line.classList.add('selected');

                line.style.transform = 'scale(1.02)';
                setTimeout(() => line.style.transform = '', 200);
            });
        });
    }

    // Функция рендера текста песни (упрощённая, без анимаций)
    function renderLyricsInContainer(container) {
        if (!lyricsData || !lyricsData.length) {
            container.innerHTML = `
        <div class="lyrics-placeholder">
            <i class="fas fa-microphone-slash"></i>
            <p>Текст не найден</p>
        </div>
    `;

            // Кнопка закрытия 
            const isDesktopOrLandscapeTablet = window.innerWidth >= 1281 ||
                (window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches);
            if (!isDesktopOrLandscapeTablet) {
                if (!lyricsContainer.querySelector('.lyrics-close-button')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'lyrics-close-button';
                    closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    closeBtn.style.cssText = `
                        position: fixed;
                        top: 16px;
                        right: 16px;
                        background: var(--surface-high);
                        color: var(--on-surface);
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        font-size: 0;
                        z-index: 2001;
                        cursor: pointer;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeLyrics();
                        const mobile = document.getElementById('mobile-lyrics-toggle');
                        if (mobile) mobile.classList.remove('active');
                        const two = document.querySelector('.expanded-two-columns');
                        if (two) two.classList.remove('queue-open');
                    });
                    lyricsContainer.appendChild(closeBtn);
                }
            }
            return;
        }

        const currentText = container.innerText;
        const newText = lyricsData.map(l => l.text).join('');
        if (currentText === newText) {
            return;
        }

        const attributionLine = {
            time: (lyricsData[lyricsData.length - 1]?.time || 0) + 0.5,
            text: 'Текст предоставлен LRCLIB (lrclib.net)'
        };

        const allLines = [...lyricsData, attributionLine];

        container.innerHTML = '';

        // Кнопка закрытия (только для мобильных и планшетов в портретной ориентации)
        const isDesktopOrLandscapeTablet = window.innerWidth >= 1281 ||
            (window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches);

        if (!isDesktopOrLandscapeTablet) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'lyrics-close-button';
            closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            closeBtn.style.cssText = `
                position: fixed;
                top: 16px;
                right: 16px;
                background: var(--surface-high);
                color: var(--on-surface);
                width: 44px;
                height: 44px;
                border-radius: 50%;
                font-size: 0;
                z-index: 2001;
                cursor: pointer;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeLyrics();

                const twoColumns = document.querySelector('.expanded-two-columns');
                if (twoColumns && twoColumns.classList.contains('queue-open')) {
                    twoColumns.classList.remove('queue-open');
                }

                const mobileLyricsBtn = document.getElementById('mobile-lyrics-toggle');
                if (mobileLyricsBtn) mobileLyricsBtn.classList.remove('active');
            });
            container.appendChild(closeBtn);
        }

        const scrollArea = document.createElement('div');
        scrollArea.className = 'lyrics-scroll-area';
        scrollArea.innerHTML = `
            <div class="lyrics-content">
                ${allLines.map((line, i) => `
                    <div class="lyrics-line ${i === allLines.length - 1 ? 'attribution-line' : ''}" data-index="${i}" data-time="${line.time}">
                        ${escapeHtml(line.text)}
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(scrollArea);

        // Обработчики кликов по строкам
        const lyricsLines = container.querySelectorAll('.lyrics-line');
        lyricsLines.forEach(line => {
            line.addEventListener('click', (e) => {
                e.stopPropagation();
                let targetAudio = isCrossfading ? nextAudio : audioPlayer;
                const time = parseFloat(line.dataset.time);
                if (!isNaN(time) && targetAudio.duration) {
                    if (isFinite(time) && isFinite(targetAudio.duration) && time <= targetAudio.duration) {
                        targetAudio.currentTime = time;
                    }
                    if (targetAudio.paused) targetAudio.play();

                    if (audioPlayer.paused) {
                        audioPlayer.play();
                    }

                    line.style.transform = 'scale(1.02)';
                    setTimeout(() => line.style.transform = '', 200);

                    userScrolledLyrics = false;
                    if (lyricsScrollTimer) {
                        clearTimeout(lyricsScrollTimer);
                        lyricsScrollTimer = null;
                    }
                }
            });
        });
    }

    // Фикс для ПК: кнопка текста в основном плеере
    if (window.innerWidth >= 1281) {
        const lyricsToggle = document.getElementById('lyrics-toggle-button');
        if (lyricsToggle) {
            const newBtn = lyricsToggle.cloneNode(true);
            lyricsToggle.parentNode.replaceChild(newBtn, lyricsToggle);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!expandedModal?.classList.contains('active')) {
                    openExpandedPlayer();
                    setTimeout(() => toggleLyrics(), 200);
                } else {
                    toggleLyrics();
                }
            });
        }
        // Кнопка на обложке
        const coverLyrics = document.getElementById('expanded-cover-lyrics');
        if (coverLyrics) {
            const newCover = coverLyrics.cloneNode(true);
            coverLyrics.parentNode.replaceChild(newCover, coverLyrics);
            newCover.addEventListener('click', (e) => {
                e.preventDefault();
                if (!expandedModal?.classList.contains('active')) {
                    openExpandedPlayer();
                    setTimeout(() => toggleLyrics(), 200);
                } else {
                    toggleLyrics();
                }
            });
        }
    }

    // Функция запуска синхронизации текста с музыкой
    function startLyricsSync(container) {
        // Сброс прокрутки к началу при первом запуске
        const scrollArea = container.querySelector('.lyrics-scroll-area');
        if (scrollArea && lyricsCurrentLine === -1) {
            scrollArea.scrollTo({ top: 0, behavior: 'auto' });
        }

        if (lyricsSyncInterval) clearInterval(lyricsSyncInterval);
        isLyricsOpen = true;
        lyricsCurrentLine = -1;

        if (scrollArea) {
            scrollArea.removeEventListener('scroll', () => onUserScroll(container));
            scrollArea.addEventListener('scroll', () => onUserScroll(container));
        }

        lyricsSyncInterval = setInterval(() => {
            if (!isLyricsOpen) return;

            // Во время кроссфейда текст синхронизируется с тем аудио, которое сейчас играет, чтобы избежать рассинхрона
            // Но если кроссфейд уже закончился, продолжается синхронизация с основным аудио
            let activeAudio = isCrossfading ? nextAudio : audioPlayer;

            if (!activeAudio || (activeAudio.paused && !isCrossfading)) return;
            if (!lyricsData) return;

            const currentTime = activeAudio.currentTime;

            let activeIndex = -1;
            for (let i = 0; i < lyricsData.length; i++) {
                if (currentTime >= lyricsData[i].time) {
                    activeIndex = i;
                } else {
                    break;
                }
            }

            if (activeIndex !== -1 && activeIndex !== lyricsCurrentLine) {
                // Проверка на случай, если трек ещё не начал играть, а время уже идёт
                const maxLyricsTime = lyricsData[lyricsData.length - 1]?.time || 0;
                if (audioPlayer.currentTime > maxLyricsTime + 1 && maxLyricsTime > 0) {
                    return;
                }
                const prevLines = container.querySelectorAll('.lyrics-line.active');
                prevLines.forEach(line => line.classList.remove('active'));
                container.querySelectorAll('.lyrics-line.selected').forEach(line => line.classList.remove('selected'));

                lyricsCurrentLine = activeIndex;

                const newLine = container.querySelector(`.lyrics-line[data-index="${activeIndex}"]`);
                if (newLine) {
                    newLine.classList.add('active');

                    // Прокручивание к активной строке, только если пользователь не прокручивал текст вручную в последние 1.5 секунды
                    if (!userScrolledLyrics && scrollArea) {
                        const offsetTop = newLine.offsetTop - scrollArea.offsetTop - 200;
                        scrollArea.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    }
                }
            }
        }, 50);

        const lyricsPanel = document.querySelector('.lyrics-container');
        if (lyricsPanel && lyricsPanel.offsetParent !== null) {
            const btn = document.getElementById('expanded-cover-lyrics');
            if (btn) btn.classList.add('active');
            const mainBtn = document.getElementById('lyrics-toggle-button');
            if (mainBtn) mainBtn.classList.add('active');
        }
        const queuePcBtn = document.getElementById('expanded-cover-queue');
        if (queuePcBtn) queuePcBtn.classList.remove('active');
        const queueMobileBtn = document.getElementById('mobile-queue-toggle');
        if (queueMobileBtn) queueMobileBtn.classList.remove('active');
    }

    // Закрыть текст
    function closeLyrics() {
        const rightBlock = document.querySelector('.expanded-right-block');
        const queueContainer = rightBlock?.querySelector('.expanded-queue-container');
        const lyricsContainer = rightBlock?.querySelector('.lyrics-container');
        const twoColumns = document.querySelector('.expanded-two-columns');
        const queueBtn = document.getElementById('expanded-cover-queue');

        if (lyricsContainer) {
            lyricsContainer.style.display = 'none';
        }

        if (twoColumns && twoColumns.classList.contains('queue-open')) {
            twoColumns.classList.remove('queue-open');
            if (queueBtn) queueBtn.classList.remove('active');
        }

        if (queueContainer) {
            queueContainer.style.display = 'none';
        }

        isLyricsOpen = false;
        isLyricsLoading = false;

        if (lyricsSyncInterval) {
            clearInterval(lyricsSyncInterval);
            lyricsSyncInterval = null;
        }

        const btn = document.getElementById('expanded-cover-lyrics');
        if (btn) btn.classList.remove('active');
        const mainBtn = document.getElementById('lyrics-toggle-button');
        if (mainBtn) mainBtn.classList.remove('active');

        const mobileLyricsBtn = document.getElementById('mobile-lyrics-toggle');
        if (mobileLyricsBtn) mobileLyricsBtn.classList.remove('active');
    }

    // Переключение текста (ПК)
    async function toggleLyrics() {
        if (!currentPlaylist.length || currentTrackIndex === -1) {
            toast("Нет активного трека", "info");
            return;
        }

        const twoColumns = document.querySelector('.expanded-two-columns');
        const rightBlock = document.querySelector('.expanded-right-block');
        const lyricsContainer = rightBlock?.querySelector('.lyrics-container');
        const queueContainer = rightBlock?.querySelector('.expanded-queue-container');

        if (lyricsContainer && lyricsContainer.style.display === 'flex') {
            closeLyrics();
            if (twoColumns && twoColumns.classList.contains('queue-open') && queueContainer?.style.display !== 'flex') {
                twoColumns.classList.remove('queue-open');
            }
            return;
        }

        if (isLyricsLoading) {
            closeLyrics();
            return;
        }

        if (twoColumns && !twoColumns.classList.contains('queue-open')) {
            twoColumns.classList.add('queue-open');
        }

        if (queueContainer) queueContainer.style.display = 'none';

        await openLyrics();

        const lyricsBtn = document.getElementById('expanded-cover-lyrics');
        const mainLyricsBtn = document.getElementById('lyrics-toggle-button');
        if (lyricsBtn) lyricsBtn.classList.add('active');
        if (mainLyricsBtn) mainLyricsBtn.classList.add('active');

        const queueBtn = document.getElementById('expanded-cover-queue');
        if (queueBtn) queueBtn.classList.remove('active');
    }

    // Обновление при смене трека
    async function updateLyricsButton() {
        if (!currentPlaylist.length || currentTrackIndex === -1 || !currentPlaylist[currentTrackIndex]) {
            const btn = document.getElementById('expanded-cover-lyrics');
            const mainBtn = document.getElementById('lyrics-toggle-button');
            if (btn) btn.style.display = 'none';
            if (mainBtn) mainBtn.style.display = 'none';
            return;
        }

        const track = currentPlaylist[currentTrackIndex];
        if (!track) return;

        let artist = track.artist || track.artist_display || '';
        if (track.artists?.length) artist = track.artists.join(', ');

        if (lyricsData && lyricsData.length > 0) {
            // Проверка, что текст для текущего трека закеширован, но не загружен в lyricsData
            const cacheKey = `lyrics_${artist.toLowerCase()}_${track.title.toLowerCase()}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached && lyricsData && lyricsData.length > 0) {
            }
        }

        const btn = document.getElementById('expanded-cover-lyrics');
        const mainBtn = document.getElementById('lyrics-toggle-button');

        if (btn) btn.style.display = 'flex';
        if (mainBtn) mainBtn.style.display = 'flex';

        const cached = loadCachedLyrics(artist, track.title);
        if (cached && cached.length > 0) {
            lyricsData = cached;
        }
    }

    // Настройка кнопок
    function setupLyricsButtons() {
        const lyricsBtn = document.getElementById('expanded-cover-lyrics');
        const mainLyricsBtn = document.getElementById('lyrics-toggle-button');

        if (lyricsBtn) {
            const newBtn = lyricsBtn.cloneNode(true);
            lyricsBtn.parentNode.replaceChild(newBtn, lyricsBtn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleLyrics();
            });
        }

        if (mainLyricsBtn) {
            const newBtn = mainLyricsBtn.cloneNode(true);
            mainLyricsBtn.parentNode.replaceChild(newBtn, mainLyricsBtn);
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                if (!expandedModal?.classList.contains('active')) {
                    openExpandedPlayer();
                }

                setTimeout(() => {
                    const rightBlock = document.querySelector('.expanded-right-block');
                    if (!rightBlock) return;

                    let lyricsContainer = rightBlock.querySelector('.lyrics-container');
                    if (!lyricsContainer) {
                        lyricsContainer = document.createElement('div');
                        lyricsContainer.className = 'lyrics-container';
                        rightBlock.appendChild(lyricsContainer);
                    }

                    const queueContainer = rightBlock.querySelector('.expanded-queue-container');
                    if (queueContainer) queueContainer.style.display = 'none';
                    lyricsContainer.style.display = 'flex';

                    const twoColumns = document.querySelector('.expanded-two-columns');
                    if (twoColumns) twoColumns.classList.add('queue-open');

                    if (!lyricsData || lyricsData.length === 0) {
                        const track = currentPlaylist[currentTrackIndex];
                        if (track) {
                            let artist = track.artist || track.artist_display || '';
                            if (track.artists?.length) artist = track.artists.join(', ');
                            lyricsContainer.innerHTML = '<div class="lyrics-loading"><div class="loading-dots"><span></span><span></span><span></span></div></div>';
                            loadLyrics(artist, track.title).then(lyrics => {
                                if (lyrics && lyrics.length) {
                                    lyricsData = lyrics;
                                    renderLyricsInContainer(lyricsContainer);
                                    startLyricsSync(lyricsContainer);
                                } else {
                                    lyricsContainer.innerHTML = '<div class="lyrics-placeholder"><i class="fas fa-microphone-slash"></i><p>Текст не найден</p></div>';
                                }
                            });
                        }
                    } else {
                        renderLyricsInContainer(lyricsContainer);
                        startLyricsSync(lyricsContainer);
                    }

                    const lyricsPcBtn = document.getElementById('expanded-cover-lyrics');
                    const queuePcBtn = document.getElementById('expanded-cover-queue');
                    const mobileLyrics = document.getElementById('mobile-lyrics-toggle');
                    const mobileQueue = document.getElementById('mobile-queue-toggle');
                    if (lyricsPcBtn) lyricsPcBtn.classList.add('active');
                    if (queuePcBtn) queuePcBtn.classList.remove('active');
                    if (mobileLyrics) mobileLyrics.classList.add('active');
                    if (mobileQueue) mobileQueue.classList.remove('active');

                }, 100);
            });
        }
    }

    setupLyricsButtons();

    // Фикс для ПК: кнопка очереди на обложке
    function initExpandedQueueButton() {
        const queueToggleBtn = document.getElementById('expanded-cover-queue');
        if (!queueToggleBtn) return;
        if (queueToggleBtn._hasListener) return;
        queueToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleExpandedQueue();
        });
        queueToggleBtn._hasListener = true;
    }

    initExpandedQueueButton();

    function cacheLyrics(artist, title, lyrics) {
        if (!artist || !title) return;
        const cacheKey = `lyrics_${artist.toLowerCase()}_${title.toLowerCase()}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            data: lyrics,
            timestamp: Date.now()
        }));
    }

    function loadCachedLyrics(artist, title) {
        if (!artist || !title) return null;
        const cacheKey = `lyrics_${artist.toLowerCase()}_${title.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;

        return data;
    }

    function preloadNextLyrics() {
        const nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
        const nextTrack = currentPlaylist[nextIndex];
        if (!nextTrack) return;

        let artist = nextTrack.artist || nextTrack.artist_display || '';
        if (nextTrack.artists?.length) artist = nextTrack.artists.join(', ');
        const title = nextTrack.title;
        const album = nextTrack.album || '';
        const duration = nextTrack.duration || 0;
        if (!loadCachedLyrics(artist, title)) {
            loadLyrics(artist, title, album, duration).catch(() => { });
        }
    }

    let currentLoadingTrackId = null;

    function resetLyrics() {
        if (lyricsSyncInterval) {
            clearInterval(lyricsSyncInterval);
            lyricsSyncInterval = null;
        }

        if (currentLoadingTrackId && currentLoadingTrackId !== currentPlaylist[currentTrackIndex]?.id) {
            return;
        }

        lyricsData = null;
        lyricsCurrentLine = -1;
    }

    const originalPlayTrack = playTrack;
    playTrack = async function (index) {

        if (isCrossfading) {
            cancelAnimationFrame(crossfadeAnimFrame);
            nextAudio.pause();
            nextAudio.currentTime = 0;
            nextAudio.volume = 0;
            isCrossfading = false;
            crossfadeScheduled = false;
            audioPlayer.volume = 1;
        }

        // Защита от двойного вызова
        if (isPlayingNow) {
            pendingPlayIndex = index;
            return;
        }

        // Сброс состояния текста (но не очищает контейнер)
        resetLyrics();
        originalPlayTrack(index);
        preloadNextTrack();

        const lyricsPanel = document.querySelector('.lyrics-container');
        if (!lyricsPanel || getComputedStyle(lyricsPanel).display !== 'flex') {
            preloadNextLyrics();
            return;
        }

        const currentTrack = currentPlaylist[currentTrackIndex];
        if (!currentTrack) {
            preloadNextLyrics();
            return;
        }

        let artist = currentTrack.artist || currentTrack.artist_display || '';
        if (currentTrack.artists?.length) artist = currentTrack.artists.join(', ');
        const title = currentTrack.title;
        const album = currentTrack.album || '';
        const duration = currentTrack.duration || 0;

        // Проверка кеша синхронно, чтобы не показывать спиннер, если текст уже есть
        const cached = loadCachedLyrics(artist, title);
        if (cached && cached.length) {
            // Если текст для текущего трека уже закеширован, использовать его без загрузки и спиннера
            lyricsData = cached;
            renderLyricsInContainer(lyricsPanel);
            startLyricsSync(lyricsPanel);
            return;
        }

        // Кеша нет - отображается спиннер
        const closeBtn = lyricsPanel.querySelector('.lyrics-close-button');
        lyricsPanel.innerHTML = '';
        if (closeBtn) lyricsPanel.appendChild(closeBtn);
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'lyrics-loading';
        loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        lyricsPanel.appendChild(loadingDiv);
        const loadingTrackId = currentTrack.id;

        // Загрузка текста из API
        const freshLyrics = await loadLyrics(artist, title, album, duration);

        // Проверка, что трек не сменился за время загрузки текста
        if (currentPlaylist[currentTrackIndex]?.id !== loadingTrackId) {
            // Предзагрзка текста для текущего (уже нового) трека
            preloadNextLyrics();
            return;
        }

        // Рендер текста, если он есть, или плейсхолдера, если текста нет
        if (freshLyrics && freshLyrics.length) {
            lyricsData = freshLyrics;
            renderLyricsInContainer(lyricsPanel);
            startLyricsSync(lyricsPanel);
        } else {
            lyricsPanel.innerHTML = '';
            if (closeBtn) lyricsPanel.appendChild(closeBtn);
            const placeholder = document.createElement('div');
            placeholder.className = 'lyrics-placeholder';
            placeholder.innerHTML = '<i class="fas fa-microphone-slash"></i><p>Текст не найден</p>';
            lyricsPanel.appendChild(placeholder);
            if (lyricsSyncInterval) clearInterval(lyricsSyncInterval);
            isLyricsOpen = false;
        }

        // Предзагрузка текста для следующего трека
        preloadNextLyrics();
    };

    // Принудительное создание контейнера текста для планшетов в ландшафтной ориентации, 
    // если по каким-то причинам он не был создан при открытии расширенного плеера
    function ensureLyricsContainerExists() {
        const isLandscapeTablet = window.innerWidth >= 768 &&
            window.innerWidth <= 1280 &&
            window.matchMedia('(orientation: landscape)').matches;

        if (isLandscapeTablet) {
            const rightBlock = document.querySelector('.expanded-right-block');
            if (rightBlock) {
                let lyricsContainer = rightBlock.querySelector('.lyrics-container');
                if (!lyricsContainer) {
                    lyricsContainer = document.createElement('div');
                    lyricsContainer.className = 'lyrics-container';
                    lyricsContainer.style.display = 'none';
                    lyricsContainer.style.height = '100%';
                    lyricsContainer.style.width = '100%';
                    lyricsContainer.style.flexDirection = 'column';
                    rightBlock.appendChild(lyricsContainer);
                }
            }
        }
    }

    setTimeout(ensureLyricsContainerExists, 100);

    window.addEventListener('resize', () => {
        setTimeout(ensureLyricsContainerExists, 100);
    });

    // Восстановление текста при ресайзе (особенно важно для перехода связки "ПК-планшет")
    let lastWidth = window.innerWidth;
    let lastIsLandscapeTablet = (window.innerWidth >= 768 && window.innerWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches);

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newIsLandscapeTablet = (newWidth >= 768 && newWidth <= 1280 && window.matchMedia('(orientation: landscape)').matches);

        // Если режим планшета изменился (вошли или вышли) и текст открыт
        if (newIsLandscapeTablet !== lastIsLandscapeTablet && isLyricsOpen && expandedModal?.classList.contains('active')) {
            setTimeout(() => {
                const twoColumns = document.querySelector('.expanded-two-columns');
                const rightBlock = document.querySelector('.expanded-right-block');
                const lyricsContainer = rightBlock?.querySelector('.lyrics-container');
                const queueContainer = rightBlock?.querySelector('.expanded-queue-container');

                if (twoColumns && !twoColumns.classList.contains('queue-open')) {
                    twoColumns.classList.add('queue-open');
                }

                if (rightBlock) {
                    if (newIsLandscapeTablet) {
                        rightBlock.style.width = '55%';
                    } else {
                        rightBlock.style.width = ''; // сброс, чтобы CSS определил самостоятельно
                    }
                }

                if (queueContainer) queueContainer.style.display = 'none';
                if (lyricsContainer) {
                    lyricsContainer.style.display = 'flex';
                    // Если есть данные, перерендер (на случай сброса стилей)
                    if (lyricsData && lyricsData.length) {
                        renderLyricsInContainer(lyricsContainer);
                    }
                }
            }, 30);
        }

        lastWidth = newWidth;
        lastIsLandscapeTablet = newIsLandscapeTablet;
    });

    // Media Session API для отображения информации о треке и управления воспроизведением через системные элементы управления
    function updateMediaSession(track) {
        if (!('mediaSession' in navigator)) return;

        if (!track) {
            navigator.mediaSession.metadata = null;
            return;
        }

        let artist = track.artist || track.artist_display || '';
        if (track.artists?.length) artist = track.artists.join(', ');

        const artwork = [];
        if (track.cover_url) {
            artwork.push({
                src: track.cover_url,
                sizes: '512x512',
                type: 'image/jpeg'
            });
        } else {
            artwork.push({
                src: '/placeholder-cover.jpg',
                sizes: '512x512'
            });
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: artist,
            album: '',
            artwork: artwork
        });
    }

    // Синхронизация состояния воспроизведения
    if ('mediaSession' in navigator) {
        audioPlayer.addEventListener('play', () => {
            navigator.mediaSession.playbackState = 'playing';
        });
        audioPlayer.addEventListener('pause', () => {
            navigator.mediaSession.playbackState = 'paused';
        });
        navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            playTrack(currentTrackIndex);
        });
    }

    /* НАСТРОЙКИ В ПРОФИЛЕ */
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileInfo = document.getElementById('profile-info');
    const profileSettings = document.getElementById('profile-settings');
    const profileCardElem = document.querySelector('.profile-card');

    function switchProfileTab(tabId) {
        if (tabId === 'info') {
            profileInfo.style.display = 'block';
            profileSettings.style.display = 'none';
            profileCardElem.classList.remove('settings-mode');
        } else if (tabId === 'settings') {
            profileInfo.style.display = 'none';
            profileSettings.style.display = 'block';
            profileCardElem.classList.add('settings-mode');
        }
    }

    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            if (!target) return;
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchProfileTab(target);
        });
    });

    // Элементы модалки темы
    const themeOptionsModal = document.getElementById('theme-options-modal');
    const closeThemeOptions = document.getElementById('close-theme-options');
    const themeOptions = document.querySelectorAll('.theme-option');
    const currentThemeLabel = document.getElementById('current-theme-label');
    const themeSettingsItem = document.querySelector('.settings-item[data-setting="theme"]');

    // Открытие модалки
    themeSettingsItem?.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('app_theme') || 'dark';
        themeOptions.forEach(opt => {
            if (opt.dataset.theme === currentTheme) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        themeOptionsModal.style.display = 'flex';
        themeOptionsModal.style.opacity = '1';
    });

    // Закрытие модалки
    closeThemeOptions?.addEventListener('click', () => {
        themeOptionsModal.style.display = 'none';
    });
    themeOptionsModal?.addEventListener('click', (e) => {
        if (e.target === themeOptionsModal) themeOptionsModal.style.display = 'none';
    });

    /* ВЫБОР ТЕМЫ */
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(selectedMode) {
        let effectiveTheme = selectedMode;
        if (selectedMode === 'system') {
            effectiveTheme = getSystemTheme();
        }
        if (effectiveTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        localStorage.setItem('app_theme', selectedMode);
        if (currentThemeLabel) {
            const labelMap = { dark: 'Тёмная', light: 'Светлая', system: 'Системная' };
            currentThemeLabel.textContent = labelMap[selectedMode];
        }
    }

    let systemThemeListenerActive = false;
    function startSystemThemeListener() {
        if (systemThemeListenerActive) return;
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.addEventListener('change', () => {
            if (localStorage.getItem('app_theme') === 'system') {
                applyTheme('system');
            }
        });
        systemThemeListenerActive = true;
    }

    function initTheme() {
        const savedMode = localStorage.getItem('app_theme') || 'dark';
        applyTheme(savedMode);
        startSystemThemeListener();
        themeOptions.forEach(opt => {
            if (opt.dataset.theme === savedMode) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // Выбор темы в модалке
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const newMode = opt.dataset.theme;
            applyTheme(newMode);
            themeOptionsModal.style.display = 'none';
            let themeLabel = '';
            const iconClass = newMode === 'dark' ? 'fa-moon' : (newMode === 'light' ? 'fa-sun' : 'fa-mobile-alt');
            const themeName = newMode === 'dark' ? 'тёмная' : (newMode === 'light' ? 'светлая' : 'системная (браузерная)');

            Swal.fire({
                html: `
                    <i class="fas ${iconClass}" style="font-size: 20px; color: var(--primary);"></i>
                    <span>Тема: ${themeName}</span>
                `,
                icon: undefined,
                background: 'var(--surface)',
                color: 'var(--on-surface)',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                toast: true,
                position: 'bottom-start',
                customClass: {
                    popup: 'custom-swal-toast theme-toast',
                    timerProgressBar: 'custom-timer-progress'
                }
            });
        });
    });
    initTheme();

    /* ПЕРЕХОД МЕЖДУ ТРЕКАМИ */
    function updateSliderDisabled() {
        const toggle = document.getElementById('track-delay-toggle');
        const slider = document.getElementById('track-delay-slider');

        if (!toggle || !slider) return;

        const sliderWrapper = slider.closest('.slider-wrapper') || slider.parentElement;

        if (toggle.checked) {
            sliderWrapper.style.display = 'flex';
        } else {
            sliderWrapper.style.display = 'none';
        }
    }

    // Загрузка сохранённой длительности кроссфейда
    function loadCrossfadeDuration() {
        const saved = localStorage.getItem('crossfade_duration_ms');
        crossfadeDuration = saved !== null ? parseFloat(saved) : 2000;

        const slider = document.getElementById('track-delay-slider');
        const span = document.getElementById('track-delay-value');
        const toggle = document.getElementById('track-delay-toggle');

        if (slider) {
            slider.value = crossfadeDuration / 1000;
            updateSliderFill();
        }

        if (span) {
            span.textContent = (crossfadeDuration / 1000) + ' сек';
        }

        const wasEnabled = localStorage.getItem('crossfade_enabled');
        if (toggle) {
            toggle.checked = wasEnabled === 'true';
        }

        updateSliderDisabled();
    }

    // Сохранение длительности
    function saveCrossfadeDuration(seconds) {
        crossfadeDuration = seconds * 1000;
        localStorage.setItem('crossfade_duration_ms', crossfadeDuration);
        const span = document.getElementById('track-delay-value');
        if (span) span.textContent = seconds + ' сек';
        updateSliderFill();
    }

    // Предзагрузка следующего трека
    function preloadNextTrack() {
        if (isCrossfading) return;
        if (currentPlaylist.length === 0) return;
        const nextIndex = getNextTrackIndex();
        if (nextIndex === -1 || nextIndex === currentTrackIndex) return;
        const nextTrack = currentPlaylist[nextIndex];
        if (!nextTrack) return;
        if (nextAudio.src !== nextTrack.file_url) {
            nextAudio.src = nextTrack.file_url;
            nextAudio.currentTime = 0;
            nextAudio.load();
            nextAudio.pause();
            nextAudio.volume = 0;
        }
    }

    // Возвращает индекс следующего трека с учётом shuffle/повтора
    function getNextTrackIndex() {
        if (currentPlaylist.length === 0) return -1;
        if (currentPlaylist.length === 1) return currentTrackIndex; // Единственный трек

        if (isShuffle) {
            let newIdx;
            do {
                newIdx = Math.floor(Math.random() * currentPlaylist.length);
            } while (newIdx === currentTrackIndex);
            return newIdx;
        } else {
            return (currentTrackIndex + 1) % currentPlaylist.length;
        }
    }

    function updatePlayerUI(track) {
        if (!track) return;
        document.querySelector('.track-name').textContent = track.title || 'Без названия';
        let artistName = track.artist || track.artist_display || (track.artists?.join(', ') || 'Неизвестен');
        document.querySelector('.track-artist').textContent = artistName;
        const coverEl = document.querySelector('.track-cover');
        if (track.cover_url) {
            coverEl.style.backgroundImage = `url(${track.cover_url})`;
            coverEl.style.backgroundSize = 'cover';
            coverEl.style.backgroundPosition = 'center';
            coverEl.style.backgroundColor = 'transparent';
        } else {
            coverEl.style.backgroundImage = '';
            coverEl.style.backgroundColor = '#333';
        }
        updateLikeVisuals(track.is_liked);
        currentTimeEl.textContent = '0:00';
        totalTimeEl.textContent = formatTime(track.duration || 0);
        progressFill.style.width = '0%';
        document.querySelector('.progress-handle').style.left = '0%';

        // Расширенный плеер
        if (expandedModal?.classList.contains('active')) {
            expandedTrackName.textContent = track.title || 'Название трека';
            expandedTrackArtist.textContent = artistName;
            if (track.cover_url) expandedCover.src = track.cover_url;
            else expandedCover.src = '';
            const expandedFill = document.querySelector('.expanded-progress .progress-fill');
            const expandedHandle = document.querySelector('.expanded-progress .progress-handle');
            if (expandedFill) expandedFill.style.width = '0%';
            if (expandedHandle) expandedHandle.style.left = '0%';
            if (expandedCurrentTime) expandedCurrentTime.textContent = '0:00';
            if (expandedTotalTime) expandedTotalTime.textContent = formatTime(track.duration || 0);
            renderExpandedQueue();
        }
        if (queueOverlay?.classList.contains('active')) renderQueue();
    }

    // Функция для синхронизации воспроизведения/паузы обоих аудиоэлементов
    function syncBothAudios(shouldPlay) {
        if (shouldPlay) {
            if (audioPlayer.paused && audioPlayer.src) {
                audioPlayer.play().catch(e => warn('play main error', e));
            }
            // Запускает следующий только если сейчас идёт сведение
            if (isCrossfading && nextAudio.src && nextAudio.paused && nextAudio.readyState >= 2) {
                nextAudio.play().catch(e => warn('play next error', e));
            }
        } else {
            //  Остановка основного аудиоэлемента всегда, если он играет
            if (!audioPlayer.paused && audioPlayer.src) {
                audioPlayer.pause();
            }
            // Остановка следующего аудиоэлемента только если сейчас идёт сведение, 
            // чтобы не прерывать трек, который уже играет, если кроссфейд неактивен
            if (isCrossfading && nextAudio.src && !nextAudio.paused) {
                nextAudio.pause();
            }
        }
        syncPlayPauseIcon();
    }

    // Запуск кроссфейда
    async function startCrossfade(nextIndex) {
        // Принудительный сброс, если флаги висят, но кроссфейд не активен
        if ((isCrossfading || crossfadeScheduled) && !isCrossfading) {
            isCrossfading = false;
            crossfadeScheduled = false;
            if (nextAudio) {
                nextAudio.pause();
                nextAudio.currentTime = 0;
                nextAudio.volume = 0;
            }
            audioPlayer.volume = 1;
        }
        const toggle = document.getElementById('track-delay-toggle');
        if (toggle && !toggle.checked) {
            return;
        }
        if (isCrossfading || crossfadeScheduled) {
            return;
        }

        let nextTrack = currentPlaylist[nextIndex];
        if (!nextTrack) {
            return;
        }

        crossfadeScheduled = true;

        try {
            updatePlayerUIForCrossfade(nextTrack);
            // Мгновенное обновление UI для следующего трека
            const lyricsPanel = document.querySelector('.lyrics-container');
            if (lyricsPanel && getComputedStyle(lyricsPanel).display === 'flex') {
                // Сброс текущего текста (только данные, не UI)
                if (lyricsSyncInterval) {
                    clearInterval(lyricsSyncInterval);
                    lyricsSyncInterval = null;
                }
                lyricsCurrentLine = -1;

                let artist = nextTrack.artist || nextTrack.artist_display || '';
                if (nextTrack.artists?.length) artist = nextTrack.artists.join(', ');
                const title = nextTrack.title;

                const cached = loadCachedLyrics(artist, title);
                if (cached && cached.length) {
                    // Мгновенно из кеша
                    lyricsData = cached;
                    renderLyricsInContainer(lyricsPanel);
                    startLyricsSync(lyricsPanel);
                    // Сброс прокрутки к началу
                    const scrollArea = lyricsPanel.querySelector('.lyrics-scroll-area');
                    if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'auto' });
                } else {
                    const closeBtn = lyricsPanel.querySelector('.lyrics-close-button');
                    lyricsPanel.innerHTML = '';
                    if (closeBtn) lyricsPanel.appendChild(closeBtn);
                    const loadingDiv = document.createElement('div');
                    loadingDiv.className = 'lyrics-loading';
                    loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
                    lyricsPanel.appendChild(loadingDiv);

                    // Загрузка текста для следующего трека ассинхронно
                    loadLyrics(artist, title).then(lyrics => {
                        if (currentPlaylist[currentTrackIndex]?.id === nextTrack.id) {
                            if (lyrics && lyrics.length) {
                                lyricsData = lyrics;
                                renderLyricsInContainer(lyricsPanel);
                                startLyricsSync(lyricsPanel);
                            } else {
                                lyricsPanel.innerHTML = '';
                                if (closeBtn) lyricsPanel.appendChild(closeBtn);
                                const placeholder = document.createElement('div');
                                placeholder.className = 'lyrics-placeholder';
                                placeholder.innerHTML = '<i class="fas fa-microphone-slash"></i><p>Текст не найден</p>';
                                lyricsPanel.appendChild(placeholder);
                            }
                        }
                    });
                }
            }
            currentTrackIndex = nextIndex;
            currentTrackId = nextTrack.id;
            renderQueue();
            if (expandedModal?.classList.contains('active')) renderExpandedQueue();

            // Подготовка nextAudio
            if (nextAudio.src !== nextTrack.file_url) {
                nextAudio.src = nextTrack.file_url;
                nextAudio.load();
            }
            nextAudio.volume = 0;
            nextAudio.currentTime = 0;
            await waitForAudioReady(nextAudio, 3000);

            try {
                await nextAudio.play();
            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    toast("Нажмите на плеер для плавного перехода", "info");
                    await new Promise(resolve => {
                        const onClick = () => {
                            document.removeEventListener('click', onClick);
                            resolve();
                        };
                        document.addEventListener('click', onClick);
                    });
                    await nextAudio.play();
                } else {
                    throw err;
                }
            }

            // Ожидание первого обновления currentTime, чтобы гарантировать, что трек действительно стартовал и не застрял на 0 из-за каких-то проблем
            await new Promise((resolve) => {
                const onTime = () => {
                    if (nextAudio.currentTime > 0.01) {
                        nextAudio.removeEventListener('timeupdate', onTime);
                        resolve();
                    }
                };
                nextAudio.addEventListener('timeupdate', onTime);
                setTimeout(() => {
                    nextAudio.removeEventListener('timeupdate', onTime);
                    resolve();
                }, 2000);
            });

            // Обновление прогресс-бара следующего трека в реальном времени во время кроссфейда
            const updateProgressFromNext = () => {
                if (nextAudio.duration) {
                    const percent = (nextAudio.currentTime / nextAudio.duration) * 100;
                    progressFill.style.width = `${percent}%`;
                    document.querySelector('.progress-handle').style.left = `${percent}%`;
                    currentTimeEl.textContent = formatTime(nextAudio.currentTime);
                    if (expandedModal?.classList.contains('active')) {
                        const eFill = document.querySelector('.expanded-progress .progress-fill');
                        const eHandle = document.querySelector('.expanded-progress .progress-handle');
                        if (eFill) eFill.style.width = `${percent}%`;
                        if (eHandle) eHandle.style.left = `${percent}%`;
                        const eCurr = document.querySelector('.expanded-current-time');
                        if (eCurr) eCurr.textContent = formatTime(nextAudio.currentTime);
                    }
                }
            };
            nextAudio.addEventListener('timeupdate', updateProgressFromNext);
            window._tempProgressHandler = updateProgressFromNext;

            // Анимация
            isCrossfading = true;
            const startTime = performance.now();
            const duration = crossfadeDuration;

            const updateVolume = (progress) => {
                progress = Math.min(1, Math.max(0, progress));
                audioPlayer.volume = Math.max(0, 1 - progress);
                nextAudio.volume = Math.min(1, progress);
            };

            const step = (now) => {
                let progress = Math.min(1, (now - startTime) / duration);
                progress = 1 - Math.pow(1 - progress, 2);
                updateVolume(progress);
                if (progress < 1) {
                    crossfadeAnimFrame = requestAnimationFrame(step);
                } else {
                    finishCrossfade(nextTrack, updateProgressFromNext);
                }
            };
            crossfadeAnimFrame = requestAnimationFrame(step);
        } catch (err) {
            isCrossfading = false;
            crossfadeScheduled = false;
            nextAudio.pause();
            nextAudio.currentTime = 0;
            nextAudio.volume = 0;
            audioPlayer.volume = 1;
        }
    }

    function finishCrossfade(nextTrack, progressHandler) {
        cancelAnimationFrame(crossfadeAnimFrame);

        if (progressHandler) {
            nextAudio.removeEventListener('timeupdate', progressHandler);
        }

        let oldPlayer = audioPlayer;
        let activePlayer = nextAudio;

        let strippedNode = oldPlayer.cloneNode(true);

        // ВАЖНО: отчистка src и остановка воспроизведения должны происходить до замены в DOM, чтобы избежать ситуации, 
        // когда старый плеер, всё ещё находясь в документе, может начать воспроизводить трек параллельно новому из-за каких-то странных сбоев
        strippedNode.removeAttribute('src');
        strippedNode.src = '';
        strippedNode.volume = 0;

        oldPlayer.parentNode.replaceChild(strippedNode, oldPlayer);

        // Сначала переключение переменных
        nextAudio = strippedNode;
        audioPlayer = activePlayer;

        // И только потом жестко убивается старый плеер
        oldPlayer.pause();
        oldPlayer.removeAttribute('src');
        oldPlayer.src = '';
        oldPlayer.load();
        oldPlayer.volume = 0;

        // Страховка: на случай, если анимация остановилась на 0.99
        audioPlayer.volume = 1;

        window.initAudioListeners(audioPlayer);

        autoAdvance = false;
        isCrossfading = false;
        crossfadeScheduled = false;

        preloadNextTrack();
        preloadNextLyrics();

        // Принудительное восстановление правильной иконки,
        // если старый трек успел сбить её своим предсмертным событием "pause"
        syncPlayPauseIcon();
    }

    // Функция для обновления UI при начале кроссфейда, чтобы следующий трек отображался мгновенно, а не после окончания кроссфейда
    function updatePlayerUIForCrossfade(track) {
        if (!track) return;
        // Основной плеер
        document.querySelector('.track-name').textContent = track.title || 'Без названия';
        let artistName = track.artist || track.artist_display || (track.artists?.join(', ') || 'Неизвестен');
        document.querySelector('.track-artist').textContent = artistName;
        const coverEl = document.querySelector('.track-cover');
        if (track.cover_url) {
            coverEl.style.backgroundImage = `url(${track.cover_url})`;
            coverEl.style.backgroundSize = 'cover';
            coverEl.style.backgroundPosition = 'center';
            coverEl.style.backgroundColor = 'transparent';
        } else {
            coverEl.style.backgroundImage = '';
            coverEl.style.backgroundColor = '#333';
        }
        updateLikeVisuals(track.is_liked);
        totalTimeEl.textContent = formatTime(track.duration || 0);

        // Расширенный плеер (если открыт)
        if (expandedModal?.classList.contains('active')) {
            expandedTrackName.textContent = track.title || 'Название трека';
            expandedTrackArtist.textContent = artistName;
            if (track.cover_url) expandedCover.src = track.cover_url;
            else expandedCover.src = '';
            if (expandedLikeBtn) {
                const likeIcon = expandedLikeBtn.querySelector('i');
                if (track.is_liked) likeIcon.classList.replace('fa-regular', 'fa-solid');
                else likeIcon.classList.replace('fa-solid', 'fa-regular');
            }
            const expandedTotal = document.querySelector('.expanded-total-time');
            if (expandedTotal) expandedTotal.textContent = formatTime(track.duration || 0);
        }
    }

    function waitForAudioReady(audio, maxWaitMs = 3000) {
        return new Promise((resolve) => {
            if (audio.readyState >= 2) {
                resolve();
                return;
            }
            const onCanPlay = () => {
                audio.removeEventListener('canplaythrough', onCanPlay);
                resolve();
            };
            audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            setTimeout(() => {
                audio.removeEventListener('canplaythrough', onCanPlay);
                resolve();
            }, maxWaitMs);
        });
    }

    /* НАСТРОЙКИ КРОССФЕЙДА И ПЕРЕХОДОВ МЕЖДУ ТРЕКАМИ */
    const crossfadeSlider = document.getElementById('track-delay-slider');
    const crossfadeToggle = document.getElementById('track-delay-toggle');

    function updateSliderFill() {
        const slider = document.getElementById('track-delay-slider');
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 10;
        const val = parseFloat(slider.value);
        const percent = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--fill-percent', `${percent}%`);
    }

    if (crossfadeSlider) {
        crossfadeSlider.addEventListener('input', (e) => {
            if (crossfadeToggle && !crossfadeToggle.checked) {
                crossfadeToggle.checked = true;
                localStorage.setItem('crossfade_enabled', true);
                updateSliderDisabled();
            }
            saveCrossfadeDuration(parseFloat(e.target.value));
        });
    }

    if (crossfadeToggle) {
        crossfadeToggle.addEventListener('change', (e) => {
            localStorage.setItem('crossfade_enabled', e.target.checked);
            updateSliderDisabled();
        });
    }

    loadCrossfadeDuration();

    // Ещё одна синхронизация кнопок...
    setInterval(() => {
        // Жесткая синхронизация кнопки Play/Pause (игнорирует любые призрачные события)
        const isPlaying = audioPlayer && !audioPlayer.paused && audioPlayer.src;
        document.querySelectorAll('.play-pause-button i, .expanded-play-pause i').forEach(icon => {
            if (isPlaying) {
                icon.classList.replace('fa-play', 'fa-pause');
            } else {
                icon.classList.replace('fa-pause', 'fa-play');
            }
        });

        // Синхронизация кнопок текста и очереди
        const expandedModal = document.getElementById('expanded-player-modal');
        const isExpandedActive = expandedModal && expandedModal.classList.contains('active');
        const twoColumns = document.querySelector('.expanded-two-columns');
        const rightBlock = document.querySelector('.expanded-right-block');

        let isLyricsVisible = false;
        let isQueueVisible = false;

        // Проверка видимости текста и очереди только если расширенный плеер открыт
        if (isExpandedActive) {
            const isPanelOpen = twoColumns && twoColumns.classList.contains('queue-open');

            if (isPanelOpen && rightBlock) {
                const lyricsContainer = rightBlock.querySelector('.lyrics-container');
                const queueContainer = rightBlock.querySelector('.expanded-queue-container');
                isLyricsVisible = lyricsContainer && lyricsContainer.style.display === 'flex';
                isQueueVisible = queueContainer && queueContainer.style.display === 'flex';
            }

            // Отдельная проверка для мобильного оверлея очереди
            if (document.querySelector('.mobile-queue-overlay')) {
                isQueueVisible = true;
            }
        }

        // Форсирование состояния кнопок текста
        document.querySelectorAll('#expanded-cover-lyrics, #lyrics-toggle-button, #mobile-lyrics-toggle').forEach(btn => {
            if (btn) btn.classList.toggle('active', isLyricsVisible);
        });

        // Форсирование состояния кнопок очереди
        document.querySelectorAll('#expanded-cover-queue, #mobile-queue-toggle').forEach(btn => {
            if (btn) btn.classList.toggle('active', isQueueVisible);
        });
    }, 250);
});