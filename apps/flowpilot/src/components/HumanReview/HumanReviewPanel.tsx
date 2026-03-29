import { useState, useEffect, useRef } from "react";
import type { HumanReviewState } from "../../hooks/useWorkflowStore";

interface Props {
  review: HumanReviewState;
}

const gradeColors: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-yellow-600",
  D: "text-orange-600",
  F: "text-red-600",
};

export default function HumanReviewPanel({ review }: Props) {
  const [timeLeft, setTimeLeft] = useState(review.timeoutSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setTimeLeft(review.timeoutSeconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          review.resolve(null); // timeout — AI choice stands
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [review]);

  const handleSelect = (option: string) => {
    clearInterval(intervalRef.current);
    review.resolve(option);
  };

  const pct = (timeLeft / review.timeoutSeconds) * 100;

  return (
    <div className="border-2 border-amber-400 bg-amber-50 rounded-lg p-4 mx-4 my-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-semibold text-sm">HUMAN REVIEW TRIGGERED</span>
          <span className={`text-xs font-bold ${gradeColors[review.aiGrade]}`}>
            Grade: {review.aiGrade} ({Math.round(review.aiConfidence * 100)}%)
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {timeLeft}s / {review.timeoutSeconds}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div
          className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* AI's reasoning */}
      {review.reasoning?.summary && (
        <p className="text-xs text-gray-600 mb-3">
          AI reasoning: {review.reasoning.summary}
        </p>
      )}

      <div className="text-xs text-gray-500 mb-2">
        AI chose: <span className="font-mono font-medium">{review.aiDecision}</span>
        &nbsp;&mdash;&nbsp;Override:
      </div>

      {/* Override buttons */}
      <div className="flex flex-wrap gap-2">
        {review.availableOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              option === review.aiDecision
                ? "border-amber-400 bg-amber-100 text-amber-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
