import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  type?: "error";
  retry?: () => void;
}

interface ChatbotProps {
  isVisible: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isVisible, onClose }) => {
  const initialMessage: Message = {
    id: 1,
    text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    sender: "bot",
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
  });

  const [id, setId] = useState<string | undefined>(localStorage.getItem("chatId") || undefined);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(
    JSON.parse(localStorage.getItem("isLoading") || "false")
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (id) {
      localStorage.setItem("chatId", id);
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem("isLoading", JSON.stringify(isLoading));
  }, [isLoading]);

  // 🔄 Redémarrer une requête en attente après réouverture
  useEffect(() => {
    const pendingMessage = localStorage.getItem("pendingMessage");
    if (isLoading && pendingMessage) {
      handleSend(pendingMessage, true);
    }
  }, []);

  // Gestion de la fermeture avec la touche Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onClose]);

  // Gérer le focus lorsque le chatbot devient visible
  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  const handleSend = (overrideInput?: string, isRetry = false) => {
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading) return;

    setMessages((prev) => [...prev, { id: Date.now(), text: messageToSend, sender: "user" }]);

    if (!isRetry) {
      setInput("");
      localStorage.setItem("pendingMessage", messageToSend);
    }

    setIsLoading(true);

    fetch("/api/llm/chat", {
      method: "POST",
      body: JSON.stringify({ message: messageToSend, chat_id: id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [...prev, { id: Date.now(), text: data.response, sender: "bot" }]);
        setId(data.id);
        localStorage.removeItem("pendingMessage");
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Désolé, une erreur est survenue. Réessayez plus tard.",
            sender: "bot",
            type: "error",
            retry: () => handleSend(messageToSend, true),
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chatbot"
      className="fixed inset-0 flex items-end justify-center z-50 sm:items-center sm:justify-end transition-opacity"
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
      >
        <div className="p-4 bg-custom-blue text-white text-center font-bold rounded-t-lg">
          Chatbot
        </div>

        {/* Historique des messages */}
        <div
          className="p-4 flex-1 overflow-y-scroll space-y-4"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  message.sender === "bot"
                    ? "bg-custom-blue text-white"
                    : "bg-blue-500 text-white"
                } ${
                  message.type === "error" ? "bg-red-500" : ""
                } ${
                  // Ajout d'un décalage pour l'effet quinconce
                  index % 2 === 0
                    ? message.sender === "bot"
                      ? "ml-0"
                      : "mr-0"
                    : message.sender === "bot"
                      ? "ml-4"
                      : "mr-4"
                }`}
              >
                <p className="inline-flex items-center">
                  {message.text}{" "}
                  {message.type === "error" && message.retry && (
                    <button
                      onClick={message.retry}
                      aria-label="Réessayer d'envoyer le message"
                      className="ml-2 text-sm underline"
                    >
                      Réessayer
                    </button>
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Animation "isTyping" avec 3 points sautants */}
          {isLoading && (
            <div
              className="flex justify-start"
              aria-label="Le bot est en train de taper..."
            >
              <div className="p-3 bg-gray-200 text-gray-600 rounded-lg max-w-xs text-sm flex items-center space-x-1">
                <span className="text-lg animate-bounce1">•</span>
                <span className="text-lg animate-bounce2">•</span>
                <span className="text-lg animate-bounce3">•</span>
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie + bouton d'envoi */}
        <div className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Tapez votre message..."
            aria-label="Zone de saisie du message"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="ml-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Envoyer le message"
          >
            Envoyer
          </button>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-custom-blue rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fermer le chatbot"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Ajout des styles pour l'animation */}
        <style jsx>{`
          @keyframes bounce {
            0%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
            }
          }

          .animate-bounce1 {
            animation: bounce 1.2s infinite ease-in-out;
          }

          .animate-bounce2 {
            animation: bounce 1.2s infinite ease-in-out;
            animation-delay: 0.2s;
          }

          .animate-bounce3 {
            animation: bounce 1.2s infinite ease-in-out;
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Chatbot;
