// SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);

loadWithDRM()

function loadWithDRM() {
    // Configure player to use Widevine DRM
    player.configure({
        drm: {
            servers: {
                'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth'
            }
        }
    });
    videoElement.autoplay = true;
    player.load('https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd').then(function() {
        console.log('The video has now been loaded with DRM support!');
    }).catch(function(error) {
        console.error('Error loading video with DRM', error);
    });
}

function loadWithoutDRM() {
    // Disable license requests to simulate no DRM support
    player.configure({
        drm: {
            servers: {}
        }
    });
    videoElement.autoplay = true;
    player.load('https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd').then(function() {
        console.log('The video has now been loaded without DRM support!');
    }).catch(function(error) {
        console.error('Error loading video without DRM', error);
    });
}