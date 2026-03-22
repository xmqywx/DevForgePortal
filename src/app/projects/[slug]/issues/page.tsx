import { LuCircleAlert } from "react-icons/lu";

export default function IssuesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <LuCircleAlert className="w-10 h-10 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Issues</h2>
      <p className="text-gray-400">Issues coming soon</p>
    </div>
  );
}
