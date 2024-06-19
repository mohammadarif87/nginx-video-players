//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
player.load('https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd');

// Event listener for tracks changed
player.addEventListener('trackschanged', logTracks);

// Function to log available audio and text tracks
function logTracks() {
    var audioTracks = player.getVariantTracks();
    console.log('Audio Tracks:', audioTracks);

    var textTracks = player.getTextTracks();
    console.log('Text Tracks:', textTracks);
}

function switchAudio(lang) {
    var tracks = player.getVariantTracks();
    var selectedTrack = tracks.find(track => track.language === lang);
        if (selectedTrack) {
            player.selectAudioLanguage(lang);
            console.log('Switched to audio track language:', lang);
        } else {
            console.log('Audio track not found for language:', lang);
        }
}

function switchText(lang) {
    if (lang === 'off') {
        player.setTextTrackVisibility(false);
        console.log('Text tracks turned off');
    } else {
        var tracks = player.getTextTracks();
        var selectedTrack = tracks.find(track => track.language === lang);
        if (selectedTrack) {
            player.selectTextLanguage(lang);
            player.setTextTrackVisibility(true);
            console.log('Switched to text track language:', lang);
        } else {
            console.log('Text track not found for language:', lang);
        }
    }
}
