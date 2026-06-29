import * as video from "video.js";

export default function TestPage() {
    return (
    <div>
      <body>
        <video
          id="my-video"
          className="video-js"
          controls
          preload="auto"
          width={640}
          height={264}
          poster="MY_VIDEO_POSTER.jpg"
          data-setup="{}"
        >
          <source src="MY_VIDEO.mp4" type="video/mp4" />
          <source src="MY_VIDEO.webm" type="video/webm" />
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading
            to a web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank">
              supports HTML5 video
            </a>
          </p>
        </video>
      </body>
    </div>
  );
}
