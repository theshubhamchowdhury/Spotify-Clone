console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";
// DOM elements (explicitly select to avoid relying on global id injection)
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

// ------------------ TIME CONVERSION ------------------
function secondsToTime(seconds) {
    if (isNaN(seconds) || seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// ------------------ PREDEFINED SONG LISTS (BASED ON ACTUAL FILES) ------------------
const songDatabase = {
    "Honey_Singh": [
        "One Thousand Miles Desi Kalakaar.mp3"
    ],
    "ncs": [
        "bollywood-indian-hindi-song-music-369483.mp3",
        "bollywood-music-454898 (1).mp3",
        "bollywood-music-454898.mp3",
        "comedy-music-bollywood-kollywood-14284.mp3",
        "free-bollywood-music-454882.mp3",
        "no-copyright-music-bollywood-454888 (1).mp3",
        "no-copyright-music-bollywood-454888.mp3"
    ],
    "cs": [
        "Balenci.mp3",
        "Gaadi 150.mp3",
        "Gede.mp3",
        "Judai Jannat.mp3"
    ],
    "Angry_(mood)": [],
    "Bright_(mood)": [],
    "Chill_(mood)": [],
    "Dark_(mood)": [],
    "Diljit": [],
    "Funky_mood": [],
    "Love_(mood)": [],
    "Uplifting_(mood)": [],
    "karan aujla": []
};

// ------------------ GET SONGS FROM FOLDER ------------------
async function getSongs(folder) {
    currFolder = folder.replace(/^\/?songs\/?/, "");

    // Get songs from predefined database
    songs = songDatabase[currFolder] || [];
    
    console.log(`Loading songs from ${currFolder}:`, songs);

    // render playlist
    const songUL = document.querySelector(".songList ul");
    if (songUL) {
        songUL.innerHTML = "";
        
        if (songs.length === 0) {
            songUL.innerHTML = `
                <li style="text-align: center; padding: 20px; color: #888;">
                    <div>No songs found in ${currFolder}</div>
                    <div style="font-size: 12px; margin-top: 10px;">Add .mp3 files to songs/${currFolder}/ folder</div>
                    <div style="font-size: 12px; margin-top: 5px;">Then update songDatabase in script.js</div>
                </li>
            `;
        } else {
            for (const song of songs) {
                songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replace(/\.[^/.]+$/, "")}</div>
                        <div>Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
            }
        }

        // Attach click to play song
        Array.from(songUL.getElementsByTagName("li")).forEach(li => {
            li.addEventListener("click", () => {
                const infoDiv = li.querySelector(".info div");
                if (infoDiv) {
                    const songName = infoDiv.innerText.trim();
                    // Find the corresponding song file
                    const matchingSong = songs.find(s => s.replace(/\.[^/.]+$/, "") === songName);
                    if (matchingSong) {
                        // Pause current song before playing new one
                        if (!currentSong.paused) {
                            currentSong.pause();
                        }
                        playMusic(matchingSong);
                    }
                }
            });
        });
    }

    return songs;
}



// ------------------ PLAY MUSIC ------------------
function playMusic(track, pause = false) {
    if (!track) {
        console.error("No track provided to playMusic");
        return;
    }

    track = track.replace(/\\/g, "/"); // normalize path separators
    const audioSrc = `./songs/${currFolder}/${encodeURIComponent(track)}`;
    
    console.log("Attempting to play:", audioSrc);
    console.log("Current folder:", currFolder);
    console.log("Track name:", track);

    // First check if the file exists by trying to load it
    const testAudio = new Audio();
    testAudio.src = audioSrc;
    
    testAudio.addEventListener('error', (e) => {
        console.error("Audio file not found or invalid:", audioSrc, e);
        const songInfoEl = document.querySelector(".songinfo");
        if (songInfoEl) {
            songInfoEl.innerText = `❌ File not found: ${track}`;
        }
        alert(`Cannot find audio file: ${track}\n\nPlease check if the file exists in: songs/${currFolder}/`);
    });
    
    testAudio.addEventListener('canplay', () => {
        // File exists and can be played
        currentSong.src = audioSrc;
        currentSong.load();
        
        const songInfoEl = document.querySelector(".songinfo");
        const songTimeEl = document.querySelector(".songtime");
        
        if (songInfoEl) songInfoEl.innerText = track.replace(/\.[^/.]+$/, ""); // remove extension
        if (songTimeEl) songTimeEl.innerText = "00:00 / 00:00";
        
        if (!pause) {
            currentSong.play().then(() => {
                // Update play button icon to pause when song starts playing
                if (play) play.src = "img/pause.svg";
            }).catch(err => {
                console.error("Audio play error:", err);
                alert(`Cannot play audio file: ${track}\n\nError: ${err.message}`);
                // Reset play button to play icon on error
                if (play) play.src = "img/play.svg";
            });
        } else {
            // If paused, set play button to play icon
            if (play) play.src = "img/play.svg";
        }
    });
    
    // Trigger the test load
    testAudio.load();
}



// ------------------ DISPLAY ALBUMS ------------------
async function displayAlbums() {
    console.log("Displaying albums");

    try {
        // Try to load from albums.json first
        let albums;
        try {
            let res = await fetch(`./songs/albums.json`);
            if (res.ok) {
                albums = await res.json();
            } else {
                throw new Error("Albums.json not found");
            }
        } catch (error) {
            console.log("Using fallback album list");
            // Fallback album data
            albums = [
                { "folder": "Honey_Singh", "title": "Yo Yo Honey Singh", "description": "Yo Yo Honey Singh hits" },
                { "folder": "ncs", "title": "Sleep Songs", "description": "Songs for you" },
                { "folder": "cs", "title": "Copyright Songs", "description": "Cover Songs for you" },
                { "folder": "Angry_(mood)", "title": "Angry Mood", "description": "Calm your Anger" },
                { "folder": "Bright_(mood)", "title": "Bright Songs", "description": "Bright Songs for you" },
                { "folder": "Chill_(mood)", "title": "Just Chill", "description": "Yes, Just Chill" },
                { "folder": "Dark_(mood)", "title": "Dark Horse", "description": "Dark Songs for you" },
                { "folder": "Diljit", "title": "Diljit Dosanjh", "description": "Diljit Dosanjh hits" },
                { "folder": "Funky_mood", "title": "Go Funky", "description": "Lets go Funky" },
                { "folder": "Love_(mood)", "title": "I Love You", "description": "Love is in the air" },
                { "folder": "Uplifting_(mood)", "title": "Feel Good", "description": "Uplifting songs" },
                { "folder": "karan aujla", "title": "Karan Aujla", "description": "Karan Aujla hits" }
            ];
        }

        const cardContainer = document.querySelector(".cardContainer");
        if (!cardContainer) {
            console.error("Card container not found");
            return;
        }
        
        cardContainer.innerHTML = "";

        albums.forEach(album => {
            cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                    </svg>
                </div>
                <img src="./songs/${album.folder}/cover.jpg" alt="${album.title}" onerror="this.src='./img/placeholder.jpg'; this.onerror=null;">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
        });

        // Album click → load songs
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folderName = card.dataset.folder;
                if (folderName) {
                    // Pause current song before loading new one
                    if (!currentSong.paused) {
                        currentSong.pause();
                    }
                    
                    songs = await getSongs(folderName);
                    if (songs && songs.length > 0) {
                        playMusic(songs[0]);
                    } else {
                        console.error("No songs found in folder:", folderName);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error loading albums:", error);
        // Show fallback content or error message
        const cardContainer = document.querySelector(".cardContainer");
        if (cardContainer) {
            cardContainer.innerHTML = `<p style="color: red;">Error loading albums. Please check if albums.json exists.</p>`;
        }
    }
}

// ------------------ MAIN ------------------
async function main() {
    // Load default songs folder
    try {
        await getSongs("Honey_Singh");
        if (songs && songs.length > 0) {
            console.log("Playing first song:", songs[0]);
            playMusic(songs[0], true);
        } else {
            console.warn("No songs found in Honey_Singh folder, trying ncs folder");
            await getSongs("ncs");
            if (songs && songs.length > 0) {
                console.log("Playing first song from ncs:", songs[0]);
                playMusic(songs[0], true);
            } else {
                console.warn("No songs found in any default folder");
                const songInfoEl = document.querySelector(".songinfo");
                if (songInfoEl) {
                    songInfoEl.innerText = "No songs available - Please add music files";
                }
            }
        }
    } catch (error) {
        console.error("Error loading default songs:", error);
    }

    // Display albums
    await displayAlbums();

    // ------------------ PLAY BUTTON ------------------
    if (play) {
        // Handle both direct image clicks and button clicks
        const playButton = play.closest('button') || play;
        playButton.addEventListener("click", () => {
            if (!currentSong.src) {
                console.warn("No song loaded");
                return;
            }

            if (currentSong.paused) {
                currentSong.play().then(() => {
                    if (play) play.src = "img/pause.svg";
                }).catch(err => {
                    console.error("Error playing audio:", err);
                    alert("Cannot play audio. Please check if the file exists and your browser supports the format.");
                });
            } else {
                currentSong.pause();
                if (play) play.src = "img/play.svg";
            }
        });
    }

    // ------------------ TIMEUPDATE ------------------
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            const songTimeEl = document.querySelector(".songtime");
            const circleEl = document.querySelector(".circle");
            
            if (songTimeEl) {
                songTimeEl.innerText = `${secondsToTime(currentSong.currentTime)} / ${secondsToTime(currentSong.duration)}`;
            }
            
            if (circleEl) {
                circleEl.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
            }
        }
    });

    // ------------------ SEEK BAR ------------------
    const seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            const circleEl = document.querySelector(".circle");
            if (circleEl) {
                circleEl.style.left = percent + "%";
            }
            
            if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
                currentSong.currentTime = currentSong.duration * (percent / 100);
            }
        });
    }

    // ------------------ HAMBURGER ------------------
    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close button") || document.querySelector(".close");
    const leftPanel = document.querySelector(".left");
    
    if (hamburger && leftPanel) {
        const hamburgerButton = hamburger.closest('button') || hamburger.parentElement;
        hamburgerButton.addEventListener("click", (e) => {
            e.preventDefault();
            leftPanel.style.left = "0";
        });
    }
    
    if (closeBtn && leftPanel) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            leftPanel.style.left = "-120%";
        });
    }

    // ------------------ PREVIOUS ------------------
    if (previous) {
        const prevButton = previous.closest('button') || previous;
        prevButton.addEventListener("click", () => {
            if (!songs || songs.length === 0) {
                console.warn("No songs available");
                return;
            }
            
            currentSong.pause();
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentFile);
            if (index > 0) {
                playMusic(songs[index - 1]);
            } else {
                // Loop to last song
                playMusic(songs[songs.length - 1]);
            }
        });
    }

    // ------------------ NEXT ------------------
    if (next) {
        const nextButton = next.closest('button') || next;
        nextButton.addEventListener("click", () => {
            if (!songs || songs.length === 0) {
                console.warn("No songs available");
                return;
            }
            
            currentSong.pause();
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentFile);
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                // Loop to first song
                playMusic(songs[0]);
            }
        });
    }

    // ------------------ VOLUME ------------------
    const volumeInput = document.querySelector("#volumeSlider") || document.querySelector(".range input");
    const volImg = document.querySelector(".volume>img");
    
    if (volumeInput) {
        // Set initial volume
        currentSong.volume = volumeInput.value / 100;
        
        volumeInput.addEventListener("input", e => {
            const volume = e.target.value / 100;
            currentSong.volume = volume;
            
            if (volImg) {
                if (volume > 0) {
                    volImg.src = "img/volume.svg";
                    currentSong.muted = false;
                } else {
                    volImg.src = "img/mute.svg";
                }
            }
        });
    }

    // ------------------ MUTE ------------------
    if (volImg) {
        let previousVolume = 0.5; // Store previous volume level
        
        volImg.addEventListener("click", e => {
            if (currentSong.muted || currentSong.volume === 0) {
                // Unmute
                currentSong.muted = false;
                currentSong.volume = previousVolume;
                e.target.src = "img/volume.svg";
                if (volumeInput) volumeInput.value = previousVolume * 100;
            } else {
                // Mute
                previousVolume = currentSong.volume;
                currentSong.volume = 0;
                currentSong.muted = true;
                e.target.src = "img/mute.svg";
                if (volumeInput) volumeInput.value = 0;
            }
        });
    }

    // ------------------ ADDITIONAL AUDIO EVENT HANDLERS ------------------
    // Auto-play next song when current song ends
    currentSong.addEventListener("ended", () => {
        if (songs && songs.length > 0) {
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentFile);
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            } else {
                // Loop back to first song
                playMusic(songs[0]);
            }
        }
    });

    // Handle audio loading errors
    currentSong.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        const songInfoEl = document.querySelector(".songinfo");
        if (songInfoEl) {
            songInfoEl.innerText = "Error loading audio";
        }
        // Reset play button
        if (play) play.src = "img/play.svg";
    });

    // Update play button when song starts playing
    currentSong.addEventListener("play", () => {
        if (play) play.src = "img/pause.svg";
    });

    // Update play button when song is paused
    currentSong.addEventListener("pause", () => {
        if (play) play.src = "img/play.svg";
    });

    // Show loading state
    currentSong.addEventListener("loadstart", () => {
        const songInfoEl = document.querySelector(".songinfo");
        if (songInfoEl && songInfoEl.innerText !== "Error loading audio") {
            songInfoEl.innerText = "Loading...";
        }
    });

    // Update display when audio can play
    currentSong.addEventListener("canplay", () => {
        const songInfoEl = document.querySelector(".songinfo");
        if (songInfoEl && songInfoEl.innerText === "Loading...") {
            const track = currentSong.src.split("/").pop();
            if (track) {
                songInfoEl.innerText = decodeURIComponent(track).replace(/\.[^/.]+$/, "");
            }
        }
    });
}

// ------------------ START ------------------
main();