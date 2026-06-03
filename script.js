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

    /* ЭЛЕМЕНТЫ АВТОРИЗАЦИИ */
    const uploadFormContainer = document.getElementById('upload-form-container');
    const openUploadModalButton = document.getElementById('open-upload-modal');
    const startUploadButton = document.getElementById('start-upload-button');
    const trackTitleInput = document.getElementById('track-title');
    const trackArtistInput = document.getElementById('track-artist');
    const trackFileInput = document.getElementById('track-file');

    /* ЭЛЕМЕНТЫ ПЛЕЕРА */
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
    const expandedQueueList = document.getElementById('expanded-queue-list');
    const expandedQueueClose = document.getElementById('expanded-queue-close');
    const expandedContextMenu = document.getElementById('expanded-context-menu');
    const expandedEditTrackBtn = document.getElementById('expanded-edit-track');
    const expandedAddToPlaylistBtn = document.getElementById('expanded-add-to-playlist');

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
    repeatBtn.classList.toggle('active', isRepeat);
    shuffleBtn.classList.toggle('active', isShuffle);

    /* ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ */

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
        if (password.length < minLength) return "Пароль должен быть не короче 8 символов";
        if (!hasUpperCase) return "Добавьте хотя бы одну заглавную букву";
        if (!hasNumber) return "Добавьте хотя бы одну цифру";
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
        
        const currentTrackObj = currentPlaylist[currentTrackIndex];
        if (currentTrackObj && !currentTrackObj.duration) {
            const duration = Math.floor(audioPlayer.duration);
            currentTrackObj.duration = duration;

            const trackInAll = allUserTracks.find(t => t.id === currentTrackObj.id);
            if (trackInAll) trackInAll.duration = duration;
            
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
        }
        shuffleBtn.classList.toggle('active', isShuffle);
        repeatBtn.classList.toggle('active', isRepeat);
        if (queueOverlay.classList.contains('active')) renderQueue();
        if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);
        if (expandedRepeatBtn) expandedRepeatBtn.classList.toggle('active', isRepeat);
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

        const { data: userData, error } = await supabase
            .from('users_data')
            .select('avatar_url, display_name')
            .eq('id', currentUser)
            .single();
        
        if (error || !userData) {
            console.error('Ошибка загрузки профиля:', error);
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

        audioPlayer.addEventListener('canplay', () => {
            audioPlayer.play().catch(e => console.log('Auto-play error:', e));
        }, { once: true });

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    saveToRecent(track);
                })
                .catch(error => {
                    console.log('Play error:', error);
                    setTimeout(() => {
                        const retryPromise = audioPlayer.play();
                        if (retryPromise !== undefined) {
                            retryPromise.catch(err => null);
                        }
                    }, 100);
                });
        }
        
        if (queueOverlay.classList.contains('active')) renderQueue();

        if (expandedModal && expandedModal.classList.contains('active')) {
            updateExpandedPlayer();
            syncExpandedProgress();
            if (expandedQueueContainer && expandedQueueContainer.classList.contains('active')) {
                renderExpandedQueue();
            }
        }
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
        document.getElementById('playlist-view-title').textContent = playlistName;
        const container = document.getElementById('playlist-tracks-list');
        container.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
        const { data: playlistTracks } = await supabase.from('playlist_tracks').select('track_id').eq('playlist_id', playlistId);
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
                        <div style="font-weight:500;">${track.title}</div>
                        <div style="font-size:11px; color:#888;">${track.artist || 'Неизвестен'}</div>
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
                // Очищаем кеш обложки этого плейлиста
                clearImageCache(`playlist_${currentEditPlaylistId}`);
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
        
        let coverUrl = null;
        try {
            const { data: track } = await supabase
                .from('tracks')
                .select('cover_url')
                .eq('id', trackId)
                .single();
            coverUrl = track?.cover_url || null;
        } catch(e) { 
            console.warn(e);
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
        
        const editModal = document.getElementById('edit-track-modal');
        if (editModal) {
            editModal.style.display = 'flex';
            editModal.style.opacity = '1';
            editModal.style.zIndex = '10001';
        }
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
            title: newTitle,
            artist_display: newArtist || "Неизвестен",
            cover_url: newCoverUrl
        }).eq('id', currentEditTrackId);
        
        if (error) { toast("Ошибка обновления", "error"); return; }
        
        const parsedArtists = parseArtists(newArtist);
        if (parsedArtists.length) {
            await saveTrackArtists(currentEditTrackId, parsedArtists);
        }
        
        toast("Трек обновлён");
        clearCache();
        document.getElementById('edit-track-modal').style.display = 'none';
        loadUserTracks();
        refreshAllData(); 
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
            
            // ПЛЕЙЛИСТЫ: скрываем микрофон, показываем часы
            if (artistBtn) artistBtn.style.display = 'none';
            if (durationBtn) durationBtn.style.display = 'flex';
        } else {
            tracksList.style.display = 'grid';
            playlistsViewContainer.style.display = 'none';
            openUploadModalButton.style.display = 'flex';
            createPlaylistButton.style.display = 'none';
            if (sortGroup) sortGroup.style.display = 'flex';
            
            // ТРЕКИ: показываем микрофон, скрываем часы
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
            console.error(err); 
            Swal.fire("Ошибка", err.message, "error"); 
        } finally { 
            startUploadButton.disabled = false; 
            startUploadButton.textContent = "Добавить"; 
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
            
            await loadUserTracks();
            hideAllSections();
            profileView.style.display = 'block';
            await loadProfileStatsAndAvatar();
            refreshAllData();
            
            toast(`С возвращением, ${userData.display_name || userData.username}!`);
            
        } catch (error) {
            console.error(error);
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
            console.error(err);
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

    // Закрытие модалки создания плейлиста
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

    // Закрытие модалки загрузки трека по клику на фон
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

    // Закрытие модалки редактирования трека
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

    // Закрытие модалки добавления в плейлист
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

    // Закрытие модалки профиля
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

     // Закрытие модалки редактирования плейлиста
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
            if (previewTracks) previewTracks.textContent = '...';
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
            'На трек Дрейка можно поставить <span class="crossed">фото Ивана Золо</span> свое селфи. Попробуй!',
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
        expandPlayerButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentPlaylist.length > 0 && currentTrackIndex !== -1) {
                openExpandedPlayer();
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
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
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
            if (audioPlayer.duration) audioPlayer.currentTime = (p / 100) * audioPlayer.duration;
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
            if (audioPlayer.duration) audioPlayer.currentTime = (p / 100) * audioPlayer.duration;
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }
    initExpandedProgressSlider();

    // Синхронизация расширенного плеера через события
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', syncExpandedProgress);
        audioPlayer.addEventListener('loadedmetadata', () => {
            syncExpandedProgress();
            const total = document.querySelector('.expanded-total-time');
            if (total) total.textContent = formatTime(audioPlayer.duration);
        });
    }

    // Открытие/закрытие
    function openExpandedPlayer() {
        updateExpandedPlayer();
        if (expandedShuffleBtn) expandedShuffleBtn.classList.toggle('active', isShuffle);
        syncExpandedProgress();
        expandedModal.classList.add('active');
        if (expandedQueueContainer) expandedQueueContainer.classList.remove('active');
        if (expandedCoverQueue) expandedCoverQueue.classList.remove('active');
        if (expandedContextMenu) expandedContextMenu.classList.remove('active');
        
        if (expandedPlayPauseIcon) {
            if (audioPlayer.paused || !audioPlayer.src) {
                expandedPlayPauseIcon.classList.remove('fa-pause');
                expandedPlayPauseIcon.classList.add('fa-play');
            } else {
                expandedPlayPauseIcon.classList.remove('fa-play');
                expandedPlayPauseIcon.classList.add('fa-pause');
            }
        }
    }

    function closeExpandedPlayer() {
        expandedModal.classList.remove('active');
        if (expandedContextMenu) expandedContextMenu.classList.remove('active');
    }

    document.getElementById('expanded-minimize')?.addEventListener('click', closeExpandedPlayer);

    // Кнопки управления расширенным плеером
    if (expandedPlayPauseBtn) {
        expandedPlayPauseBtn.addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                if (expandedPlayPauseIcon) {
                    expandedPlayPauseIcon.classList.remove('fa-play');
                    expandedPlayPauseIcon.classList.add('fa-pause');
                }
                if (playPauseIcon) {
                    playPauseIcon.classList.remove('fa-play');
                    playPauseIcon.classList.add('fa-pause');
                }
            } else {
                audioPlayer.pause();
                if (expandedPlayPauseIcon) {
                    expandedPlayPauseIcon.classList.remove('fa-pause');
                    expandedPlayPauseIcon.classList.add('fa-play');
                }
                if (playPauseIcon) {
                    playPauseIcon.classList.remove('fa-pause');
                    playPauseIcon.classList.add('fa-play');
                }
            }
        });
    }

    if (expandedPrevBtn) {
        expandedPrevBtn.addEventListener('click', () => {
            if (!currentPlaylist.length) return;
            
            const THRESHOLD = 5;
            
            if (audioPlayer.currentTime > THRESHOLD) {
                audioPlayer.currentTime = 0;
                syncExpandedProgress();
            } else {
                currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
                playTrack(currentTrackIndex);
                updateExpandedPlayer();
                if (expandedQueueContainer?.classList.contains('active')) renderExpandedQueue();
            }
        });
    }

    if (expandedNextBtn) {
        expandedNextBtn.addEventListener('click', () => {
            if (currentPlaylist.length) {
                currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
                playTrack(currentTrackIndex);
                updateExpandedPlayer();
                if (expandedQueueContainer?.classList.contains('active')) renderExpandedQueue();
            }
        });
    }

    // Шаффл внизу
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
            if (expandedQueueContainer?.classList.contains('active')) renderExpandedQueue();
            if (queueOverlay.classList.contains('active')) renderQueue();
        });
    }

    // Лайк внизу
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

    // Очередь
    function renderExpandedQueue() {
        if (!expandedQueueList) return;
        expandedQueueList.innerHTML = '';
        currentPlaylist.forEach((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            const item = document.createElement('div');
            item.className = `expanded-queue-item ${isCurrent ? 'current' : ''}`;
            item.innerHTML = `
                <div class="expanded-queue-item-cover" style="background-image: url('${track.cover_url || ''}'); background-size: cover;"></div>
                <div class="expanded-queue-item-info">
                    <div class="expanded-queue-item-title">${escapeHtml(track.title || 'Без названия')}</div>
                    <div class="expanded-queue-item-artist">${escapeHtml(track.artist || 'Неизвестен')}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                currentTrackIndex = idx;
                playTrack(currentTrackIndex);
                updateExpandedPlayer();
                renderExpandedQueue();
            });
            expandedQueueList.appendChild(item);
        });
    }

    // Вспомогательная функция для создания элемента очереди
    function createQueueItem(track, idx, isCurrent) {
        const div = document.createElement('div');
        div.className = `expanded-queue-item ${isCurrent ? 'current' : ''}`;
        div.innerHTML = `
            <div class="expanded-queue-item-cover" style="background-image: url('${track.cover_url || ''}'); background-size: cover;"></div>
            <div class="expanded-queue-item-info">
                <div class="expanded-queue-item-title">${escapeHtml(track.title || 'Без названия')}</div>
                <div class="expanded-queue-item-artist">${escapeHtml(track.artist || 'Неизвестен')}</div>
            </div>
        `;
        div.addEventListener('click', () => {
            currentTrackIndex = idx;
            playTrack(currentTrackIndex);
            updateExpandedPlayer();
            renderExpandedQueue();
        });
        return div;
    }

    function openQueue() {
        expandedQueueContainer.classList.add('active');
        if (expandedCoverQueue) expandedCoverQueue.classList.add('active');
        renderExpandedQueue();
    }

    function closeExpandedQueue() {
        expandedQueueContainer.classList.remove('active');
        if (expandedCoverQueue) expandedCoverQueue.classList.remove('active');
    }

    if (expandedCoverQueue) {
        expandedCoverQueue.addEventListener('click', (e) => {
            e.stopPropagation();
            if (expandedQueueContainer.classList.contains('active')) closeExpandedQueue();
            else openQueue();
        });
    }

    if (expandedQueueClose) {
        expandedQueueClose.addEventListener('click', closeExpandedQueue);
    }

    // Синхронизация иконок через события аудио
    audioPlayer.addEventListener('play', () => {
        if (expandedPlayPauseIcon) {
            expandedPlayPauseIcon.classList.remove('fa-play');
            expandedPlayPauseIcon.classList.add('fa-pause');
        }
        if (playPauseIcon) {
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
        }
    });
    
    audioPlayer.addEventListener('pause', () => {
        if (expandedPlayPauseIcon) {
            expandedPlayPauseIcon.classList.remove('fa-pause');
            expandedPlayPauseIcon.classList.add('fa-play');
        }
        if (playPauseIcon) {
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
        }
    });
    
    if (expandedEditTrackBtn) {
        expandedEditTrackBtn.addEventListener('click', () => {
            const track = currentPlaylist[currentTrackIndex];
            if (track) {
                showEditTrackModal(track.id, track.title, track.artist);
            }
            if (expandedContextMenu) expandedContextMenu.classList.remove('active');
        });
    }
    
    if (expandedAddToPlaylistBtn) {
        expandedAddToPlaylistBtn.addEventListener('click', () => {
            const track = currentPlaylist[currentTrackIndex];
            if (track) {
                showAddToPlaylistModal(track.id, track.title, track.artist);
            }
            if (expandedContextMenu) expandedContextMenu.classList.remove('active');
        });
    }

    /* ОБНОВЛЕНИЯ */
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

    document.body.style.opacity = '1';

    /* МОБИЛЬНАЯ АДАПТАЦИЯ */

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
                if (audioPlayer.paused || !audioPlayer.src) {
                    icon.className = 'fas fa-play';
                } else {
                    icon.className = 'fas fa-pause';
                }
                newPlayPause.appendChild(icon);
                newPlayPause.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                    } else {
                        audioPlayer.pause();
                    }
                });
                const likeBtn = trackActions.querySelector('.like-button');
                if (likeBtn && likeBtn.nextSibling) {
                    trackActions.insertBefore(newPlayPause, likeBtn.nextSibling);
                } else if (likeBtn) {
                    trackActions.appendChild(newPlayPause);
                } else {
                    trackActions.appendChild(newPlayPause);
                }
                originalPlayPause.remove();

                const updateIcon = () => {
                    const btn = trackActions.querySelector('.play-pause-button');
                    if (!btn) return;
                    const i = btn.querySelector('i');
                    if (audioPlayer.paused || !audioPlayer.src) {
                        i.classList.remove('fa-pause');
                        i.classList.add('fa-play');
                    } else {
                        i.classList.remove('fa-play');
                        i.classList.add('fa-pause');
                    }
                };
                audioPlayer.removeEventListener('play', updateIcon);
                audioPlayer.removeEventListener('pause', updateIcon);
                audioPlayer.addEventListener('play', updateIcon);
                audioPlayer.addEventListener('pause', updateIcon);
                updateIcon();
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
                if (audioPlayer.paused || !audioPlayer.src) {
                    icon.className = 'fas fa-play';
                } else {
                    icon.className = 'fas fa-pause';
                }
                desktopPlayPause.appendChild(icon);
                desktopPlayPause.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                    } else {
                        audioPlayer.pause();
                    }
                });
                const prevBtn = playerControls.querySelector('.prev-button');
                if (prevBtn && prevBtn.nextSibling) {
                    playerControls.insertBefore(desktopPlayPause, prevBtn.nextSibling);
                } else {
                    playerControls.appendChild(desktopPlayPause);
                }
                mobilePlayPause.remove();
                const updateDesktopIcon = () => {
                    const btn = document.querySelector('.player-controls .play-pause-button');
                    if (!btn) return;
                    const i = btn.querySelector('i');
                    if (audioPlayer.paused || !audioPlayer.src) {
                        i.classList.remove('fa-pause');
                        i.classList.add('fa-play');
                    } else {
                        i.classList.remove('fa-play');
                        i.classList.add('fa-pause');
                    }
                };
                audioPlayer.addEventListener('play', updateDesktopIcon);
                audioPlayer.addEventListener('pause', updateDesktopIcon);
                updateDesktopIcon();
            }
        }
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        adaptMobilePlayer();
        // Дополнительно: при переходе на мобильную ширину рендерится очередь
        if (window.innerWidth <= 1024) {
            renderExpandedQueue();
        }
    });
    adaptMobilePlayer();

    // Открытие расширенного плеера по клику на основную область плеера (только мобильные)
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
            if (window.innerWidth > 1024) return;
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

    // Мобильная очередь на весь экран
    const mobileQueueToggle = document.getElementById('mobile-queue-toggle');
    if (mobileQueueToggle) {
        mobileQueueToggle.addEventListener('click', () => {
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
            currentPlaylist.forEach((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                const item = document.createElement('div');
                item.className = `queue-item ${isCurrent ? 'current' : ''}`;
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; width:100%;">
                        <span style="opacity:0.5; width:20px;">${idx + 1}</span>
                        <div style="flex-grow:1; overflow:hidden;">
                            <div style="font-weight:500;">${escapeHtml(track.title)}</div>
                            <div style="font-size:11px; opacity:0.6;">${escapeHtml(track.artist)}</div>
                        </div>
                        ${isCurrent ? '<i class="fas fa-volume-up" style="color:#a855f7"></i>' : ''}
                    </div>
                `;
                item.addEventListener('click', () => {
                    currentTrackIndex = idx;
                    playTrack(currentTrackIndex);
                    overlay.remove();
                });
                queueList.appendChild(item);
            });
            overlay.querySelector('.mobile-queue-close').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
        });
    }
});