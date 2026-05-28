import { useEffect, useRef, useState } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<
    | {
        sentiment: "positive" | "negative";
        confidence: number;
        text: string;
      }
    | null
  >(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const fadeDuration = 0.5;
    let isActive = true;

    // Manual fade loop driven by playback time.
    const updateOpacity = () => {
      if (!isActive) {
        return;
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
      let opacity = 1;

      if (duration > 0) {
        if (current < fadeDuration) {
          opacity = current / fadeDuration;
        } else if (duration - current < fadeDuration) {
          opacity = Math.max(0, (duration - current) / fadeDuration);
        }
      }

      video.style.opacity = opacity.toFixed(3);
      rafRef.current = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      window.setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    video.style.opacity = "0";
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(updateOpacity);

    return () => {
      isActive = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text to analyze.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as {
        sentiment: "positive" | "negative";
        confidence: number;
        text: string;
      };

      setResult({
        sentiment: data.sentiment,
        confidence: data.confidence,
        text: data.text,
      });
    } catch (err) {
      setError("Unable to analyze right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background px-6 py-16 text-foreground font-body">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={VIDEO_URL}
          muted
          autoPlay
          playsInline
          preload="auto"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-2xl rounded-3xl border border-black/10 bg-white/80 p-8 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
          Sentiment Lab
        </div>
        <h1 className="font-display text-3xl text-black sm:text-4xl">
          Sentiment Analyzer
        </h1>
        <p className="mt-2 text-sm text-muted">
          Type a sentence and get a positive or negative result.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
            Realtime inference
          </span>
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
            Local model
          </span>
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
            Private inputs
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <label className="text-sm font-medium text-black" htmlFor="sentiment-input">
            Analyze sentiment
          </label>
          <textarea
            id="sentiment-input"
            className="min-h-[140px] w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30"
            placeholder="Example: I love this product!"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted">
              Tip: try "This is surprisingly good"
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-black px-8 py-3 text-sm text-white transition-transform duration-200 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {result ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              result.sentiment === "positive"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="font-semibold uppercase tracking-wide">
              {result.sentiment}
            </div>
            <div className="mt-1 text-xs">
              Confidence: {result.confidence}%
            </div>
            <div className="mt-1 text-xs opacity-80">"{result.text}"</div>
          </div>
        ) : null}

        <div className="mt-6 border-t border-black/10 pt-4 text-xs text-muted">
          Model: TF-IDF + Logistic Regression · API: /predict
        </div>
      </section>
    </div>
  );
}
