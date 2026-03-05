import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      // If running a local demo session, skip backend and use demo data
      const { isDemoSession } = useAuthStore.getState();
      if (isDemoSession) {
        const demo = demoHelpers.createDemoData();
        set({ users: demo.users });
        return;
      }

      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load users";
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      // If demo session, avoid network and return demo messages
      const { isDemoSession } = useAuthStore.getState();
      if (isDemoSession) {
        const demo = demoHelpers.createDemoData();
        set({ messages: demo.messages });
        return;
      }

      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load messages";
      toast.error(msg);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const { isDemoSession, authUser } = useAuthStore.getState();
      if (isDemoSession) {
        // Create a local message object and append immediately
        const localMsg = {
          _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          senderId: authUser._id,
          receiverId: selectedUser._id,
          text: messageData.text || "",
          image: messageData.image || null,
          createdAt: Date.now(),
        };

        set({ messages: [...messages, localMsg] });

        // Optional: simulate a short auto-reply from the contact
        setTimeout(() => {
          const reply = {
            _id: `local-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            senderId: selectedUser._id,
            receiverId: authUser._id,
            text: "Nice! That works in the demo. Try another message.",
            createdAt: Date.now(),
          };
          set({ messages: [...get().messages, reply] });
        }, 900 + Math.random() * 800);

        return;
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to send message";
      toast.error(msg);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || typeof socket.on !== "function") return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || typeof socket.off !== "function") return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

// Demo utilities appended to the store object for convenience when running local demos
export const demoHelpers = {
  createDemoData: () => {
    const demoContact = { _id: "demo-contact", name: "Ava (Demo)", avatar: null };
    const now = Date.now();
    const demoMessages = [
      { _id: "m1", senderId: "demo-contact", receiverId: "demo-user", text: "Hey! Welcome to this demo of ChatAppV2.", createdAt: now - 1000 * 60 * 8 },
      { _id: "m2", senderId: "demo-user", receiverId: "demo-contact", text: "Thanks! This looks great — how does this work?",
        createdAt: now - 1000 * 60 * 7 },
      { _id: "m3", senderId: "demo-contact", receiverId: "demo-user", text: "It’s a small test social app. Try sending a message or exploring the sidebar.",
        createdAt: now - 1000 * 60 * 5 },
    ];

    return { users: [demoContact], messages: demoMessages, contact: demoContact };
  },
};

// Attach start/clear demo actions directly to the store so components can call them easily.
const _origCreate = null;
// We extend the exported store with functions via the module export pattern.
// Note: callers should import { useChatStore, demoHelpers } from the store module.
