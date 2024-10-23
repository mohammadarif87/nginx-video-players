# nginx-video-players
A web app to test different open source players (DASH, Shaka and HLS) created using nginx. Supports Live streaming from OBS, Adaptive Bit Rate testing (ABR) and content with multiple audio/subtitle tracks

# 1. Setting up nginx
## What is nginx?

**NGINX** is open-source software for **web serving**, reverse proxying, caching, load balancing, **media streaming**, and more. It started as a web server designed for maximum performance and stability whilst being lightweight on resources.

## Install nginx

We need to install nginx with the rtmp module that supports rtmp streaming. Type in the following in Terminal:

```bash
brew tap denji/nginx
brew install nginx-full --with-rtmp-module
```

## Start nginx locally

Run the following command to start nginx

```bash
sudo nginx
```

It will look like nothing has happened but the server is now running

To stop nginx

```bash
sudo nginx -s stop
```

## Configure nginx

Navigate to nginx homebrew folder

```bash
cd /opt/homebrew/etc/nginx/
```

or try the command below if the previous one doesn't work

```jsx
cd /usr/local/etc/nginx/
```

<aside>
💡 If you’re struggling to find nginx.conf type the following in Terminal to search for the location:

`sudo nginx -t` will check the syntax. It should also list where your file is

OR

`sudo find / -name "nginx.conf”`
You’re looking for the one in nginx folder related to brew

</aside>

There should be a `nginx.conf` file in here. Type `ls` to see what’s in the folder.

Open this file in VSCode. You can type `code nginx.conf` in Terminal to open the current folder in VSCode.

```jsx
code nginx.conf
```

In your nginx.conf file, add the following rtmp server block at the bottom:

```bash
rtmp {
    server {
        listen 1935;
        application live {
            live on;
        }
    }
}
```

## Other commands for nginx

```bash
// Check the config syntax is written correctly
sudo nginx -t
```

```bash
// Reload the nginx server, good to use if you're
// making changes on the fly and saves having to stop and start the server
sudo nginx -s reload
```

```bash
// Stop nginx
sudo nginx -s stop
```

<aside>
⚠️ If nginx is running and you are struggling to stop it and seeing some errors try running
`sudo lsof -i :80` or `sudo lsof -i | grep nginx`

This will list a 4 or 5 digit PID number. Run the command `kill -9 <pid>` to manually terminate the service

</aside>

# 2. Setting up OBS
## Install OBS

OBS can be downloaded from: https://obsproject.com/

## Setting up Stream settings:

Open  OBS > access the **Preferences** **menu** from the Top menu bar. 

Change Video settings to 1280x720. You can have it higher like 1920x1080 but for now, to save on bandwidth, stick to 720p

![Screenshot 2024-10-23 at 16 26 00](https://github.com/user-attachments/assets/4500cb47-fccb-4daf-8c8a-5789bddce925)

Navigate to Stream menu on the side

Set the Service to Custom and enter your Server name as:

`rtmp://localhost/live`

and the Stream Key as:

```jsx
stream
```

Press Ok to save.

![Screenshot 2024-10-23 at 16 26 32](https://github.com/user-attachments/assets/ee4525a3-bb5b-4923-9adb-4377071dadda)

In our nginx config, we named the application live hence why we’re referencing our server as [localhost/live](http://localhost/live) - if you’ve renamed your application in your config, please ensure the name matches up here

# 3. View your RTMP stream on VLC
## Install VLC Player

VLC Player can be downloaded from: https://www.videolan.org/

## Start the stream in OBS

Reload your nginx server and ensure your nginx config is in the correct syntax

```bash
sudo nginx -s reload
```

```bash
sudo nginx -t
```

This will tell you if there’s any errors in the conf file

In OBS, add something to the Scene like your camera or device input and select Start Streaming in the bottom right

![Screenshot 2024-10-23 at 16 28 15](https://github.com/user-attachments/assets/ee162143-58b2-4b5d-9489-9d88ba95658d)

At the bottom of the window, you should see it has connected and is outputting.

## View the stream via VLC

Open VLC and select File > Open Network

![Screenshot 2024-10-23 at 16 28 36](https://github.com/user-attachments/assets/c6a712fc-b5f5-44c5-9c2c-0ca2bbfa1c83)

Enter the URL as your rtmp server stream i.e. ``rtmp://172.16.101.86/live/stream then select Open

![Screenshot 2024-10-23 at 16 28 56](https://github.com/user-attachments/assets/506aed8d-d8c8-441d-ae2c-69d1ec8cb791)

From the VLC Media Player Playlist, double click the newly added URL and you should see a new player window showing your live stream

![Screenshot 2024-10-23 at 16 29 11](https://github.com/user-attachments/assets/b78fd963-0bbb-4a06-a671-eb2c40744146)

# 4. Transmux live stream to player format
## Intro

So if we want to view the stream in a browser, there’s a couple of things we’ll need to set up starting with transmux of the rtmp stream into a format the open source players like Dash/Shaka can support:

Transmuxing is the process of changing the delivery format for video and audio without encoding or transcoding the original content

## Update conf

nginx does support this for dash player. We need to update our config to include some more information on how to transmux the rtmp stream.

Next let’s ***update and replace*** your rtmp block with the following to your config

```bash
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            **dash on;
            dash_path /path/to/your/nginx_project/DASH_manifest;
            dash_fragment 3s;
            dash_playlist_length 60s;**
        }
    }
}
```

- `dash on;` enables streaming for the `live` application.
- `dash_path` specifies the directory where the manifest and segment files will be saved.
- `dash_fragment` sets the duration of each segment in seconds.
- `dash_playlist_length` sets the duration of the manifest playlist.

## Testing the config

Stop the OBS stream.

Run the command `sudo nginx -t` to check the syntax for your config is correct

Run the command `sudo nginx -s reload` to restart the nginx server

Start the streaming on OBS

In your dash_path, you should start to see files being generated, m4a, m4v, raw an init and your manifest .mpd file

![Screenshot 2024-10-23 at 17 00 11](https://github.com/user-attachments/assets/c5cda554-105c-4bb5-9e07-901f0960b6cc)

<aside>
⚠️ If you’re not seeing the files being generated in the folder, double check the folder permissions `ls -ld` and try stopping nginx, stop the stream on OBS, then start nginx again and then the stream on OBS.

If OBS is struggling to connect to the stream after you added `dash` parameters to your rtmp block, try commenting out `dash_path` then try connecting to the stream. If it connects, it means nginx is struggling to write to the selected path.

Check your root folder has correct permissions for `everyone`. Right click on /Users/<username>/ and select Get Info and any other folders above your nginx_project folder. Open the Sharing & Permissions section at the bottom.

For some people, `everyone` is set to `No Access` which blocks nginx/OBS from reaching your nginx_project folder - change this to `Read only` - you might need to press the padlock to allow you to change this setting. Also ensure your user is added to the list so you can view the files being output during the stream

![Screenshot 2024-10-23 at 17 00 45](https://github.com/user-attachments/assets/ac74dc6f-04e3-412b-95d3-419048bd2280)

</aside>

# 5. Create an nginx web server
## Intro

We need a web server to begin access of our files from a browser with a player. Nginx has the capability of creating a local web server.

## Adjust config to include server

In your nginx.conf file, add the following server object within the `http` object. This should be under the line `include servers/*;`

```bash
server {
        listen 80;
        server_name <yourlocalip>;

        location /app {
            alias /your/manifest/folder;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
            expires off;
            autoindex on;
		    }
}
```

Here’s a breakdown of each line:

- `server` - object created
- `listen` - define a local port for this server
- `server_name` - replace your.local.ip with your ip address i.e. `server_name 192.168.8.147;`
- `location /app` - this is the web server starting location. I’ve named it /app here but you can name this whatever you want. You can leave it empty as just a / but I’ve noticed some odd issues if you do this
- `alias` - reference which folder you’re linking the web server to. In this case we’ll point it to the location where your web app is going to be i.e. `/Users/mohammadarif/Projects/nginx_project`
- `add_header Cache-Control no-cache;` - ensures there is no caching of the web server (so we’re not seeing saved data and what we are seeing is live data coming through)
- `add_header Access-Control-Allow-Origin *;` - ensures there’s no issues related to CORS (Cross-Origin Resource Sharing) when viewing content
- `expires off;` - no expiry for the server so it remains active unless closed manually
- `autoindex on;` - if there is no index.html file in the folder, an index of the page will load up showing what’s in the folder

## Testing the web server is on

With all this now set in your nginx.conf, let’s see if we can see the web server in your browser

Run `sudo nginx -t` to ensure your syntax is all correct

Run `sudo nginx -s reload` to restart the nginx server or `sudo nginx` to start it

Open up a new browser and navigate to `your.ip.address` i.e. 192.168.8.147 - you should see a Welcome to nginx! message

![Screenshot 2024-10-23 at 17 02 18](https://github.com/user-attachments/assets/5d20e8ae-b3c0-4e46-a4c4-8b839838f466)

Navigate to your location i.e. /app - you should see an index of the folder contents displayed

![Screenshot 2024-10-23 at 17 02 37](https://github.com/user-attachments/assets/aa6df757-2b5c-4ecd-99d0-8d42be4d62de)

# 6. Creating a web app (1)
So the backend web server is pretty much set up with our live stream. We will come back to it for VOD content later. Let’s create a simple web page to view the content

## Creating HTML, CSS and JS files

In the location path where your nginx web server is pointing, let’s create the following three files:

- index.html
- index.css
- index.js

You can say these are the basic backbones of a simple web page.

- HTML for the browser to interpret what should be displayed on the page
- CSS for the browser to interpret how the information should be styled to appear on the page
- JS for the basic JavaScript functionality within the page

Add the following in the HTML which is a basic structure of a HTML file:

```bash
<!DOCTYPE html>
<html>
<head>
		
</head>
<body>
		
</body>
</html>
```

- `<!DOCTYPE html>` - Declare this is a HTML document
- `<html></html>` - container required for HTML doc
- `<head></head>` within html - contains information for the browser to interpret
- `<body></body>` within html - contains information for what is displayed

## Fleshing out the HTML file

Let’s reference our css file so the browser understands how to style the page.

Add the following inside the <head> container

```bash
<link rel="stylesheet" type="text/css" href="./index.css" />
<title>Video Player</title> 
```

This will tell the browser to reference your index.css for it’s stylesheet and the page title will be Video Player (feel free to adjust this if you like)

In your <body> section, it’s good to get used to adding <div> containers. These div containers are like tables allowing information to be displayed with some structure. You can later reference certain styles to specific div containers

Let’s start with adding a header text to the page. In <body> add the following:

```bash
<div>
    <h1>Video Player</h1>
</div>
```

Open your index.html page in a browser and you should now see a header text stating Video Player

## Fleshing out the CSS file

So we have some text on the page but it doesn’t look that great. Open your index.css file and add the following:

```bash
h1 {
    color: black;
    text-align: center;
    padding: 32px;
}
```

This is telling the browser that anything in the HTML that contains the container h1 will now have these properties assigned to it - feel free to experiment with these settings like color.

Refresh your index.html and you should see the page updated to reflect your style changes

Add the following to your index.css as well:

```bash
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: sans-serif;
    background-color: aliceblue;
}
```

The asterisk * means this is applied throughout the page by default. In the above example we’ve added some things like defining the `font-family` to use on this page and the `background-color` to use. Feel free to experiment with whatever is to your liking

## Add buttons to HTML

Add 5 button elements to your HTML. This will be for the following:

- Dash Player LIVE button
- Shaka Player LIVE button
- HLS VOD button
- Dash Player VOD button
- Shaka Player VOD button

To do this, add a new <div> container in <body> under the h1 header. This will be your rail and the buttons will act like cards

```html
<div>
    <h3>Test Stream Rail Title</h3>
    <button id="dashLiveButton" onclick="redirectToDashPlayer()">Play Stream DASH</button>
    <button id="shakaLiveButton" onclick="redirectToShakaPlayer()">Play Stream SHAKA</button>
    <button id="hlsVodButton" onclick="redirectToHlsPlayer()">Play Stream HLS</button>
    <button id="dashVodButton" onclick="redirectToDashVODPlayer()">Play Stream DASH</button>
    <button id="shakaVodButton" onclick="redirectToShakaVODPlayer()">Play Stream SHAKA</button>
</div>
```

We’ve added rail title as a h3 header alongside 5 buttons

Each button we’ve added has a unique id associated to it alongside a function we’re calling onclick.

## Referencing JS in the HTML

We’re calling functions in our HTML but we haven’t linked the script to the HTML.

Within the <body> container, at the end add the following:

```bash
<script type="text/javascript"src="./index.js"></script>
```

This will now allow your HTML file to reference a JavaScript file

Let’s create the functions we mentioned in the index.js file. Add the following to your index.js file:

```bash
function redirectToDashPlayer() {
    //Redirect to the player
    window.location.href = '/app/dash/dashLive.html';
}
function redirectToShakaPlayer() {
    //Redirect to the player
    window.location.href = '/app/shaka/shakaLive.html';
}
function redirectToHlsPlayer() {
    //Redirect to the player
    window.location.href = '/app/hls/hlsVOD.html';
}
function redirectToDashVODPlayer() {
    //Redirect to the player
    window.location.href = '/app/dash/dashVOD.html';
}
function redirectToShakaVODPlayer() {
    //Redirect to the player
    window.location.href = '/app/shaka/shakaVOD.html';
}
```

The functions change the window location and load in another html file.

<aside>
⚠️ We need to create these html files to reference the different pages. I’ve created separate folders for the different players - feel free to create something similar

</aside>

We’ll come back to the contents of these newly created html files

## Updating the buttons via CSS

Your buttons probably look something like the screenshot below. Let’s jazz up our CSS to make these look like a bit more like cards on a rail

![Screenshot 2024-10-23 at 17 05 32](https://github.com/user-attachments/assets/a5ad7541-e54a-4cfd-9334-bc98b3a862cc)

Add the following to your CSS:

```bash
:root {
    --button-width: 256px;
}

button {
    /* Ensure positioning context for absolute positioning */
    position: relative;
    width: var(--button-width);
    height: calc(var(--button-width) / 2);
}
```

We’ve added a variable called —button-width set to 256px. Pixels is probably not the best measurement to use but for our example it should be fine. We’re seeing width of the button to the variable whilst the height will include a calculation to half the width (so it appears as a rectangle rather than a square.

![Screenshot 2024-10-23 at 17 05 11](https://github.com/user-attachments/assets/4352b9b7-a877-4e8a-af15-35c5092110d9)

Let’s make the buttons centre aligned. The buttons themselves look better now so let’s add a new container around this which we can then apply CSS styling to correct the alignment.

Add another <div> container around your current rail and reference a class called `container`

```bash
<div class="container">
    <div>
        <h3>Test Stream Rail Title</h3>
        <button id="dashLiveButton" onclick="redirectToDashPlayer()">Play Stream DASH</button>
        <button id="shakaLiveButton" onclick="redirectToShakaPlayer()">Play Stream SHAKA</button>
        <button id="hlsVodButton" onclick="redirectToHlsPlayer()">Play Stream HLS</button>
        <button id="dashVodButton" onclick="redirectToDashVODPlayer()">Play Stream DASH</button>
        <button id="shakaVodButton" onclick="redirectToShakaVODPlayer()">Play Stream SHAKA</button>
    </div>
</div>
```

And add the `.container` class in your CSS

```bash
.container {
    display: flex;
    justify-content: center;
}
```

`display: flex` is very common and essential. `justify-content: center` will correct the container to be centre aligned

Save everything and refresh your index.html to view the updates

![Screenshot 2024-10-23 at 17 04 34](https://github.com/user-attachments/assets/1cd37751-a6ed-42df-8d12-da6bdacad392)

Let’s add a red LIVE text next to the first two buttons referring to the OBS Live Stream

Add the following block to your css file:

```bash
.live-text {
    position: absolute;
    top: 0;
    left: 0;
    background-color: red;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    /* Ensure it's above the button text */
    z-index: 1;
}
```

This will be the reference we’ll use for the LIVE text. The position will be absolute as we’ll be calling this within the button. The top and left being set to 0 will mean it should display in the top left of the button when called within the button. We’re setting the background to red and the text colour to white whilst adding a bit of padding around the text and setting the font size to 12px. The z-index is probably not needed but good to have to ensure this class appears above the other text.

Now update the first two buttons to include a span line referencing this class. Your buttons in the HTML should look like this:

```html
<button id="dashLiveButton" onclick="redirectToDashPlayer()">Play Stream DASH <span class="live-text">LIVE</span></button>
<button id="shakaLiveButton" onclick="redirectToShakaPlayer()">Play Stream SHAKA <span class="live-text">LIVE</span></button>
```

`<span>` is usually used similar to `<div>` as a container but one of the main differences is that <span> doesn’t create a new line

Save everything and test it works correctly:

![Screenshot 2024-10-23 at 17 04 12](https://github.com/user-attachments/assets/a782ab28-a3e7-4887-bdf1-d84d526311d5)

# 7. Creating a web app (2) - Live playback
In the previous step, we created a few other html files for index.html to refer to in our button functions. These were:

- dashLive.html
- shakaLive.html
- hlsVOD.html
- dashVOD.html
- shakaVOD.html

I’ve separated Dash, Shaka and HLS into separate folders, you can too if you prefer:

![Screenshot 2024-10-23 at 17 07 52](https://github.com/user-attachments/assets/f8dacb3c-8efd-4b54-83dc-c85a683d8a38)

Create a .js file for each of the html files created. We will then flesh out what these html and js files should contain

## Updating dashLive.html

Similar to index.html, we’ll need to include the DOCTYPE html and within the `<html>` container there should be a `<head>` and `<body>` containers

In head we need to:

- Link the index.css styling (in case there’s any styling from there we want to apply here)
- Reference the DASH player

In body we need to:

- Create a `<video>` element - this is what these HTML based players look for
- Link the `dashLive.js` file
- Link the `index.js` file

This is what your dashLive.html should look like in the end:

```bash
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Video Player</title>
        <!-- DASH PLAYER -->
        <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    </head>
    <body>
        <video id="video"></video>
        <script type="text/javascript" src="./dashLive.js"></script>
        <script type="text/javascript" src="../index.js"></script>
    </body>
</html>
```

Notice the location of the files being referenced are from the location of where this dashLive.html file is located i.e. `../index.css` refers to the file being up a folder in the structure whereas `./dashLive.js` refers to the file being in the same location as this dashLive.html file

## Updating dashLive.js

We’ve referenced the file `dashLive.js` in our HTML file. Another approach could be to include the script directly in the HTML file within the script container.

Update your `dashLive.js` file to include the following:

```jsx
// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../DASH_manifest/stream.mpd', true);
```

This script initialises a DASH player and then references the ID ‘video’ which was created in the HTML file earlier

`‘../stream.mpd’` is the location of the manifest file output from OBS relative to the position of this `dashLive.js` file

Refresh your web page and check if the playback is working when navigating to `dashLive.html` page

## Updating shakaLive.html

Same as the dashLive.html file, this will also be the same layout except for referencing shaka player this time and shakaLive.js

Your file should look like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Shaka Player</title>
        <!-- SHAKA PLAYER -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.1.0/shaka-player.compiled.js"></script>
    </head>
    <body>
        <video id="video"></video>
        <script type="text/javascript"src="./shakaLive.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

## Updating shakaLive.js

Similar to dashLive.js, we will need create a variable to initialise the player based on the HTML video element and load in the manifest file for playback.

Add the following to the file

```jsx
//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
player.load('../DASH_manifest/stream.mpd');
```

NOTE: We are also adding an autoplay boolean set to true so playback commences automatically. This is because we don’t have any associated any buttons implemented to start the playback.

# 8. Creating Shaka VOD manifest
## Updating shakaVOD.html

The shakaVOD.html file is the same as shakaLive.html except for the .js file being referenced

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Shaka Player</title>
        <!-- SHAKA PLAYER -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.1.0/shaka-player.compiled.js"></script>
    </head>
    <body>
        <video id="video"></video>
        <script type="text/javascript"src="./shakaVOD.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

Be sure the script is referencing `shakaVOD.js` and not `shakaLive.js`

## Referencing .mp4 file in Shaka Player

In our app, we have a button redirecting to Shaka VOD player. Let’s use an .mp4 file as reference for the player

[matrix.mp4](https://archive.org/details/the-matrix-reloaded-agents-fight-scene-re-sound)

Download the above file and perhaps put it into a folder called ‘reference’

Shaka Player is actually really good at supporting multiple formats. You can load this .mp4 directly into the player and it will work.

Update your `shakaVOD.js` to include the following:

```jsx
//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
player.load('../reference/matrix.mp4');
```

The main difference between `shakaLive.js` and `shakaVOD.js` is what we’re telling the player to load

Refresh your browser page for index.html and navigate to the shakaVOD.html page and enjoy the clip.

## Segmenting the .mp4 file

So that was a little too easy referencing the .mp4 file. Let’s try segmenting and creating a manifest file for the shaka player

Ensure you have installed GPAC Stable build: https://gpac.io/downloads/gpac-nightly-builds/#release-installers - You will now have access to a tool called MP4Box that has segmentation capabilities

GPAC is used ‘for video streaming and next-gen multimedia transcoding, packaging and delivery’

In Terminal, in your **‘reference’** folder, run the following command:

```bash
MP4Box -dash 1000 -frag 1000 -rap -segment-name segment_ matrix.mp4
```

This will magically segment your .mp4 file and create a manifest file to handle the segments

Breaking down this command:

- `MP4Box` - This is the command-line tool provided by GPAC (Multimedia Framework) for working with MP4 files. MP4Box can be used to perform various operations on MP4 files, including multiplexing, demultiplexing, and DASH packaging.
- `dash 1000` - Use DASH (Dynamic Adaptive Streaming over HTTP). The `1000` parameter indicates the segment duration in milliseconds.
- `frag 1000` - Specifies the fragment duration for the DASH segments. The `1000` parameter indicates that each fragment (or chunk) within a segment will have a duration of 1000 milliseconds (1 second). This option is typically used to control the granularity of the DASH segments.
- `rap` - Use Random Access Points (RAPs) as the segmentation points for the DASH stream. RAPs are keyframes or sync samples within the video stream, which allow clients to seek and start playback from any segment boundary without needing to download the entire stream.
- `segment-name segment_` - This option specifies the naming pattern for the segmented media files generated. We’ve set it with the prefix `segment_` which followed by a sequence number.
- `matrix.mp4` - The input video file that MP4Box will process to generate the DASH presentation.

![Screenshot 2024-10-23 at 17 14 41](https://github.com/user-attachments/assets/1a51400c-2c9c-4c7b-ac60-3e443d1929f3)

You should end up with a bunch of segment files and a manifest `.mpd` file. I have also moved the files into a separate folder.

In your `shakaVOD.js` file, replace the .mp4 file you were referencing to this newly created .mpd file

```jsx
//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
// player.load('../reference/matrix.mp4');
player.load('../reference/matrixShakaVOD/matrix_dash.mpd');
```

Save everything and try navigating to the shaka VOD player in the browser again and it should playback

# 9. Creating DASH VOD manifest
## Updating dashVOD.html

The dashVOD.html file is also the same as dashLive.html except for the .js file being referenced

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Video Player</title>
        <!-- DASH PLAYER -->
        <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    </head>
    <body>
        <video id="video"></video>
        <script type="text/javascript"src="./dashVOD.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

Be sure to reference `dashVOD.js` and not `dashLive.js`

## Referencing .mp4/shaka .mpd in DASH player

Let’s try referencing the .mp4 file first in `dashVOD.js`

Your dashVOD.js should look like this:

```bash
// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../reference/matrix.mp4', true);
```

So it’s the same like dashLive.js except we’re referencing the .mp4 file.

Save everything and refresh your browser and try to view the .mp4 file via DASH. It will fail to load. Inspect the page and view the Console

![Screenshot 2024-10-23 at 17 16 21](https://github.com/user-attachments/assets/3619702d-2571-4223-aa16-f731723f5060)

```bash
[5][Protection] No supported version of EME detected on this user agent! - Attempts to play encrypted content will fail! 
```

The warning is stating it cannot find or the browser does not support a supported EME (Encrypted Media Extensions) to commence playback. This is just a warning related to DRM. In actuality DASH doesn’t know what to do with the .mp4 and you can see nothing loads.

Now try referencing the same .mpd you generated for shakaVOD.js here in dashVOD.js

Your code should now look something like this:

```bash
// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../reference/matrixShakaVOD/matrix_dash.mpd', true);
```

Save everything and view the page in the browser. Attempt playback of the VOD using Dash.

Again it fails to load, inspect the page and notice there is an actual error this time:

![Screenshot 2024-10-23 at 17 16 51](https://github.com/user-attachments/assets/3c695139-2a18-48a9-9dc7-a1cc30593462)

```bash
[117][Stream] Multiplexed representations are intentionally not supported, as they are not compliant with the DASH-AVC/264 guidelines
```

The DASH stream you are trying to play contains multiplexed content, where audio and video tracks are combined into a single manifest, and this is not supported by the `dash.js` player according to the DASH-AVC/264 guidelines.

The DASH-AVC/264 guidelines specify that audio and video should have separate representations in the manifest. This allows the player to switch between different bitrates and resolutions more efficiently and allow things like switching between audio tracks more easily.

## How to transcode the .mp4 file for DASH

As mentioned in the Transcoding presentation: https://docs.google.com/presentation/d/1ZYZUxtPIwI6cPkEAnJ1xE1MdEGNrQg3AyqaK2zUp88A/edit?usp=sharing, each video file is made up of four elements:

- The Container or Wrapper - e.g. .mov, .mp4, .avi etc
- The Video Codec
- The Audio codec
- Additional Metadata

Video Transcoding is the process of:

1. Opening up the wrapper
2. Making a copy of the file from one video and audio codec to another
3. Then putting it back together into the same wrapper or changing the file format

We will be demuxing the .mp4 file to separate the audio and video then decoding, processing and encoding each asset. Finally we will transmux the video and audio into a new format - the manifest

Ensure you have ffmpeg installed - it can be installed using brew by running `brew install ffmpeg`

- To check if you have ffmpeg installed, run the command `which ffmpeg` - it should display your brew location similar to this: `/opt/homebrew/bin/ffmpeg` or `usr/local/bin/ffmpeg`

With Terminal in your `reference` folder where the .mp4 file is, run the following command:

```bash
ffmpeg -i matrix.mp4 -vn -c:a copy audio.mp4 -an -c:v copy video.mp4
```

This will create two separate files called audio.mp4 and video.mp4

With your separated files now in place, create a new folder in reference. You can call it `matrixDashVOD` or something relevant, this is where we will save the newly segmented files based on this combination of audio and video

```bash
nginx_project

		reference

				matrix.mp4

				video.mp4

				audio.mp4

				matrixDashVOD

				matrixShakaVOD
```

cd into the new folder `matrixDashVOD` and run the following command:

```bash
MP4Box -dash 5000 -frag 5000 -rap -bs-switching no -profile dashavc264:live -segment-name segment_ -out ./dashStream.mpd ../video.mp4#video:baseURL=video ../audio.mp4#audio:baseURL=audio
```

1. `-dash 5000`: Duration of the segments (5 seconds)
2. `-frag 5000`: The fragment duration within segments in milliseconds. Also set to 5 seconds meaning each fragment will be the same length as each segment. Fragments are typically used in HTTP streaming for fine-grained seeking and buffering.
3. `-rap`: Stands for "Random Access Points". It ensures that each segment starts with a keyframe (I-frame), which is necessary for the player to begin playback from any segment.
4. `-bs-switching no`: Bitstream switching flag (switching between different quality representations) set to no so it is not allowed within segments. It simplifies the stream for us in our scenario but in a real life example, this may reduce the flexibility for adaptive bitrate streaming.
5. `-profile dashavc264:live`: This specifies the DASH profile to use as was mentioned in the error originally. This is a profile that is tailored for live streaming scenarios using AVC/H.264 video codec.
6. `-segment-name segment_`: The actual segment files will be named with this prefix followed by a number (e.g., `segment_1.m4s`, `segment_2.m4s`, etc.).
7. `-out ./dashStream.mpd`: The output location and name for the generated DASH manifest file. This manifest file will contain the metadata for the player
8. `../video.mp4#video:baseURL=video`: The location of the video file relative to the location of where you’re running the command. #video indicates to use the video track from this file. :baseURL=video specifies a URL in the manifest. The segments for this video track will be referenced with the base URL video
9. `../audio.mp4#audio:baseURL=audio`: Same as video but for audio

<aside>
💡 If you see an error like

`zsh: no matches found: ../video.mp4#video:baseURL=video`

 

you may want to add quotes to file paths, this way Finder will recognise that file name has an additional parameter set with `#`. Your command will become:

```bash
MP4Box -dash 5000 -frag 5000 -rap -bs-switching no -profile dashavc264:live -segment-name segment_ -out ./dashStream.mpd "../video.mp4#video:baseURL=video" "../audio.mp4#audio:baseURL=audio"
```

</aside>

You will now see a bunch of segments and a `dashStream.mpd` file generated. Reference this in your `dashVOD.js` so it looks something like this

```jsx
// DASH PLAYER
var player = dashjs.MediaPlayer().create();
player.initialize(document.getElementById('video'), '../reference/matrixDashVOD/dashStream.mpd', true);
```

Save everything and refresh your browser. Navigate to the Dash VOD playback page and enjoy the video clip with audio.

You might want to open up both dashStream.mpd and matrix_dash.mpd (the Dash and Shaka player manifests) and see what is the difference.

You will see the representation for mimeType video/mp4 and audio/mp4 are handled separately in the newly created Dash manifest whereas the representation in the previous Shaka manifest only referenced video/mp4 with 2 content Types

![Screenshot 2024-10-23 at 17 18 45](https://github.com/user-attachments/assets/05b43564-033f-4add-9bf7-a2d4433f9e07)

dashStream.mpd for DASH player

![Screenshot 2024-10-23 at 17 19 07](https://github.com/user-attachments/assets/a228572a-1a4d-4e20-8ccf-acfa1a163650)

matrix_dash.mpd for Shaka player

# 10.Creating HLS VOD manifest
## What is HLS.js?

HTTP Live Streaming is an HTTP-based adaptive bitrate streaming communications protocol developed by Apple Inc. and released in 2009. Support for the protocol is widespread in media players, web browsers, mobile devices, and streaming media servers

## Updating hlsVOD.html

Copy and paste the contents one of your other VOD html files into hlsVOD.html. This will be a starting point.

In the `<head>` container, update the `<title>` to `HLS Player` and change the source of the player to `"https://cdn.jsdelivr.net/npm/hls.js@latest"`

Update the script reference to hls.js

Your hlsVOD.html should look something like this:

```html
<!DOCTYPE html>hls
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>HLS Player</title>
        <!-- HLS PLAYER -->
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    </head>
    <body>
        <video id="video"></video>
        <script type="text/javascript"src="./hlsVOD.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

## Creating a .m3u8 playlist file to load into HLS player

HLS Player requires a playlist file known in a .m3u8 format. Segments are created in a .ts format (Transport Stream - not TypeScript)

Create a new folder for your HLS segmented files to be saved into. I recommend a folder called `hlsoutput` in your `reference` folder

In Terminal, navigate to your `reference` folder which contains the .mp4 file you want to segment.

Run the following command:

```bash
ffmpeg -i matrix.mp4 -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 ../reference/hlsoutput/index.m3u8
```

Be sure to double check the output path of the .m3u8 and that it is in a folder relative to where you’re running this command from.

<aside>
⚠️ Your laptop fans might get louder as this process eats up a lot of resources

</aside>

Here's a breakdown of the options used in the FFmpeg command:

- `i matrix.mp4`: Specifies the video file.
- `-c:v libx264 -c:a aac f hls`: Sets the video and audio codecs for encoding in the output format set to HLS
- `hls_time 10`: Sets the segment duration to 10 seconds.
- `hls_list_size 0`: 0 specifies an unlimited number of HLS playlist entries.
- `../reference/hlsoutput/index.m3u8`: Specifies the output HLS playlist file.

![Screenshot 2024-10-23 at 17 26 00](https://github.com/user-attachments/assets/852b410c-82d2-425d-978f-804525242ee5)

You should now have a playlist file successfully generated with a bunch of transport stream files

## Updating the hlsVOD.js file

We now have a playlist file generated. Add the following code in your hls.js file

```jsx
let video = document.getElementById('video');
// Check if browser supports HLS and if it needs to create a new HLS instance in this session
if(Hls.isSupported()) {
    console.log("HLS is supported - create new HLS session, load in m3u8 playlist and attach to video HTML element")
    var hls = new Hls();
    hls.loadSource('../reference/hlsoutput/index.m3u8');
    hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // If HLS is supported by the browser natively i.e. Safari
    // check MIME type (Multipurpose Internet Mail Extensions) for browser against 'application/vnd.apple.mpegurl' (Apple standard)
    // If supported and m3u8 format is correct, load in the file
    video.src = '../reference/hlsoutput/index.m3u8';
}
```

Similar to dash and shaka player, we’re referencing the `‘video'` HTML element

Some browsers have HLS built in like Safari. Others would require hls.js library to be loaded in.

- First we check if the browser supports HLS.js library
- If it does support it, create a new hls instance, load in the .m3u8 playlist and attach it to the video element
- If it does not, check if the browser supports it natively by checking the MIME type for the browser against Apple’s standards, then link the video element to the .m3u8 playlist file

MIME stands for Multipurpose Internet Mail Extensions and we’re checking if the browser can supports the type defined by Apple’s standards at vnd.apple.mpegurl - if the browser supports it, the HLS stream is assigned directly to the `<video>` element's `src` attribute, enabling playback through the browser's native HLS player.

Save everything and navigate to your browser. Try playing the video…

## Updating hlsVOD.html to autoplay

So the video seems to be stuck on the first frame and not actually playing. We don’t have any player controls on the page programmed yet.

To get this to work add the following line to your HTML `<video>` element:

```bash
<video id="video" controls autoplay></video>
```

This will set the video to autoplay and you can see the controls

Save everything and try playing the content through your browser

# 11. Navigation controls support
Let’s add some code to index.js to listen for keydown and change focus between buttons. First let’s define what the focused button will look like in index.css

## Updating index.css to include focused attribute

Add the following to your index.css

```css
.focused {
    /* Add yellow outline when focused */
    outline: 2px solid yellow;
}
```

This will add a yellow 2 pixel outline around the button. Feel free to tweak this to you liking by adjusting the size, style or colour.

## Updating index.js for navigation control support

We need to add an event listener for the keydown event and relate it to cycle through the buttons on the page

Add the following to your index.js file at the bottom:

```jsx
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("button");

  let focusedIndex = 0;

  // Add event listener for keydown event
  document.addEventListener("keydown", function (event) {
    
  });
});
```

We’re adding an event listener to query the buttons on the page and storing that into `buttons` variable

We’ve created a `focusedIndex` set to 0 - the first ‘button’ we’ll start focus from

Then we’ve added another event listener for keydown event.

Now let’s add a few if statements to tell the browser what to do with key presses.

Add the following code within the `“keydown”` event listener function

```bash
  	const key = event.key;

    if (key === "ArrowLeft" || key === "ArrowRight" || key === "Enter") {
      event.preventDefault(); // Prevent default browser behavior

      // Remove focus class from all buttons
      buttons.forEach((button) => button.classList.remove("focused"));

      // Move focus based on arrow keys
      if (key === "ArrowLeft") {
        focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length;
      } else if (key === "ArrowRight") {
        focusedIndex = (focusedIndex + 1) % buttons.length;
      }

      // Apply focus to the button
      buttons[focusedIndex].classList.add("focused");

      // Add console logging to debug
      console.log("Focused Index:", focusedIndex);

      // Activate button on Enter
      if (key === "Enter") {
        buttons[focusedIndex].click();
      }
    }
```

The keys we’re associating are ArrowLeft, ArrowRight and Enter.

- `event.preventDefault();` will prevent the browser’s default behaviour from occurring when these keys are pressed i.e. the arrow keys might act as a scroll on the page. You’ll see up and down still scrolls, feel free to add these keys to the if statement if you don’t want the page the to scroll with `“ArrowUp”` or `“ArrowDown”`
- We’re removing focus from the buttons as a starting point - focused is coming from the css file (classList envokes css lookup)
- We then handle the ArrowLeft and ArrowRight events to change the focusedIndex
- `buttons[focusedIndex].classList.add("focused");` - This adds the focused value to the focusedIndex
- Finally we handle “Enter” key press by setting it to click into the focused button

Save your files and try it out on your browser

That’s great we can navigate through pages but what if we want to go back a page? Let’s add a check for the “Backspace” key press.

Add the following after the “Enter” key press check:

```bash
    if (key === "Backspace" && window.location.pathname !== "/app/index.html") {
      window.location.href = "/app/index.html";
    }
```

This is adding an extra check to ensure you can’t press Backspace on the home page (index.html) - so this Backspace will only work if you’re not on the homepage and we’re setting it to redirect to index.html, not the browser back function

# 12. Where's my HLS Live Player?
OBS was outputting your rtmp stream in dash format (.mpd) - this is great for DASH player and Shaka but HLS requires .m3u8 format.

In this section we’ll add a few changes to your current set up to enable a live manifest of your OBS stream to be stored in a HLS equivalent format

## Updating nginx.conf to output in HLS format

Open your nginx.conf file and update the rtmp block so it looks like the following:

```bash
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            dash on;
            dash_path /Users/mohammadarif/Projects/nginx_project/DASH_manifest;
            dash_fragment 3s;
            dash_playlist_length 60s;
            **hls on;
            hls_path /Users/mohammadarif/Projects/nginx_project/HLS_manifest;
            hls_fragment 3s;
            hls_playlist_length 60s;**
        }
    }
}
```

- `hls on;` - sets the format for hls
- `hls_path;` - sets the path for where the manifest is saved. Note this is a new folder and I have also updated `dash_path` as both cannot be the same. **Be sure to update your web page files (html and js) to refer to the new locations for your live stream files**
- `hls_fragment` and `hls_playlist_length` - same as we did with dash earlier

Stop and restart your stream. You should now be seeing an output in your locations in the HLS related format (.m3u8 and .ts files)

<aside>
⚠️ If you don’t see the output, check the new folders have correct permissions for Read/Write for your user and Read only at least for user group ‘everyone’

</aside>

## Updating index.html to include a new page for hlsLive.html

In your index.html file, add the following line near your other buttons to create a new button called Play Stream HLS with the LIVE red text:

```html
<button id="hlsLiveButton" onclick="redirectToHlsLivePlayer()">Play Stream HLS <span class="live-text">LIVE</span></button>
```

## Updating index.js to include the function for redirectToHlsLivePlayer()

In your index.js file, add the following function near your other functions to create a redirect to the hlsLive.html page:

```jsx
function redirectToHlsLivePlayer() {
    //Redirect to the player
    window.location.href = "/app/hls/hlsLive.html";
}
```

## Updating hlsLive.html

In your hlsLive.html file, you will want to load in the HLS Player and link the .html to `hlsLive.js` and also set it to autoplay the video for now. Your hlsLive.html file should look something like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>HLS Player</title>
        <!-- HLS PLAYER -->
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    </head>
    <body>
        <video id="video" controls autoplay></video>
        <script type="text/javascript"src="./hlsLive.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

## Updating hlsLive.js

And finally in your hlsLive.js file, you want to update the source to reference the stream.m3u8 file instead of the index.m3u8 for the matrix clip. Update your code so it looks something similar to below:

```jsx
var video = document.getElementById('video');
// Check if browser supports HLS and if it needs to create a new HLS instance in this session
if(Hls.isSupported()) {
    console.log("HLS is supported - create new HLS session, load in m3u8 playlist and attach to video HTML element")
    var hls = new Hls();
    hls.loadSource('../HLS_manifest/stream.m3u8');
    hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // If HLS is supported by the browser natively i.e. Safari
    // check MIME type (Multipurpose Internet Mail Extensions) for browser against 'application/vnd.apple.mpegurl' (Apple standard)
    // If supported and m3u8 format is correct, load in the file
    video.src = '../HLS_manifest/stream.m3u8';
}
```

Save all your files, stop your OBS stream (if applicable), reload nginx then start your stream and check it out on the browser to confirm it’s working

# 13. Play/Pause and keyCodes
## Keypresses and keyCode

Each keypress corresponds to a keyCode in JavaScript. You can use a site like https://www.toptal.com/developers/keycode to check what each key press is corresponding to or add console.log to your code to see the output whilst debugging

The “Backspace” key (also referenced as keyCode “8”) is not what the all remotes utilise. So we’ll need to adjust our `index.js` file for it to work for certain devices

Update the keydown event listener with the following console.log within index.js 

```bash
document.addEventListener("keydown", function (event) {
    **console.log("Key Code:", event.keyCode); // Add this line to log the key code**
    const key = event.key;
```

NOTE: You may see a warning about keyCode being deprecated, but in fact it is still supported by many browsers as mentioned here in Browser Compatibility: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode - They recommend you state the key name now instead of the keyCode going forward

When you press the keys on the remote or keyboard, a keyCode will now be output to the console. **This will be useful to debug keyCodes for buttons on a TV remote**

You’ll need to adjust your if statement for the Backspace so it can handle the other keyCodes too.

```bash
// Detect the Back button press by checking key codes
    if ((key === "Backspace" || event.keyCode === 8 || event.keyCode === 10009 || event.keyCode === 461) && window.location.pathname !== "/app/index.html") {
        window.location.href = "/app/index.html";
    }
```

- `8` is BackSpace - I believe Roku and Android utilise this by default
- `10009` seems to be the one used for Samsung Tizen (might need to double check this)
- `461` seems to be the one used for LG WebOS (might need to double check this)

We should then be able to figure out other buttons like Play, Pause, Forward and Rewind and handle these keypresses to interact with the video element we have added

## pausePlay()

Let’s add a play/pause toggle to our app.

The great thing about this is that we can add the code to interact with the ‘video’ HTML element - so essentially we’re not telling the actual player to do the action. This is useful as the same code can be applied across the different players we have.

Add the following function in your index.js file at the bottom:

```jsx
let videoElem = document.getElementById('video');

function pausePlay() {
  if (videoElem.paused) {
      videoElem.play();
  } else {
      videoElem.pause();
  }
}
```

So we’re referencing the ‘video’ element from our HTML file. If it is paused, it will trigger the play function else it will trigger the pause function.

We need to call this function and we want the keypress of play/pause to call this. So add the following switch statement inside the `document.addEventListener(”keydown”, function (event)` 

```jsx
switch (event.keyCode) {
      case 85: // Android Play/Pause
      case 415: // Samsung Play
      case 19: // LG Pause and Samsung Pause
      case 179: // LG Play
      case 80: // LG Play/Pause toggle
      case "p": // to test on browser with key 'p'
        pausePlay()
        break;
    }
```

As mentioned above, we have can use keyCodes to define button correspondences.

The case keyCodes refer to the different keyCodes I’ve found for some of our devices. You can give it a try in your browser using the ‘p’ button or try on an actual device. The Samsung keycode was a suggestion from ChatGPT but I don’t think this is right as keyCodes tend to go up to 255.

## skipBackward() and skipForward()

Similar to pausePlay function, we can also adjust the currentTime of the video player element and associate this to a keycode.

NOTE you can also link a button to this function if you prefer i.e. `onclick = skipForward()`

Add the following switch statements inside the `document.addEventListener(”keydown”, function (event)` under the previously added pause switch statement

```jsx
switch (event.keyCode) {
  case 177: // MediaTrackPrevious button on remote
  case 219: // The "[" key on the keyboard
  case "[":
    skipBackward()
    break;
}

switch (event.keyCode) {
  case 176: // MediaTrackNext button on remote
  case 221: // The "]" key on the keyboard
  case "]":
    skipForward()
    break;
}
```

`176` and `177` are default keyCodes for MediaTrackNext and MediaTrackPrevious. They may or may not work on an actual device. If it does not, we’ll need to add the correct case by pressing the key whilst in the app on the device and seeing what the keyCode output is.

Add the following functions related to the switch statements - this can be at the bottom of `index.js`

```jsx
function skipBackward() {
  videoElem.currentTime -= 5; // videoElem.currentTime = videoElem.currentTime - 5
}

function skipForward() {
  videoElem.currentTime += 5; // videoElem.currentTime = videoElem.currentTime + 5
}
```

On browser, you can use `[` or `]` to rewind or forward by 5 seconds during playback. It should work with all the players as we are changing the time on the HTML element

# 14. Connecting to your web app from a device
So try taking out your phone or any other device connected to the same network as your MacBook and attempt to navigate to `<macbook-ip>/app` or `<macbook-ip>:80/app`

If you’re on your GL router, you might notice it doesn’t work. For some people on FX Digital Wi-Fi, it seems fine. I’m not fully sure why this is the case, it must be something to do with the port forwarding on the router?

In this case, nginx seems to be local only and not hosted. There are a few tools we can use to host the nginx server so it becomes available on your network.

cloudflare - recommended
## What is Cloudflare?

Cloudflare is one of the biggest networks operating on the Internet. People use Cloudflare services for the purposes of increasing the security and performance of their web sites and services.

More info and diagrams of how it works on their web page: https://www.cloudflare.com/en-gb/learning/what-is-cloudflare/

## What is a tunnel?

A tunnel is a secure connection between your internet and your local host. E.g [https://localhost:5000](https://localhost:5000/)

## Setup

- You can perform the below steps once you have your stream up and running on <your-ip-address>/app
- Run the following command to install cloudflare
    
    ```bash
    brew install cloudflared
    ```
    
- Check version to verify that its installed
    
    ```bash
    cloudflared --version
    ```
    
- Start a cloudflare tunnel to your locally running nginx stream
    
    ```bash
    cloudflared tunnel --url <your-ip-address>/app
    
    e.g. cloudflared tunnel --url 172.16.100.101/app
    ```
    
- You’ll then see a link generated in the console that looks similar to this:
    
    http://when-the-toddler-disabled.trycloudflare.com/app/
    
    ![Screenshot 2024-10-23 at 17 31 03](https://github.com/user-attachments/assets/510df419-7a62-4717-9e20-6551542b2b9d)

    
- You should now be able to use the generated link to view your stream. This link can be shared and deployed onto devices.

- Additionally you can find more details about other ways to deploy  [here](https://bootcamp.uxdesign.cc/how-to-setup-a-cloudflare-tunnel-and-expose-your-local-service-or-application-497f9cead2d3)

## Amazon FireStick

With a FireStick, download the Web App Tester app and provided the FireStick and your MacBook are on the same network, you should be able to enter your nginx app URL into the FireStick and load it up

## LG

With LG, you’ll need to update the URL in index.html to point to your nginx app URL. You should then be able to package the application and load it into the TV using the VS Code Extension.

## Samsung

For Samsung, if you have a container file from another project, open config.xml and update the Tizen Content source to your URL. Provided the TV and your MacBook are on the same network, you should now be able to load the Samsung app on the TV.

You might need to “Build Signed Package” to create a .wgt file and install via `tizen install` command

# 15. ABR and multi audio channel (1)
## What is ABR (Adaptive Bitrate)

**Video Stream:** A Video stream is made up of short segments (in our case 3 seconds), which when played in the right sequence, appear to be a continuous video stream.

**Manifest:** an index file which tells the players what the short video segment files are called and what order to play them for a programme.

**ABR:** The ability for the manifest to index another version of the segment (perhaps in a lower bitrate format) should the network conditions change

In this section we will:

- Transcode a 1080p .mp4 file into various resolutions i.e. 1080p, 720p and 360p
- Transcode the audio tracks from the .mp4 into separate representations
- Create segments and a manifest compatible with our players (Dash and Shaka for now)
- Create a new row and new html pages and reference the ABR streams
- Create buttons in the player to switch between languages

## Transcode the 1080p .mp4 file

Download the following file. This is taken from: https://media.ccc.de/v/36c3-11235-36c3_infrastructure_review
This .mp4 file is quite special. It’s in 1080p format but contains 3 audio tracks (English, French and German) which can be viewed in a player like VLC. We will use ffmpeg with this to transcode the audio into separate tracks and transcode into lower quality segments

### Transcode the audio tracks

Create a new folder called `ABR` in `/reference` and add the .mp4 file from above. Create a separate folder within ABR called `video` and `audio`

Run the following commands one at a time in Terminal from the ABR folder: **NOTE this can take up to 10 minutes**

English

```bash
ffmpeg -i multi-audio-test.mp4 -map 0:v -map 0:a:0 -c:v copy -c:a aac -b:a 128k ./audio/audio_eng.mp4
```

German

```bash
ffmpeg -i multi-audio-test.mp4 -map 0:v -map 0:a:1 -c:v copy -c:a aac -b:a 128k ./audio/audio_ger.mp4
```

French

```bash
ffmpeg -i multi-audio-test.mp4 -map 0:v -map 0:a:2 -c:v copy -c:a aac -b:a 128k ./audio/audio_fra.mp4
```

`multi-audio-test.mp4` - this is the file from above we’re telling ffmpeg to use as the input `-i`

`-map 0:v` - map is used to specify which streams to include in the output file. 0:v is stating to use the first input file 0 and include the video stream

`-map 0:a:0` - this is looking at the first input file audio stream 0 (this is English). This changes between the steps to identify the German and French sections

`-c:v copy` - -c specifies the video codec to use. We’re copying the output from the original file which means we don’t want to re-encode the output

`-c:a aac` - this line is setting the audio encode output to use AAC format

`-b:a 128k` - -b sets the bitrate. We’re only specifying audio bitrate which should be fine 128k

`./audio/video_eng.mp4` - the location and filename we want to save the output as

You should have some files similar to this now:

![Screenshot 2024-10-23 at 17 33 26](https://github.com/user-attachments/assets/bc742fdc-7000-47b5-b53b-776092eb9562)

### Transcode the video tracks to different resolutions

Run the ffmpeg commands one at a time whilst in your ABR folder to create separate .mp4 files for the different resolutions. **NOTE: This process can take up to 20 minutes and your CPU/Memory usage may increase during this process**

Before we do run the commands, to ensure the file is properly segmented, we need to know the fps. ffmpeg displays this information for us. Run the command and look out for fps

```bash
ffmpeg -i multi-audio-test.mp4
```

You should see something like this:

![Screenshot 2024-10-23 at 17 34 01](https://github.com/user-attachments/assets/d4b11b17-3cc1-496c-9bbc-460d1b20f6db)

So our video multi-audio-test.mp4 is 25 fps.

Run the following to start transcoding - notice we’ve mentioned `-g 150 keyint_min 150 -sc_threshold` - so basically we are segmenting by 3 seconds (150 frames).

1080p

```bash
ffmpeg -i multi-audio-test.mp4 -c:v libx264 -b:v 4500k -s hd1080 -g 150 -keyint_min 150 -sc_threshold 0 -an ./video/video_1080p.mp4
```

720p

```bash
ffmpeg -i multi-audio-test.mp4 -c:v libx264 -b:v 2500k -s hd720 -g 150 -keyint_min 150 -sc_threshold 0 -an ./video/video_720p.mp4
```

360p

```bash
ffmpeg -i multi-audio-test.mp4 -c:v libx264 -b:v 1000k -s 640x360 -g 150 -keyint_min 150 -sc_threshold 0 -an ./video/video_360p.mp4
```

`-c:v libx264` - Specifying to use x264 codec for encoding the video. H.264 is a popular encoder

`-b:v 4500k` - Specifying the bitrate to 4500 kbps (or 4.5Mb) which is a measure of the video’s quality and size. This changes for 720p and 360p to target those bitrates/resolution

`-s hd1080` - sets the video resolution to Full HD (1920 x 1080). This is a profile loaded in. In the 360p line we’re stating the resolution to use 640x360

`-g 150`: Sets the group of pictures (GOP) size to 150 frames.

`-keyint_min 150`: Sets the minimum interval between keyframes to 150 frames.

`-sc_threshold 0`: Disables scene change detection, ensuring keyframes are inserted at regular intervals.

`-an` - This is removing the audio stream from the output file

In the end we should have something like this:

![Screenshot 2024-10-23 at 17 34 28](https://github.com/user-attachments/assets/eda6f59c-5c6b-4a3b-9f58-c2fc1c8fd38f)

The video files should just be the videos, no audio. The files in audio should contain the audio tracks too

## Create the DASH segments and Manifest

When we put the manifest and different segments together, when referencing the audio .mp4 files, we only want to reference the audio track from the .mp4 file

Create a new folder called `ABR_manifest` in reference/ABR/. Run the following command to create the segments and manifest file so it stores the output into the ABR_manifest folder:

```bash
MP4Box -dash 3000 -frag 3000 -rap -profile dashavc264:live -segment-timeline -out ./ABR_manifest/abr_manifest.mpd \
./video/video_1080p.mp4 \
./video/video_720p.mp4 \
./video/video_360p.mp4 \
./audio/audio_eng.mp4#audio:lang=eng \
./audio/audio_ger.mp4#audio:lang=ger \
./audio/audio_fra.mp4#audio:lang=fra
```

With this line, we’re creating a manifest file called `abr_manifest.mpd` that has a video representation for the different video formats and an audio representation for the different audio formats segmented by 3 seconds. Notice the #audio we’re mentioning

We’re using the `dashavc264:live` profile to ensure the manifest works with the Dash player. Notice we’re breaking down the segments by `-segment-timeline` instead of `-segment-name` - With timeline and keyframes, there is less chance of drifting occurring during the transcoding (where frames are not syncing up)

- **Example of drifting warning during remuxing**
    ![Screenshot 2024-10-23 at 17 35 25](https://github.com/user-attachments/assets/d959d420-be63-4a83-b8dd-0317ea8b6105)
    

Your files should look something like this:

![Screenshot 2024-10-23 at 17 35 48](https://github.com/user-attachments/assets/2b80084f-7c58-45d6-aa7b-fd003a4f67f5)

![Screenshot 2024-10-23 at 17 36 06](https://github.com/user-attachments/assets/3da1c490-bfa9-4a5b-9630-61ee2f1737cc)

So the ABR_manifest folder should include:

```bash
abr_manifest.mpd
audio_eng_dash0.m4s (this continues to audio_eng_dash_168047616.m4s)
audio_eng_dashinit.mp4
audio_fra_dash0.m4s (this continues to audio_fra_dash168047616.m4s
audio_fra_dashinit.mp4
audio_ger_dash0.m4s (this continues to audio_ger_dash168047616.m4s)
audio_ger_dashinit.mp4
video_360p_dash0.m4s (this continues to video_360p_dash44774400.m4s)
video_360p_dashinit.mp4
video_720p_dash0.m4s (this continues to video_720p_dash44774400.m4s)
video_720p_dashinit.mp4
video_1080p_dash0.m4s (this continues to video_1080p_dash44774400.m4s)
video_1080p_dashinit.mp4
```

# 16. ABR and multi audio channel (2)
## Updating HTML, CSS and JS for ABR stream

Let’s get back to the web app files. In this section we will create a new button on your home page to redirect to a new page showcasing the ABR stream in DASH and Shaka Player.

In `index.html` add the following div to create a new row. We will call this Test ABR/Audio Stream and we will add two buttons to this calling two functions

```html
<div class="container">
    <div>
        <h3>Test ABR/Audio Stream</h3>
        <button id="dashABRButton" onclick="redirectToDashABRPlayer()">Play ABR Stream DASH <span class="abr-text">ABR</span></button>
        <button id="shakaABRButton" onclick="redirectToShakaABRPlayer()">Play ABR Stream Shaka <span class="abr-text">ABR</span></button>
    </div>
</div>
```

We’ve mentioned a function and a css class that doesn’t currently exist. Let’s add these.

We’ve referenced a css class in the button. Add this to `index.css`

```css
.abr-text {
    position: absolute;
    top: 0;
    left: 0;
    background-color: green;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    /* Ensure it's above the button text */
    z-index: 1;
}
```

This is the same as the live-text except we are using a green background instead so feel free to adjust to your preferences

In `index.js`, add the following functions:

```jsx
function redirectToDashABRPlayer() {
    window.location.href = "/app/dash/dashABR.html";
}

function redirectToShakaABRPlayer() {
    window.location.href = "/app/shaka/shakaABR.html";
}
```

NOTE if you used http-server, you’ll need to add a check for “app” in the URL in which case your solution may look like this:

- **redirectToDashABRPlayer() if http-server is used**
    
    ```bash
    function redirectToDashABRPlayer() {
      if (window.location.href.indexOf("app") != -1) {
        window.location.href = "/app/dash/dashABR.html";
      }
      else {
        window.location.href = "/dash/dashABR.html";
      }
    }
    
    function redirectToShakaABRPlayer() {
      if (window.location.href.indexOf("app") != -1) {
        window.location.href = "/app/shaka/shakaABR.html";
      }
      else {
        window.location.href = "/shaka/shakaABR.html";
      }
    }
    ```
    

So we’ve mentioned `dashABR.html` and `shakaABR.html` in the index.js file. Create these two HTML files in their respective folders

In `dashABR.html` add the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Video Player</title>
        <!-- DASH PLAYER -->
        <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    </head>
    <body>
        <video id="video" controls></video>
        <script>
            // DASH PLAYER
            var player = dashjs.MediaPlayer().create();
            player.initialize(document.getElementById('video'), '../reference/ABR/ABR_manifest/abr_manifest.mpd', true);
        </script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

And in `shakaABR.html` add the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Shaka Player</title>
        <!-- SHAKA PLAYER -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.1.0/shaka-player.compiled.js"></script>
    </head>
    <body>
        <video id="video" controls></video>
        <script>
            //SHAKA PLAYER
            var videoElement = document.getElementById('video');
            var player = new shaka.Player(videoElement);
            videoElement.autoplay = true;
            player.load('../reference/ABR/ABR_manifest/abr_manifest.mpd');
        </script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

### Breakdown

In both files we have referenced the respective player (dash and shaka) and added controls to the video element.

Notice the script section here is not referencing another .js file. In the HTML file, anything written in the script container in JavaScript can be interpreted without the need to load in a .js file. So we’ve added the code to launch the abr_manifest.mpd file directly into the HTML file

At this stage, you should be able to save everything and see some updates to your page and be able to click into the ABR content.

### Testing network

You can also test the network connectivity to ensure the playback changes between the different versions. It will usually start with the 360p version as it will be the fastest to load. After the 3 second segment, it will check to see if the bandwidth is high enough to load the 720p or 1080p version. You should see the player size change as it plays.

Also if you check the Network call, you’ll see the 360p segments loaded in first and then it changes to 720p or 1080p respectively.

![Screenshot 2024-10-23 at 17 38 33](https://github.com/user-attachments/assets/89d0ef40-acd6-4d54-95ec-5c16b55828fd)


## Adding buttons to the player page

The Dash default player doesn’t have the option to switch between the audio tracks so what we’ll be doing is adding the buttons to the player page and referencing them to the manifest representation

In `abr_manifest.mpd` you’ll see the different representations for audio with a language for each in AdaptionSet

- lang=”en”
- lang=”de”
- lang=”fr”
    
    ![Screenshot 2024-10-23 at 17 38 54](https://github.com/user-attachments/assets/d01c905c-fb11-41b0-978a-582678dc43c4)
    

Update your `dashABR.html` file to the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Video Player</title>
        <!-- DASH PLAYER -->
        <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    </head>
    <body>
        <video id="video" controls></video>
        <div class="video-container_controls">
            <button id="btn-en" onclick="switchAudio('en')">English</button>
            <button id="btn-de" onclick="switchAudio('de')">German</button>
            <button id="btn-fr" onclick="switchAudio('fr')">French</button>
        </div>
        <script>
            // DASH PLAYER
            var player = dashjs.MediaPlayer().create();
            player.initialize(document.getElementById('video'), '../reference/ABR/ABR_manifest/abr_manifest.mpd', true);
            
            function switchAudio(lang) {
            var tracks = player.getTracksFor('audio');
            var selectedTrack = tracks.find(track => track.lang === lang);
                if (selectedTrack) {
                    player.setCurrentTrack(selectedTrack);
                } else {
                    console.log('Audio track not found for language:', lang);
                }
            }
        </script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

We have added three buttons representing English, German and French and passing the argument of the language into a JS function i.e. ‘en’, ‘de’ or ‘fr’

The function is doing the following:

- Using the players `getTracksFor` function to look for `‘audio’` in the manifest
- It’s then using the `find` function on `getTracksFor` to see if the language does exist.
- If it does exist then the player will set the current track to the selected track
- If it doesn’t exist, the player continues with the currently selected track but a console log will appear dictating it doesn’t exist

We’ve also referenced `video-container-controls` class in dashABR.html. Add the following class to your index.css file:

```css
.video-container_controls {
    position: absolute;
    top: 3px;
    /* bottom: 3px; */
    width: 100%;
    padding: 3px;
    display: flex;
    justify-content: right;
    background: linear-gradient(180deg, #000000 30%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 1) 100%);
}
```

Feel free to adjust this. I have set it so the buttons appear at the top right but if you prefer the bottom, uncomment bottom and comment out top and if you prefer left or center instead of right, change the `justify-content` value. The background includes opacity which is based on degree. `0deg` will mean the gradient is from top to bottom whereas `180deg` is bottom to top.

Save everything and test it out. You should be seeing a new row with ABR related buttons and in the player a row showcasing the audio options. Selecting it should switch between audio tracks on the fly. You can also drop your network speed to test the ABR switches to a lower version during stream.

![Screenshot 2024-10-23 at 17 39 26](https://github.com/user-attachments/assets/f5b1f112-0027-4e80-b84c-51a14657fc10)


## Adjusting the buttons in the player

If you want to adjust the look of the buttons that appear in the player, you should create a new css class for the button to reference.

So you can change your buttons to reference a class called something like `“player-button”` in the .html file

```html
<div class="video-container_controls">
    <button class="player-button" id="btn-en" onclick="switchAudio('en')">English</button>
    <button class="player-button" id="btn-de" onclick="switchAudio('de')">German</button>
    <button class="player-button" id="btn-fr" onclick="switchAudio('fr')">French</button>
</div>
```

In your index.css file, add the following `.player-button` class and I’ve also updated root to include a smaller button for the player

```css
:root {
    --button-width: 256px;
    --player-button: 128px;
}

.player-button {
    position: relative;
    width: var(--player-button);
    height: calc(var(--player-button) / 2);
}
```

Feel free to adjust .player-button to add background-color or background-image if you prefer or transparency via rgba

## Adjusting video to match browser width

If you don’t like the fact that the video player changes sizes (as can be seen when going from 360p to 1080p) - we can set it to match the browser width in our CSS. Add the following to `index.css` if you want to correct this

```css
video {
    width: 100%;
}
```

This will set the video element to the screen size width. This is dynamic so as the browser changes size, the video player element will also change to reflect this

## Update shakaABR.html

Don’t forget to update the `shakaABR.html` file to include the same changes you made in dashABR.html.

But the switchAudio function needs slight tweaking as some of the previous player commands like `getTracksFor()` are slightly reworded for shaka.

Taken from https://shaka-player-demo.appspot.com/docs/api/shaka.Player.html

Update your `shakaABR.html` file to include the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Shaka Player</title>
        <!-- SHAKA PLAYER -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.1.0/shaka-player.compiled.js"></script>
    </head>
    <body>
        <video id="video" controls></video>
        <div class="video-container_controls">
            <button class="player-button" id="btn-en" onclick="switchAudio('en')">English</button>
            <button class="player-button" id="btn-de" onclick="switchAudio('de')">German</button>
            <button class="player-button" id="btn-fr" onclick="switchAudio('fr')">French</button>
        </div>
        <script>
            //SHAKA PLAYER
            var videoElement = document.getElementById('video');
            var player = new shaka.Player(videoElement);
            videoElement.autoplay = true;
            player.load('../reference/ABR/ABR_manifest/abr_manifest.mpd');

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
        </script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

The switchAudio function is still doing the same thing as it was on dash but it has to be reworded slightly to use the correct functions the Shaka player is compatible with

# Updating navigation controls

Now that we have two rows in index.html, you might want to include support for up and down focus navigation.

Try this solution to move focus between rows:

index.js

```jsx
// Script to add arrow key focus
document.addEventListener("DOMContentLoaded", function () {
  const rows = document.querySelectorAll(".container");
  const buttons = document.querySelectorAll("button");

  let focusedIndex = 0;

  // Apply focus to the first button initially
  if (buttons.length > 0) {
    buttons[focusedIndex].classList.add("focused");
    buttons[focusedIndex].focus();
  }

  // Add event listener for keydown event
  document.addEventListener("keydown", function (event) {
    console.log("Key Code:", event.keyCode);
    const key = event.key;

    if (key === "ArrowLeft" || key === "ArrowRight" || key === "Enter" || key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault(); // Prevent default browser behavior

      // Remove focus class from all buttons
      buttons.forEach((button) => button.classList.remove("focused"));

      // Move focus based on arrow keys
      if (key === "ArrowLeft") {
        focusedIndex = (focusedIndex - 1 + buttons.length) % buttons.length;
      } else if (key === "ArrowRight") {
        focusedIndex = (focusedIndex + 1) % buttons.length;
      } else if (key === "ArrowUp") {
        moveFocusUp();
      } else if (key === "ArrowDown") {
        moveFocusDown();
      }

      // Apply focus to the button
      buttons[focusedIndex].classList.add("focused");
      buttons[focusedIndex].focus();

      // Add console logging to debug
      console.log("Focused Index:", focusedIndex);

      // Activate button on Enter
      if (key === "Enter") {
        buttons[focusedIndex].click();
      }
    }

    if (key === "Backspace" && window.location.pathname !== "/app/index.html") {
      window.location.href = "/app/index.html";
    }

    switch (event.keyCode) {
      case 85: // Android Play/Pause
      case 415: // Samsung Play
      case 19: // LG Pause and Samsung Pause
      case 179: // LG Play
      case 80: // LG Play/Pause toggle
      case "p":
        pausePlay()
        break;
    }

    switch (event.keyCode) {
      case 177: // MediaTrackPrevious button on remote
      case 219: // The "[" key on the keyboard
      case "[":
        skipBackward()
        break;
    }

    switch (event.keyCode) {
      case 176: // MediaTrackNext button on remote
      case 221: // The "]" key on the keyboard
      case "]":
        skipForward()
        break;
    }
  });

  function moveFocusUp() {
    let currentButton = buttons[focusedIndex];
    let currentRow = currentButton.closest('.container');
    let currentRowIndex = Array.from(rows).indexOf(currentRow);
    let currentButtonIndexInRow = Array.from(currentRow.querySelectorAll('button')).indexOf(currentButton);

    if (currentRowIndex > 0) {
      let previousRow = rows[currentRowIndex - 1];
      let buttonsInPreviousRow = previousRow.querySelectorAll('button');
      focusedIndex = Array.from(buttons).indexOf(buttonsInPreviousRow[Math.min(currentButtonIndexInRow, buttonsInPreviousRow.length - 1)]);
    }
  }

  function moveFocusDown() {
    let currentButton = buttons[focusedIndex];
    let currentRow = currentButton.closest('.container');
    let currentRowIndex = Array.from(rows).indexOf(currentRow);
    let currentButtonIndexInRow = Array.from(currentRow.querySelectorAll('button')).indexOf(currentButton);

    if (currentRowIndex < rows.length - 1) {
      let nextRow = rows[currentRowIndex + 1];
      let buttonsInNextRow = nextRow.querySelectorAll('button');
      focusedIndex = Array.from(buttons).indexOf(buttonsInNextRow[Math.min(currentButtonIndexInRow, buttonsInNextRow.length - 1)]);
    }
  }
  
});
```

There’s a lot happening here especially in the `moveFocusUp()` and `moveFocusDown()` functions. Essentially we are querying the rows we have via the container class we’re calling from the HTML file then shifting focus to the closest .container button to focus on.

# 17. Shaka Demo asset - Subtitles
On the Shaka Player documentation, there are various test assets.

Check out this manifest file. This one is hosted separately and part of the shaka demo assets. The manifest consists of many adaptations for text (subtitles), audio and video

https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd

![Screenshot 2024-10-23 at 17 41 54](https://github.com/user-attachments/assets/807de7cc-f78e-45eb-be4a-b19f2817908b)

![Screenshot 2024-10-23 at 17 42 19](https://github.com/user-attachments/assets/b73dc4fe-830d-4f98-9414-137c8a24a465)

Notice the different contentType’s and languages. We have multiple text languages (subtitles) and multiple audio languages.

Also notice the BaseURL for these, it looks like the subtitles are .mp4 files. Usually these are `.srt` files which would contain timelapse information and what text to display during that timelapse. Some of the audio tracks are in 128k aac .mp4 format whilst others seem to be a lower bitrate (64k) in .webm format https://www.webmproject.org/about/

So a manifest can be made up of different interpretations of files

## Updating HTML and referencing the manifest

In your `index.html` file, add a new div container for a new row and name it something like “Shaka Demo Test”. Add a button as well so it can redirect to another page. This also means add the function to `index.js`.

Create a new file called `shakaDemo.html` and `shakaDemo.js` - we’ll go back to linking the .js file to the .html file to keep things separated.

index.html

```html
<div class="container">
    <div>
        <h3>Shaka Demo Test</h3>
        <button id="shakaDemoButton" onclick="redirectToShakaDemoPlayer()">Play Demo Stream SHAKA</button>
    </div>
</div>
```

index.js

```jsx
function redirectToShakaDemoPlayer() {
  if (window.location.href.indexOf("app") != -1) {
    window.location.href = "/app/shaka/shakaDemo.html";
  }
  else {
    window.location.href = "/shaka/shakaDemo.html";
  }
}
```

In `shakaDemo.html`, copy the body from shakaABR.html but the script can be linked to `shakaDemo.js`.

shakaDemo.html

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="../index.css" />
        <title>Shaka Player</title>
        <!-- SHAKA PLAYER -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.1.0/shaka-player.compiled.js"></script>
    </head>
    <body>
        <video id="video"></video>
        <div class="video-container_controls">
            <button class="player-button" id="btn-en" onclick="switchAudio('en')">English</button>
            <button class="player-button" id="btn-de" onclick="switchAudio('de')">German</button>
            <button class="player-button" id="btn-fr" onclick="switchAudio('fr')">French</button>
        </div>
        <script type="text/javascript"src="./shakaDemo.js"></script>
        <script type="text/javascript"src="../index.js"></script>
    </body>
</html>
```

## Updating shakaDemo.js

In `shakaDemo.js`, we want to update the content being loaded in firstly. Set player.load to the manifest from above: i.e. `player.load('https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd');`

```jsx
//SHAKA PLAYER
var videoElement = document.getElementById('video');
var player = new shaka.Player(videoElement);
videoElement.autoplay = true;
player.load('https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd');
```

Let’s try and use a console.log to see what audio tracks and subtitle tracks are available to us. Add the following two lines in `shakaDemo.js`

```jsx
var audioTracks = player.getVariantTracks();
console.log('Audio Tracks:', audioTracks);

var textTracks = player.getTextTracks();
console.log('Text Tracks:', textTracks);
```

`getVariantTracks()` and `getTextTracks()` are functions mentioned in the shaka documentation: [https://shaka-player-demo.appspot.com/docs/api/shaka.Player.html](https://shaka-player-demo.appspot.com/docs/api/shaka.Player.html#.event:TracksChangedEvent)

Save everything and inspect your web browser page. Click into Play Demo Stream Shaka and observe the console logs

![Screenshot 2024-10-23 at 17 42 54](https://github.com/user-attachments/assets/265f9445-6747-4771-aac4-e6759012d31b)

We can see Audio Tracks and Text Tracks but it doesn’t look right. It looks like an empty array.

What’s happening (and it might be hard to tell) is that the manifest has not fully loaded in so it’s returning empty results. There is a event function mentioned in the documentation called TracksChangedEvent. Add this to an addEventListener then trigger a function to display the console.logs

Taken from https://shaka-player-demo.appspot.com/docs/api/shaka.Player.html#.event:TracksChangedEvent

![Screenshot 2024-10-23 at 17 43 14](https://github.com/user-attachments/assets/10420892-d753-4389-9584-bc6172cb2da9)

Update your code to include the addEventListener on the player for ‘tracksChanged’, then trigger a function to display your console.logs. You can use either approach to achieve the result:

Option a:
```jsx
// Event listener for tracks changed
player.addEventListener('trackschanged', () => {
    var audioTracks = player.getVariantTracks();
    console.log('Audio Tracks:', audioTracks);

    var textTracks = player.getTextTracks();
    console.log('Text Tracks:', textTracks);
});
```

Option b:
```jsx
// Event listener for tracks changed
player.addEventListener('trackschanged', logTracks);

// Function to log available audio and text tracks
function logTracks() {
    var audioTracks = player.getVariantTracks();
    console.log('Audio Tracks:', audioTracks);

    var textTracks = player.getTextTracks();
    console.log('Text Tracks:', textTracks);
}
```

Now if you save everything and refresh your webpage and inspect the page with the player, you should see a list of the tracks available:

![Screenshot 2024-10-23 at 17 43 59](https://github.com/user-attachments/assets/542f3ff8-9679-4716-bc52-ae563f7b4718)

We have the following audio tracks available:

- ‘fr’, ‘es’, ‘en’, ‘de’, ‘it’

Notice the different bandwidths too

And we have the following subtitle tracks available:

- ‘el’ (Russian), ‘fr’, ‘en’, ‘pt-BR’ (Portuguese Brazil)

We can now update our buttons in the HTML

## Updating buttons for audio and subtitles

In the ABR stream, we added some buttons for English, French and German audio, these will also work here too but let’s add Spanish and Italian buttons too

shakaDemo.html - Replace the video player buttons with this

```html
<div class="video-container_controls">
    <button class="player-button" id="btn-en" onclick="switchAudio('en')">English Audio</button>
    <button class="player-button" id="btn-de" onclick="switchAudio('de')">German Audio</button>
    <button class="player-button" id="btn-fr" onclick="switchAudio('fr')">French Audio</button>
    <button class="player-button" id="btn-es" onclick="switchAudio('es')">Spanish Audio</button>
    <button class="player-button" id="btn-it" onclick="switchAudio('it')">Italian Audio</button>
</div>
```

Add the `switchAudio()` function into `shakaDemo.js`

shakaDemo.js

```jsx
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
```

Let’s do the same for Subtitles. Add a new div with 5 buttons related to the different subtitle tracks available and one being ‘off’ - we’ll name the function `switchText()`

shakaDemo.html

```html
<div class="video-subtitle_controls">
    <button class="player-button" id="btn-sub-off" onclick="switchText('off')">Subtitle Off</button>
    <button class="player-button" id="btn-sub-en" onclick="switchText('en')">English Subtitle</button>
    <button class="player-button" id="btn-sub-fr" onclick="switchText('fr')">French Subtitle</button>
    <button class="player-button" id="btn-sub-el" onclick="switchText('el')">Russian Subtitle</button>
    <button class="player-button" id="btn-sub-pt-BR" onclick="switchText('pt-BR')">Portuguese (BR) Subtitle</button>
</div>
```

And let’s update `shakaDemo.js` to include this `switchText()` function

```jsx
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
```

So by default the `setTextTrackVisibility` is set to `false`. Without this being changed to `true`, the buttons we’ve implemented wouldn’t work. When `off` is selected, all we are doing is setting the visibility to not be true instead of stopping or unloading the text track. This way it can retain the timestamp. After selecting a language via one of the buttons, we set the `selectTextLanguage` to the language selected and set the `setTextTrackVisibility` to `true`

I’ve also added a `video-subtitle_controls` class in my css which displays the buttons at the bottom - right. Feel free to add something similar if you’re referencing a class in your subtitle buttons too

index.css

```css
.video-subtitle_controls {
    position: absolute;
    bottom: 3px;
    width: 100%;
    padding: 3px;
    display: flex;
    justify-content: right;
    background: linear-gradient(0deg, #000000 30%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 1) 100%);
}
```

Test the player and try all the audio and subtitle buttons.

# 18. So what's next?
The web app you’ve created is in a pretty good state. There’s always room for improvement or changes you make going forward. Here’s a few of my suggestions/ideas:

- Refactor the redirect to web page functions
    - We currently have separate functions, we could call one function and pass an argument into the function to redirect to the page needed i.e. `redirectToPage(hlsVOD)` where hlsVOD will refer to `./hls/hlsVOD.html`
- Add a hero container
    - Add another <div> that will display an image. Have this image change as you focus between the buttons on the page by looking at focusedIndex number i.e. a switch statement looking at the focusedIndex number and each number referring to a different image
- Make video player controls disappear and reappear
    - Might be able to achieve this by using JS to add a delay or timer then an if statement to check if controls are visible, then set a CSS class `.hidden` to true - and if it is true and a keyEvent has been detected, set `.hidden` to false
- Try other players
    - Other players you can try could be TheoPlayer or JWPlayer
- DRM
    - Try loading content with/without DRM - you would have to configure the player to load in the DRM license which should trigger the playback if it’s valid
