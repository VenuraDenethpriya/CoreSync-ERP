import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";

export default function AudioPlayer({ url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;

    document.querySelectorAll("audio").forEach(a => {
      if (a !== audio) a.pause();
    });

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    link.click();
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("play", () => setPlaying(true));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 shadow-sm w-44">
      <button
        onClick={togglePlay}
        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition"
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <div className="flex-1 h-1 bg-gray-200 rounded-full relative overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <button
        onClick={handleDownload}
        className="p-1 hover:bg-gray-100 rounded-full transition"
        title="Download recording"
      >
        <Download size={16} className="text-gray-700" />
      </button>

      <audio ref={audioRef} src={url} preload="none" />
    </div>
  );
}
