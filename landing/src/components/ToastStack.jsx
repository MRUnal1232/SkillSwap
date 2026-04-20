import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatSocket } from "@/context/ChatSocketContext";

export function ToastStack() {
  const { toasts, dismissToast } = useChatSocket();
  const navigate = useNavigate();

  return (
    <div
      className="pointer-events-none fixed z-[80] bottom-6 right-6 flex flex-col gap-3 w-[min(92vw,360px)]"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => {
              navigate("/chat");
              dismissToast(t.id);
            }}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pointer-events-auto liquid-glass rounded-2xl p-4 text-left flex items-start gap-3 hover:bg-white/[0.04] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {t.sender_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
                {t.message}
              </p>
            </div>
            <span
              role="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(t.id);
              }}
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
