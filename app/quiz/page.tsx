"use client";

import { useEffect, useState } from "react";

// ========== GLOBAL AUDIO CONTROL (Prevents Echo) ==========
let currentAudio: HTMLAudioElement | null = null;

const playBase64Audio = (b64: string) => {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio("data:audio/mp3;base64," + b64);
    currentAudio.play();
  } catch (err) {
    console.log("Audio error:", err);
  }
};

export default function Quiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [showAns, setShowAns] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dark, setDark] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const progress = ((index + 1) / questions.length) * 100;

  const topic =
    typeof window !== "undefined" ? localStorage.getItem("topic") || "" : "";
  const language =
    typeof window !== "undefined"
      ? localStorage.getItem("language") || ""
      : "";
  const count =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("count") || 20)
      : 20;

  const voice =
    typeof window !== "undefined"
      ? localStorage.getItem("voice") || "alloy"
      : "alloy";

// ========== FINAL FIXED SPEAK FUNCTION ==========
const speak = async (text: string) => {
  if (!text) return;

  try {
    const res = await fetch("https://terrific-love-production.up.railway.app/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    const data = await res.json();
    if (data.audio) playBase64Audio(data.audio);
  } catch (err) {
    console.log("TTS ERROR:", err);
  }
};

  // ========== FETCH QUESTIONS ==========
const fetchQuestions = async () => {
  setLoading(true);

  const res = await fetch(
    "https://terrific-love-production.up.railway.app/generate-questions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, language, count }),
    }
  );

  const data = await res.json();
  const parsed = parseQuestions(data.raw);

  setQuestions(parsed);
  setLoading(false);

  // Speak first question
  speak(parsed[0].question);
};

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ========== AUTO READ QUESTION ==========
  useEffect(() => {
    if (questions.length > 0) {
      speak(questions[index].question);
    }
  }, [index, questions]);

  // ========== AUTO READ ANSWER ==========
  useEffect(() => {
    if (showAns && questions[index]) {
      speak("The correct answer is " + questions[index].options[questions[index].correct]);
    }
  }, [showAns]);

  // ========== TIMER ==========
// ========== TIMER ==========
useEffect(() => {
  if (loading) return;

  setTimeLeft(10);

  const interval = setInterval(() => {
    setTimeLeft((t) => {
      // When timer hits 0 → show answer
      if (t <= 1) {
        setShowAns(true);

        // Auto NEXT after 3 seconds of showing answer
        setTimeout(() => {
          if (index + 1 < questions.length) {
            setIndex((prev) => prev + 1);
            setShowAns(false);
          }
        }, 8000);

        return 10;
      }

      return t - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [index, loading]);

  // ========== NEXT ==========
  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setShowAns(false);
    }
  };

  // ========== PREVIOUS ==========
  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setShowAns(false);
    }
  };

  if (loading) {
    return (
      <h1 className="text-center p-10 text-3xl font-bold">
        ⏳ Generating Quiz...
      </h1>
    );
  }

  const q = questions[index];

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-gray-100"} min-h-screen p-6`}>

      {/* ========== TOP BAR ========== */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setDark(!dark)}
          className="px-4 py-2 rounded bg-gray-700 text-white"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={() => toggleFullscreen()}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Full Screen
        </button>
      </div>

      {/* ========== PROGRESS BAR ========== */}
      <div className="w-full bg-gray-300 rounded-full h-4 mb-6">
        <div
          className="bg-green-500 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ========== TIMER CIRCLE ========== */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex justify-center items-center text-2xl font-bold">
          {timeLeft}
        </div>
      </div>

      {/* ========== QUESTION ========== */}
      <h2 className="text-3xl text-center font-bold mb-10 leading-snug">
        {q.question}
      </h2>

      {/* ========== OPTIONS ========== */}
      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mb-10">
        {q.options.map((opt: string, i: number) => (
          <div
            key={i}
            className="border p-5 rounded-2xl text-2xl cursor-pointer"
            style={{
              background: showAns
                ? q.correct === i
                  ? "#c8e6c9" // green
                  : "#ffcdd2" // red
                : "",
            }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </div>
        ))}
      </div>

      {/* ========== BUTTONS ========== */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={prev}
          className="bg-gray-500 text-white px-6 py-3 rounded text-xl"
        >
          ⬅ Prev
        </button>

        {!showAns ? (
          <button
            onClick={() => setShowAns(true)}
            className="bg-green-600 text-white px-6 py-3 rounded text-xl"
          >
            Show Answer ✔
          </button>
        ) : (
          <button
            onClick={next}
            className="bg-blue-600 text-white px-6 py-3 rounded text-xl"
          >
            Next ➡
          </button>
        )}
      </div>

      <p className="text-center mt-6 text-gray-400">
        Question {index + 1} of {questions.length}
      </p>
    </div>
  );
}

// ========== PARSE AI RAW TEXT ==========
function parseQuestions(raw: string) {
  const blocks = raw
    .split("\n\n")
    .filter((b) => b.includes("a)") && b.includes("Correct"));

  const list: any[] = [];

  blocks.forEach((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    const qline = lines[0];
    const question = qline.includes(")")
      ? qline.split(")").slice(1).join(")").trim()
      : qline;

    const options = [
      lines[1].replace("a)", "").trim(),
      lines[2].replace("b)", "").trim(),
      lines[3].replace("c)", "").trim(),
      lines[4].replace("d)", "").trim(),
    ];

    const correctLetter = lines[5].split(":")[1].trim().toLowerCase();
    const correctIndex = correctLetter.charCodeAt(0) - 97;

    list.push({ question, options, correct: correctIndex });
  });

  return list;
}

// ========== FULL SCREEN ==========
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
