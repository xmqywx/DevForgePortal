import { LuMessageSquare } from "react-icons/lu";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <LuMessageSquare className="w-10 h-10 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Feedback</h2>
      <p className="text-gray-400">Feedback coming soon</p>
    </div>
  );
}
