// GSAP Animation Timeline and Story Controller
class EmotionalStory {
    constructor() {
        this.timeline = gsap.timeline({ paused: true });
        this.audioContext = null;
        this.backgroundMusic = document.getElementById('background-music');
        this.isPlaying = false;
        this.currentScene = 0;
        this.scenes = [
            'intro',
            'zoom',
            'family',
            'war',
            'friend',
            'love',
            'loss',
            'hope'
        ];
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupControls();
        this.createStoryTimeline();
        this.hideLoading();
    }
    
    setupAudio() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        const volumeSlider = document.getElementById('volume-slider');
        
        // Audio controls
        playPauseBtn.addEventListener('click', () => this.toggleAudio());
        restartBtn.addEventListener('click', () => this.restartAudio());
        volumeSlider.addEventListener('input', (e) => {
            this.backgroundMusic.volume = e.target.value;
        });
        
        // Set initial volume
        this.backgroundMusic.volume = 0.5;
    }
    
    setupControls() {
        const startBtn = document.getElementById('start-story-btn');
        const restartStoryBtn = document.getElementById('restart-story-btn');
        
        startBtn.addEventListener('click', () => this.startStory());
        restartStoryBtn.addEventListener('click', () => this.restartStory());
    }
    
    createStoryTimeline() {
        const tl = this.timeline;
        
        // Scene 1: Introduction - Boy alone in center
        tl.set('#boy', { x: 0, y: 0, scale: 1, opacity: 1 })
          .set(['#father', '#mother', '#friend', '#loved-one'], { opacity: 0 })
          .set('#final-message', { opacity: 0 })
          .set('.light-beam', { opacity: 0 })
          .set('.war-overlay', { opacity: 0 })
          .set('.tears', { opacity: 0 });
        
        // Scene 2: Camera zoom in on boy
        tl.to('#boy', {
            scale: 1.5,
            duration: 2,
            ease: "power2.inOut"
        }, "+=1");
        
        // Scene 3: Family members enter from sides
        tl.set('#father', { x: -300, y: 0, opacity: 1 })
          .set('#mother', { x: 300, y: 0, opacity: 1 })
          .to('#father', {
              x: -80,
              duration: 1.5,
              ease: "power2.out"
          }, "+=0.5")
          .to('#mother', {
              x: 80,
              duration: 1.5,
              ease: "power2.out"
          }, "-=1.5")
          .to('#boy', {
              scale: 1.2,
              duration: 0.8,
              ease: "power2.inOut"
          }, "-=0.8");
        
        // Scene 4: War - scene turns gray
        tl.to('.war-overlay', {
            opacity: 0.7,
            duration: 1.5,
            ease: "power2.inOut"
        }, "+=1")
          .to(['#father', '#mother'], {
              opacity: 0,
              x: (index) => index === 0 ? -300 : 300,
              duration: 1,
              ease: "power2.in"
          }, "-=0.5")
          .to('#boy', {
              scale: 1,
              duration: 1,
              ease: "power2.out"
          }, "-=0.5");
        
        // Scene 5: Friend enters from bottom
        tl.set('#friend', { y: 200, opacity: 1 })
          .to('#friend', {
              y: 100,
              duration: 1.5,
              ease: "power2.out"
          }, "+=0.5")
          .to('#boy', {
              rotation: 10,
              duration: 0.3,
              ease: "power2.inOut",
              yoyo: true,
              repeat: 1
          }, "-=0.5")
          .to('#friend', {
              rotation: -10,
              duration: 0.3,
              ease: "power2.inOut",
              yoyo: true,
              repeat: 1
          }, "-=0.6");
        
        // Scene 6: Loved one enters and hugs
        tl.set('#loved-one', { y: -200, opacity: 1 })
          .to('#loved-one', {
              y: -50,
              duration: 1.5,
              ease: "power2.out"
          }, "+=0.5")
          .to('#boy', {
              scale: 1.1,
              duration: 0.8,
              ease: "power2.inOut"
          }, "-=0.8")
          .to('.war-overlay', {
              opacity: 0.3,
              duration: 1,
              ease: "power2.out"
          }, "-=1");
        
        // Scene 7: Everyone disappears, boy alone and crying
        tl.to(['#friend', '#loved-one'], {
            opacity: 0,
            y: (index) => index === 0 ? 200 : -200,
            duration: 1,
            ease: "power2.in"
        }, "+=1")
          .to('.war-overlay', {
              opacity: 0.9,
              duration: 1,
              ease: "power2.inOut"
          }, "-=0.5")
          .to('#boy', {
              scale: 0.8,
              y: 20,
              duration: 1,
              ease: "power2.out"
          }, "-=0.5")
          .to('.tears', {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out"
          }, "-=0.3");
        
        // Scene 8: Light shines down, hope message appears
        tl.to('.light-beam', {
            opacity: 0.8,
            duration: 2,
            ease: "power2.out"
        }, "+=1")
          .to('.war-overlay', {
              opacity: 0.2,
              duration: 1.5,
              ease: "power2.out"
          }, "-=1.5")
          .to('#boy', {
              scale: 1.2,
              y: 0,
              duration: 1.5,
              ease: "power2.out"
          }, "-=1.5")
          .to('.tears', {
              opacity: 0,
              duration: 1,
              ease: "power2.out"
          }, "-=1")
          .to('#final-message', {
              opacity: 1,
              scale: 1,
              duration: 2,
              ease: "power2.out"
          }, "-=0.5")
          .to('#final-message h1', {
              text: "Hope Never Dies",
              duration: 2,
              ease: "power2.out"
          }, "-=2");
    }
    
    startStory() {
        this.currentScene = 0;
        this.timeline.play();
        this.playAudio();
        
        // Hide start button temporarily
        document.getElementById('start-story-btn').style.opacity = '0.5';
        document.getElementById('start-story-btn').disabled = true;
        
        // Re-enable after story completes
        setTimeout(() => {
            document.getElementById('start-story-btn').style.opacity = '1';
            document.getElementById('start-story-btn').disabled = false;
        }, this.timeline.duration() * 1000);
    }
    
    restartStory() {
        this.timeline.restart();
        this.restartAudio();
        this.currentScene = 0;
    }
    
    toggleAudio() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }
    
    playAudio() {
        this.backgroundMusic.play()
            .then(() => {
                this.isPlaying = true;
                document.getElementById('play-pause-btn').textContent = '⏸️';
            })
            .catch(err => {
                console.log('Audio play failed:', err);
            });
    }
    
    pauseAudio() {
        this.backgroundMusic.pause();
        this.isPlaying = false;
        document.getElementById('play-pause-btn').textContent = '▶️';
    }
    
    restartAudio() {
        this.backgroundMusic.currentTime = 0;
        this.playAudio();
    }
    
    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
}

// Initialize the story when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to load
    if (typeof gsap !== 'undefined') {
        new EmotionalStory();
    } else {
        console.error('GSAP library not loaded');
    }
});

// Additional utility functions for enhanced interactivity
function addParticleEffect(element) {
    // Simple particle effect for emotional moments
    const particles = document.createElement('div');
    particles.className = 'particles';
    particles.style.position = 'absolute';
    particles.style.top = '0';
    particles.style.left = '0';
    particles.style.width = '100%';
    particles.style.height = '100%';
    particles.style.pointerEvents = 'none';
    particles.style.zIndex = '5';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particles.appendChild(particle);
        
        // Animate particle
        gsap.to(particle, {
            y: -50,
            opacity: 0,
            duration: 2,
            delay: Math.random() * 2,
            ease: "power2.out"
        });
    }
    
    element.appendChild(particles);
    
    // Remove particles after animation
    setTimeout(() => {
        particles.remove();
    }, 4000);
}

// Touch/mobile interaction handling
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', (e) => {
        // Add touch feedback
        e.target.style.transform = 'scale(0.95)';
    });
    
    document.addEventListener('touchend', (e) => {
        // Remove touch feedback
        e.target.style.transform = 'scale(1)';
    });
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            document.getElementById('start-story-btn').click();
            break;
        case 'r':
            document.getElementById('restart-story-btn').click();
            break;
        case 'm':
            document.getElementById('play-pause-btn').click();
            break;
    }
});

// Performance optimization
window.addEventListener('resize', debounce(() => {
    // Adjust character positions for different screen sizes
    const stage = document.querySelector('.stage');
    const characters = document.querySelectorAll('.character');
    
    characters.forEach(character => {
        // Recalculate positions based on new screen size
        const rect = stage.getBoundingClientRect();
        // Adjust character positioning logic here if needed
    });
}, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
