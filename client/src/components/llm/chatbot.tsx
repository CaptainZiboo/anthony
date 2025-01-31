import React, { useState, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

interface ChatbotProps {
  isVisible: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isVisible }) => {
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
          { id: Date.now(), text: "Désolé, une erreur est survenue. Réessayez plus tard.", sender: "bot" },
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

  return (
    <div
      className="fixed bottom-20 right-4 w-full max-w-md shadow-lg rounded-lg border border-gray-200 bg-white z-50 transition-opacity"
      style={{ display: isVisible ? "block" : "none" }}
    >
      <div className="p-4 bg-custom-blue text-white text-center font-bold rounded-t-lg">
        Chatbot
      </div>

      {/* Historique des messages */}
      <div className="p-4 h-96 overflow-y-scroll flex flex-col space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg max-w-xs ${
              message.sender === "bot"
                ? "bg-custom-blue text-white self-start"
                : "bg-blue-500 text-white self-end"
            }`}
          >
            {message.text}
          </div>
        ))}

        {/* Animation "isTyping" avec 3 points sautants */}
        {isLoading && (
          <div className="self-start p-3 bg-gray-200 text-gray-600 rounded-lg max-w-xs text-sm flex items-center space-x-1">
            <span className="text-lg animate-bounce1">•</span>
            <span className="text-lg animate-bounce2">•</span>
            <span className="text-lg animate-bounce3">•</span>
          </div>
        )}
      </div>

      {/* Zone de saisie + bouton d'envoi */}
      <div className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Tapez votre message..."
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading}
          className="ml-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </div>

      {/* Ajout des styles pour l'animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
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
  );
};

export default Chatbot;
