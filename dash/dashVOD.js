// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../reference/demux/matrixDashVOD/dashStream.mpd', true);
//player.initialize(document.getElementById('video'), '../reference/matrix.mp4', true);