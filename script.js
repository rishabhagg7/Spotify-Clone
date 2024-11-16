let currFolder;
let songs;
let currentSong = new Audio();

async function displayAlbums() {
    // fetching response
    const response = await fetch(`songs/`);

    // converting response to text
    const responseText = await response.text();

    // creating div for fetching link tags from response text
    const div = document.createElement('div');
    div.innerHTML = responseText;

    // getting all links
    const linkTags = div.querySelectorAll('a');

    // filtering all album links
    const albumNames = Array.from(linkTags).map((linkTags) => linkTags.href).filter((link) => link.includes('/songs/')).map((link) => link.split('/songs/')[1]);

    // fetching meta data and display cards 
    for (let index = 0; index < albumNames.length; index++) {
        const albumName = albumNames[index];
        const metaInfoResponse = await fetch(`songs/${albumName}/info.json`);
        const metaInfoResponseText = await metaInfoResponse.json();
        const cardContainer = document.querySelector('.card-container');
        cardContainer.innerHTML = cardContainer.innerHTML +
            `
            <div class="card" data-folder="${albumName}">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <img src="songs/${albumName}/cover.jpeg" alt="">
                <h2>${metaInfoResponseText["title"]}</h2>
                <p>${metaInfoResponseText["description"]}</p>
            </div>
        `;
    }

    // load the playlist when card is clicked
    document.querySelectorAll('.card').forEach((card) => {
        card.addEventListener("click", async (e) => {
            await getSongs(`songs/${e.currentTarget.dataset.folder}`);
        })
    })
}

async function getSongs(folder) {
    // updating the folder
    currFolder = folder

    // fetching response
    const response = await fetch(`${currFolder}/`);

    // converting response to text
    const responseText = await response.text();

    // creating div for fetching link tags from response text
    const div = document.createElement('div');
    div.innerHTML = responseText;

    // getting all links
    const linkTags = div.querySelectorAll('a');

    // filtering all song links
    const songLinks = Array.from(linkTags).filter((a) => a.href.endsWith('.mp4')).map((a) => a.href)

    // update songs
    songs = songLinks;

    // getting song names from links
    const songNames = songs.map((song) => song.split(`/${currFolder}/`)[1].replaceAll('%20', ' ').replace('.mp4', '').replaceAll('%22', '\''));

    // songs will be added to list
    const songUL = document.querySelector('.song-list').getElementsByTagName('ul')[0];

    // Clear the previous list of songs
    songUL.innerHTML = '';

    for (const song of songNames) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img src="assets/music.svg" class="invert" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Diljit Dosanjh</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img src="assets/play.svg" class="invert" alt="">
            </div>
        </li>`;
    }

    // attach an event listener to every song
    Array.from(document.querySelector(".song-list").getElementsByTagName('li')).forEach(li => {
        li.addEventListener("click", e => {
            let musicName = li.querySelector('.info').firstElementChild.innerHTML;
            musicName = musicName.replaceAll(' ', '%20').replaceAll('\'', '%22');
            playMusic(musicName);
        })
    })

    // load the first song
    playMusic(songs[0].split(`/${currFolder}/`)[1].replaceAll('%20', ' ').replace('.mp4', ''),true);
}

function playMusic(musicName, pause = false) {
    // update song info in playbar
    document.querySelector('.song-info').innerHTML = `<span>${musicName.replaceAll('%20', ' ').replaceAll('%22', '\'')}</span>`;

    let musicFileName = musicName + '.mp4';
    let file = `${currFolder}/${musicFileName}`
    currentSong.src = file;
    if(pause === false){
        currentSong.play();
        // update play button
        play.src = 'assets/pause.svg';
    }

    // update song duration
    document.querySelector('.song-time').innerHTML = '00:00/00:00';
}

function formatTime(seconds) {
    if (isNaN(seconds)) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

async function main() {
    // display all albums
    await displayAlbums();

    // attack an event list to prev, play and next button    
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = 'assets/pause.svg';
        } else {
            currentSong.pause();
            play.src = 'assets/play.svg';
        }
    })

    prev.addEventListener("click", () => {
        if (currentSong.src.length > 0) {
            let index = songs.indexOf(currentSong.src);
            if (index > 0) {
                let song = songs[index - 1].split(`/${currFolder}/`)[1].replaceAll('%20', ' ').replace('.mp4', '');
                playMusic(song)
            }
        }
    })

    next.addEventListener("click", () => {
        if (currentSong.src.length > 0) {
            let index = songs.indexOf(currentSong.src);
            if (index < songs.length - 1) {
                let song = songs[index + 1].split(`/${currFolder}/`)[1].replaceAll('%20', ' ').replace('.mp4', '');
                playMusic(song)
            }
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // update play on song completion
        if (currentSong.currentTime === currentSong.duration) {
            play.src = 'assets/play.svg';
        }
        document.querySelector('.song-time').innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    })

    // add an event listener to seek bar
    document.querySelector('.seek-bar').addEventListener("click", (e) => {
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })

    // add an event listener on hamburger
    document.querySelector('.hamburger').addEventListener("click", () => {
        document.querySelector('.left').style.left = '0%';
    })

    // add an event listener on close
    document.querySelector('.close').addEventListener("click", () => {
        document.querySelector('.left').style.left = '-100%';
    })

    // add an event listener to key controls 
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if (currentSong.paused) {
                currentSong.play();
                play.src = 'assets/pause.svg';
            } else {
                currentSong.pause();
                play.src = 'assets/play.svg';
            }
        }

        if (e.code === 'ArrowRight') {
            currentSong.currentTime = Math.min(currentSong.currentTime + 10, currentSong.duration);
        }

        if (e.code === 'ArrowLeft') {
            currentSong.currentTime = Math.max(currentSong.currentTime - 10, 0);
        }
    });

    // add an event listener on volume bar
    let volumeBar = document.querySelector('.volume-bar');
    volumeBar.addEventListener('change', (e) => {
        let value = e.target.value;
        volumeBar.style.background = `linear-gradient(to right, #FED97E ${value}%, #ddd ${value}%)`;
        currentSong.volume = parseInt(value) / 100;
        if (value === '0') {
            document.querySelector('.volume').src = 'assets/mute.svg';
        } else {
            document.querySelector('.volume').src = 'assets/volume.svg';
        }
    })

    // add an event listener on volume 
    document.querySelector('.volume').addEventListener("click",()=>{
        if(volumeBar.value > 0){
            volumeBar.value = 0;
        }else{
            volumeBar.value = 50;
        }

        volumeBar.style.background = `linear-gradient(to right, #FED97E ${volumeBar.value}%, #ddd ${volumeBar.value}%)`;
        currentSong.volume = parseInt(volumeBar.value) / 100;
        if (volumeBar.value === '0') {
            document.querySelector('.volume').src = 'assets/mute.svg';
        } else {
            document.querySelector('.volume').src = 'assets/volume.svg';
        }
    })
}

main()