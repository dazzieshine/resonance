/* Функция ползунков (для прокрутки трека и громкости) */
const setupSlider = (barSelector, fillSelector, handleSelector) => /* Стрелочная функция:  => обозначает, что будем делать*/
{
    const bar = document.querySelector(barSelector); /* Находим на странице HTML-элемент самой полоски */
    const fill = document.querySelector(fillSelector);
    const handle = document.querySelector(handleSelector);

    let isDragging = false; /* Создаем переменную, которая будет говорить нам, зажат ли ползунок в данный момент */
    let currentPos = 0; /* Будем хранить текущую позицию мышки */

    /* Функция обновляет положение ползунка */
    const updatePosition = () => 
    {
        /* Запускается только если есть движение */
        if (!isDragging) return;
        /* Превращаем позицию мыши в проценты */
        const rect = bar.getBoundingClientRect();
        let p = ((currentPos - rect.left) / rect.width) * 100;
        p = Math.max(0, Math.min(100, p));
        /* Берем координату мышки (currentPos), вычитаем из нее начало полоски (rect.left) */
        /* Делим на общую ширину - получается число от 0 до 1. Умножаем на 100 
        /* Получается процент, на который нужно сдвинуть ползунок */

        /* Двигаем ползунок */
        fill.style.width = p + '%';
        handle.style.left = p + '%';
        /* Как только бразуер готов, он запустит эту функцию снова, и так будет продолжаться, пока мы не отпустим мышку */
        requestAnimationFrame(updatePosition);
    };

    /* Когда мышка двигается, мы не двигаем ползунок, а просто запоминаем её позицию */
    const onMouseMove = (e) => 
    {
        currentPos = e.clientX;
    };

    /* Когда мышка нажата */
    bar.onmousedown = (e) => 
    {
        isDragging = true;
        bar.classList.add('active');
        currentPos = e.clientX;
        /* Запускается цикл плавной анимации */
        requestAnimationFrame(updatePosition);
        /* Включаем слежку за движением мышки */
        document.addEventListener('mousemove', onMouseMove);
    };

    /* Подключаем слежку отпускания мышки */
    document.addEventListener('mouseup', () => 
    {
        isDragging = false;
        /* Убираем слежку */
        document.querySelectorAll('.progress-bar, .volume-bar').forEach(b => b.classList.remove('active'));
        document.removeEventListener('mousemove', onMouseMove);
    });
};

/* Запускаем для обоих ползунков */
setupSlider('.progress-bar', '.progress-fill', '.progress-handle');
setupSlider('.volume-bar', '.volume-fill', '.volume-handle');

/* Функция для кнопки "Play" */
const playPauseBtn = document.querySelector('.play-pause-button');
const playPauseIcon = playPauseBtn.querySelector('i');

playPauseBtn.addEventListener('click', () => 
{
    /* Переключаем между иконками play и pause */
    if (playPauseIcon.classList.contains('fa-pause')) {
        playPauseIcon.classList.replace('fa-pause', 'fa-play');
        playPauseBtn.title = "Воспроизвести";
    } else {
        playPauseIcon.classList.replace('fa-play', 'fa-pause');
        playPauseBtn.title = "Пауза";
    }
});

/* Функция для кнопки "Лайк" */
const likeBtn = document.querySelector('.like-button');
const likeIcon = likeBtn.querySelector('i');

likeBtn.addEventListener('click', () => 
    {
    likeBtn.classList.toggle('liked');
    if (likeIcon.classList.contains('fa-regular')) {
        likeIcon.classList.replace('fa-regular', 'fa-solid');
    } else {
        likeIcon.classList.replace('fa-solid', 'fa-regular');
    }
});

/* Функция для кнопки "Громкость" */
const volumeBtn = document.querySelector('.volume-button');
const volumeIcon = volumeBtn.querySelector('i');
const volumeFill = document.querySelector('.volume-fill');
const volumeHandle = document.querySelector('.volume-handle');

let lastVolume = 70; /* Запоминаем громкость в процентах */
let isMuted = false;

volumeBtn.addEventListener('click', () => {
    if (!isMuted) {
        // Включаем беззвучный режим
        lastVolume = parseInt(volumeFill.style.width) || 70; /* Сохраняем текущую громкость */
        
        volumeFill.style.width = '0%';
        volumeHandle.style.left = '0%';
        
        volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
        isMuted = true;
    } else {
        // Возвращаем звук
        volumeFill.style.width = lastVolume + '%';
        volumeHandle.style.left = lastVolume + '%';
        
        volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
        isMuted = false;
    }
});