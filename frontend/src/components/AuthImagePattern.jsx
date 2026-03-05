import { useState } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore, demoHelpers } from "../store/useChatStore";
import { motion } from "framer-motion";

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

const AnimatedText = ({ text, className, delayOffset = 0, stagger = 0.05 }) => {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { delayChildren: delayOffset, staggerChildren: stagger }
        }
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.div>
  );
};

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

  const wordStagger = 0.05;
  const titleWordsCount = title ? title.split(" ").length : 0;
  const subWordsCount = subtitle ? subtitle.split(" ").length : 0;
  const bottomText = "Experience the magic instantly. Tap an icon to launch a live demo.";
  const bottomWordsCount = bottomText.split(" ").length;

  const titleDelay = 0.3;
  const subDelay = titleDelay + (titleWordsCount * wordStagger) + 0.1;
  const bottomDelay = subDelay + (subWordsCount * wordStagger) + 0.1;
  const gridDelay = bottomDelay + (bottomWordsCount * wordStagger) + 0.3;

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 auth-panel overflow-hidden">
      <div className="max-w-md text-center">
        <motion.div
          className="auth-boxes grid grid-cols-3 gap-3 mb-6"
          role="list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: gridDelay, staggerChildren: 0.1 }
            }
          }}
        >
          {ICON_NAMES.map((name, i) => {
            const Icon = Icons[name] || Icons.MessageSquare;
            return (
              <motion.button
                key={name}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => handleKey(e, i)}
                className={`auth-box aspect-square rounded-2xl flex items-center justify-center ui-transition ${popped === i ? "pop" : ""
                  }`}
                aria-label={`Start demo: ${name}`}
                aria-pressed={false}
                role="listitem"
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="auth-box-icon text-white/95" size={28} />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>

        <AnimatedText
          text={title}
          className="text-2xl font-bold mb-3 flex flex-wrap justify-center"
          delayOffset={titleDelay}
          stagger={wordStagger}
        />
        <AnimatedText
          text={subtitle}
          className="text-base-content/60 mb-2 flex flex-wrap justify-center"
          delayOffset={subDelay}
          stagger={wordStagger}
        />
        <AnimatedText
          text={bottomText}
          className="text-sm text-base-content/50 flex flex-wrap justify-center"
          delayOffset={bottomDelay}
          stagger={wordStagger}
        />
      </div>
    </div>
  );
};

export default AuthImagePattern;
