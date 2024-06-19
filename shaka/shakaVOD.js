//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
// player.load('../reference/matrix.mp4');
player.load('../reference/matrixShakaVOD/matrix_dash.mpd');