var video = document.getElementById('video');
// Check if browser supports HLS and if it needs to create a new HLS instance in this session
if(Hls.isSupported()) {
    console.log("HLS is supported - create new HLS session, load in m3u8 playlist and attach to video HTML element")
    var hls = new Hls();
    hls.loadSource('./output/index.m3u8');
    hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // If HLS is supported by the browser natively i.e. Safari
    // check MIME type (Multipurpose Internet Mail Extensions) for browser against 'application/vnd.apple.mpegurl' (Apple standard)
    // If supported and m3u8 format is correct, load in the file
    video.src = './output/index.m3u8';
}