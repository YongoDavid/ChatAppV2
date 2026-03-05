import { useState } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore, demoHelpers } from "../store/useChatStore";

const ICON_NAMES = [
  "MessageSquare",
  "PaperPlane",
  "Smile",
  "Bell",
  "Star",
  "Heart",
  "Zap",
  "Inbox",
  "Send",
];

const AuthImagePattern = ({ title, subtitle }) => {
  const [popped, setPopped] = useState(null);
  const [announce, setAnnounce] = useState("");
  const navigate = useNavigate();

  const handleClick = async (i) => {
    setPopped(i);

    // Create a temporary demo auth user (no real socket connection)
    const authStore = useAuthStore.getState();
    const chatStore = useChatStore;

    authStore.startDemoSession();

    // create demo conversation data and populate chat store
    const demo = demoHelpers.createDemoData();
    // set users, messages and selected user directly on the store
    if (chatStore && typeof chatStore.setState === "function") {
      chatStore.setState({ users: demo.users, messages: demo.messages, selectedUser: demo.contact });
    }

    // Announce to screen readers and navigate to the app home
    const announceText = "Started a temporary demo session. Signed in as Demo User and opened a sample chat.";
    setAnnounce(announceText);

    // brief pop then navigate so animation is visible
    setTimeout(() => {
      setPopped(null);
      navigate("/");
    }, 420);
  };

  const handleKey = (e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(i);
    }
  };

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 auth-panel">
      <div className="max-w-md text-center">
        <div className="auth-boxes grid grid-cols-3 gap-3 mb-6" role="list">
          {ICON_NAMES.map((name, i) => {
            const Icon = Icons[name] || Icons.MessageSquare;
            return (
              <button
                key={name}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => handleKey(e, i)}
                className={`auth-box aspect-square rounded-2xl flex items-center justify-center ui-transition ${
                  popped === i ? "pop" : ""
                }`}
                aria-label={`Start demo: ${name}`} 
                aria-pressed={false}
                role="listitem"
              >
                <Icon className="auth-box-icon text-white/95" size={28} />
              </button>
            );
          })}
        </div>

        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>

        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-base-content/60 mb-2">{subtitle}</p>

        <div className="text-sm text-base-content/50">Tap any icon to start a short demo session of this social chat app</div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
