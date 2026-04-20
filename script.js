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
        document.removeEventListener('mousemove', onMouseMove);
    });
};

/* Запускаем для обоих ползунков */
setupSlider('.progress-bar', '.progress-fill', '.progress-handle');
setupSlider('.volume-bar', '.volume-fill', '.volume-handle');