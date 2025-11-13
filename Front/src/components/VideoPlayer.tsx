import { useMemo } from "react";

type VideoPlayerProps = {
  url?: string;
  title?: string;
  className?: string;
  onEnded?: () => void;
};

const isFileSource = (url: string) =>
  /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.startsWith("blob:");

const buildYoutubeEmbed = (url: string) => {
  const match =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/) ||
    [];
  const videoId = match[1];
  if (!videoId) return "";
  return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&fs=1&playsinline=1`;
};

const buildDrivePreview = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const id = match?.[1];
  if (!id) return "";
  return `https://drive.google.com/file/d/${id}/preview`;
};

const normalizeVideoUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube")) return buildYoutubeEmbed(url);
  if (url.includes("youtu.be")) return buildYoutubeEmbed(url);
  if (url.includes("drive.google.com")) return buildDrivePreview(url);
  if (url.includes("vimeo.com") && !url.includes("player.vimeo.com")) {
    const id = url.split("/").pop();
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
};

const VideoPlayer = ({ url, title, className, onEnded }: VideoPlayerProps) => {
  const sanitizedUrl = useMemo(() => (url ? url.trim() : ""), [url]);
  const isFile = useMemo(() => sanitizedUrl && isFileSource(sanitizedUrl), [sanitizedUrl]);

  if (!sanitizedUrl) {
    return (
      <div className={`flex h-[450px] w-full items-center justify-center rounded-xl bg-muted/40 ${className ?? ""}`}>
        <p className="text-sm text-muted-foreground">Video unavailable.</p>
      </div>
    );
  }

  if (isFile) {
    return (
      <video
        key={sanitizedUrl}
        controls
        controlsList="nodownload"
        className={`h-[450px] w-full rounded-xl bg-black ${className ?? ""}`}
        src={sanitizedUrl}
        title={title || "Course lesson"}
        playsInline
        onEnded={onEnded}
      />
    );
  }

  const embedUrl = normalizeVideoUrl(sanitizedUrl);

  return (
    <iframe
      key={embedUrl}
      src={embedUrl}
      title={title || "Course lesson"}
      className={`h-[450px] w-full rounded-xl bg-black ${className ?? ""}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
};

export default VideoPlayer;

