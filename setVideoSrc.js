import { Hls } from "./hls-es.js";

export const setVideoSrc = (video, url, autoplay = true) => {
  if (video.canPlayType("application/vnd.apple.mpegurl") != "") {
    console.log("supported m3u8 native");
    video.src = url;
    if (autoplay) {
      video.play();
    }
    return;
  }

  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    if (autoplay) {
      video.play();
    }
  });
};
