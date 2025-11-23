"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [count, setCount] = useState(10);
  const [voice, setVoice] = useState("alloy");

  const voices = [
    "alloy",
    "verse",
    "nova",
    "shimmer",
    "echo",
    "fable",
    "mirage",
    "solara"
  ];

  const startQuiz = () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }

    localStorage.setItem("topic", topic);
    localStorage.setItem("language", language);
    localStorage.setItem("count", String(count));
    localStorage.setItem("voice", voice);

    router.push("/quiz");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full">

        <h1 className="text-4xl font-bold text-center mb-10">
          🎓 Start Your Quiz
        </h1>

        {/* TOPIC */}
        <label className="font-semibold">Topic</label>
        <input
          type="text"
          placeholder="Enter topic (e.g., Probability, GK...)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-3 border rounded-lg mb-6"
        />

        {/* LANGUAGE */}
        <label className="font-semibold">Language</label>
        <select
          className="w-full p-3 border rounded-lg mb-6"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Marathi</option>
          <option>Tamil</option>
          <option>Telugu</option>
          <option>Gujarati</option>
        </select>

        {/* COUNT */}
        <label className="font-semibold">Number of Questions</label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full p-3 border rounded-lg mb-6"
        />

        {/* VOICE */}
        <label className="font-semibold">AI Voice</label>
        <select
          className="w-full p-3 border rounded-lg mb-6"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        >
          {voices.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        {/* START BUTTON */}
        <button
          onClick={startQuiz}
          className="w-full bg-blue-600 text-white p-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition"
        >
          Start Quiz 🚀
        </button>

      </div>
    </div>
  );
}
