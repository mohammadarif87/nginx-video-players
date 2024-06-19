// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../DASH_manifest/stream.mpd', true);