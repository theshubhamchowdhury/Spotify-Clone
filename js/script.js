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

// ------------------ GET SONGS FROM FOLDER ------------------
async function getSongs(folder) {
    // remove any leading /songs/ to prevent duplication
    currFolder = folder.replace(/^\/?songs\/?/, "");

    let res = await fetch(`/songs/${currFolder}/`);
    let text = await res.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");
    songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            let fileName = link.href.split("/").pop(); // get only filename
            fileName = decodeURIComponent(fileName);
            fileName = fileName.replace(/\\/g, "/");  // 🔥 important
            songs.push(fileName);

        }
    }


    // render playlist
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Shubham</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach click to play song
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            const songName = li.querySelector(".info div").innerText.trim().replace(/\\/g, "/").split("/").pop();
            playMusic(songName);
        });
    });

    return songs;
}



// ------------------ PLAY MUSIC ------------------
function playMusic(track, pause = false) {
    if (!track) return;

    track = track.replace(/\\/g, "/"); // remove backslashes

    currentSong.src = `/songs/${currFolder}/${encodeURIComponent(track)}`;
    console.log("Trying to play:", currentSong.src);

    currentSong.load();
    currentSong.play().catch(err => console.error("Audio play error:", err));

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}



// ------------------ DISPLAY ALBUMS ------------------
async function displayAlbums() {
    console.log("Displaying albums");

    let res = await fetch(`/songs/albums.json`);
    let albums = await res.json();

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                </svg>
            </div>
            <img src="/songs/${album.folder}/cover.jpg" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    // Album click → load songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(card.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

// ------------------ MAIN ------------------
async function main() {
    // Load default songs folder
    await getSongs("Honey_Singh");
    playMusic(songs[0], true);

    // Display albums
    await displayAlbums();

    // ------------------ PLAY BUTTON ------------------
    if (play) {
        play.addEventListener("click", () => {
            if (!currentSong.src) return;

            if (currentSong.paused) {
                currentSong.play().then(() => {
                    if (play) play.src = "img/pause.svg";
                }).catch(err => console.error(err));
            } else {
                currentSong.pause();
                if (play) play.src = "img/play.svg";
            }
        });
    }

    // ------------------ TIMEUPDATE ------------------
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            document.querySelector(".songtime").innerText =
                `${secondsToTime(currentSong.currentTime)} / ${secondsToTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // ------------------ SEEK BAR ------------------
    const seekbar = document.querySelector(".seekbar");
    seekbar.addEventListener("click", e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        document.querySelector(".circle").style.left = percent + "%";
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            currentSong.currentTime = currentSong.duration * (percent / 100);
        }
    });

    // ------------------ HAMBURGER ------------------
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // ------------------ PREVIOUS ------------------
    if (previous) {
        previous.addEventListener("click", () => {
            currentSong.pause();
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentFile);
            if (index > 0) playMusic(songs[index - 1]);
        });
    }

    // ------------------ NEXT ------------------
    if (next) {
        next.addEventListener("click", () => {
            currentSong.pause();
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songs.indexOf(currentFile);
            if (index < songs.length - 1) playMusic(songs[index + 1]);
        });
    }

    // ------------------ VOLUME ------------------
    const volumeInput = document.querySelector(".range input");
    const volImg = document.querySelector(".volume>img");
    if (volumeInput) {
        volumeInput.addEventListener("input", e => {
            currentSong.volume = e.target.value / 100;
            if (volImg) {
                if (currentSong.volume > 0)
                    volImg.src = "img/volume.svg";
                else
                    volImg.src = "img/mute.svg";
            }
        });
    }

    // ------------------ MUTE ------------------
    if (volImg) {
        volImg.addEventListener("click", e => {
            if (currentSong.muted) {
                currentSong.muted = false;
                currentSong.volume = 0.5;
                e.target.src = "img/volume.svg";
                if (volumeInput) volumeInput.value = 50;
            } else {
                currentSong.muted = true;
                e.target.src = "img/mute.svg";
                if (volumeInput) volumeInput.value = 0;
            }
        });
    }
}

// ------------------ START ------------------
main();
