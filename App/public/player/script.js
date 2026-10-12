const video = document.getElementById('player');
const videoContainer = document.getElementById('video-container');
const playBtn = document.getElementById('play-btn');
const seekBar = document.getElementById('seek-bar');
const timeDisplay = document.getElementById('time-display');
const fsBtn = document.getElementById('fs-btn');
const qualityBtn = document.getElementById('quality-btn');
const qualityMenu = document.getElementById('quality-menu');
const qualityOptions = document.querySelectorAll('.q-btn');

const videoFileName = sessionStorage.getItem('selectedVideo') || "default_trailer.mp4";
let currentQuality = 1080;


loadVideo(currentQuality, 0, true);

function loadVideo(quality, startTime = 0, autoPlay = false) {
    currentQuality = quality;
    const videoName = sessionStorage.getItem("selectedVideo") || "default";
    if (startTime > 0) {
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = Math.min(startTime, video.duration);
        }, { once: true });
    }
    video.src = `http://localhost:8080/stream/${quality}p/${videoName}`;

    if (autoPlay) {
        video.play();
        playBtn.textContent = "⏸";
    }

    updateActiveButton(quality);
}

function switch_quality(quality) {
    if (quality === currentQuality) return;
    const currentTime = video.currentTime;
    const isPlaying = !video.paused;

    loadVideo(quality, currentTime, isPlaying);
}

function updateActiveButton(quality) {
    qualityOptions.forEach(btn => {
        const isActive = Number(btn.dataset.quality) === quality;
        if (isActive) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        btn.setAttribute('aria-pressed', String(isActive));
    });
}

qualityBtn.addEventListener('click', () => {
    const isOpen = qualityBtn.getAttribute('aria-expanded') === 'true';
    qualityMenu.hidden = isOpen;
    qualityBtn.setAttribute('aria-expanded', String(!isOpen));
});

qualityOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        switch_quality(Number(btn.dataset.quality));
        qualityMenu.hidden = true;
        qualityBtn.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('click', event => {
    if (!event.target.closest('.quality-control')) {
        qualityMenu.hidden = true;
        qualityBtn.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !qualityMenu.hidden) {
        qualityMenu.hidden = true;
        qualityBtn.setAttribute('aria-expanded', 'false');
        qualityBtn.focus();
    }
});


playBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

function togglePlay() {
    if (video.paused) {
        video.play();
        playBtn.textContent = "⏸";
    } else {
        video.pause();
        playBtn.textContent = "▶";
    }
}

video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const progress = (video.currentTime / video.duration) * 100;
    seekBar.value = progress;
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
});

seekBar.addEventListener('input', () => {
    const time = (seekBar.value / 100) * video.duration;
    video.currentTime = time;
});

fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
});

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}