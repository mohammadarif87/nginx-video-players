# nginx-video-players
A web app to test different open source players (DASH, Shaka and HLS) created using nginx. Supports Live streaming from OBS, Adaptive Bit Rate testing (ABR) and content with multiple audio/subtitle tracks

You'll need to set up nginx. This can be via docker https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/ running the command `docker run -it --rm -d -p 8080:80 --name web webserver` once set up. Or you can install nginx locally by running the following brew commands:

`brew tap denji/nginx`

`brew install nginx-full --with-rtmp-module`

Run `sudo nginx` to start nginx locally

Update the `nginx.conf` file. This can be found in `cd /opt/homebrew/etc/nginx/` or `cd /usr/local/etc/nginx/`
On the docker image, this can be found in `/etc/nginx/nginx.conf`

Add the server block within the http block:
```
server {
        listen 80;
        server_name <your-ip>;

        location /app {
            alias <path-to-location-of-this-repo>;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
            add_header ngrok-skip-browser-warning 1;
            expires off;
            autoindex on;
        }
    }
```

And add the rtmp block at the bottom of the file, outside the http block:
```
rtmp {
    server {
        listen 1935;
        application live {
            live on;
            dash on;
            dash_path <path-to-save-dash-manifest-files>;
            dash_fragment 3s;
            dash_playlist_length 60s;
            hls on;
            hls_path <path-to-save-hls-manifest-files>;
            hls_fragment 3s;
            hls_playlist_length 60s;
        }
    }
}
```

Set OBS stream settings to
Service: Custom
Server: rtmp://localhost/live
Stream Key: stream

Select Start Streaming on OBS and provided nginx is running, you should files generated in the dash_path and hls_path locations. You should then be able to load up index.html and view your stream in the web browser. Other players with the VOD content should also work at this stage
