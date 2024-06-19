//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
player.load('../DASH_manifest/stream.mpd');