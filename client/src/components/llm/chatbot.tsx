import React, { useState } from "react";
import { RotateCcw } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  type?: "error";
  retry?: () => void;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
    },
  ]);
  const [id, setId] = useState<string | undefined>();
  const [input, setInput] = useState<string>("");

  const send = (message: string, retry?: boolean) =>
    fetch("/api/llm/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, chat_id: id }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }

        return res.json();
      })
      .then((data) => {
        // Ajouter la réponse du chatbot
        setMessages((prev) => [
          ...(retry ? prev.slice(0, -1) : prev),
          { id: Date.now(), text: data.response, sender: "bot" },
        ]);
        setId(data.id);
      })
      .catch((err) => {
        console.error("Error:", err);
        setMessages((prev) => [
          ...(retry ? prev.slice(0, -1) : prev),
          {
            id: Date.now(),
            type: "error",
            text: "Désolé, il y a eu un problème lors de votre requête",
            sender: "bot",
            retry: () => send(message, true),
          },
        ]);
      });

  const handleSend = () => {
    // Vérifier si l'entrée est vide
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input, sender: "user" },
    ]);

    // Effacer le champ de saisie
    setInput("");

    // Appeler votre serveur
    send(input);
  };

  // Gérer l'appui sur la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche l'envoi du formulaire / saut de ligne si nécessaire
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-full max-w-md shadow-lg rounded-lg border border-gray-200 bg-white z-50">
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
            } ${message.type === "error" ? " bg-red-500" : ""}`}
          >
            <p className="inline-flex items-center">
              {message.text}{" "}
              {message.type === "error" && (
                <RotateCcw
                  className="relative cursor-pointer"
                  onClick={message.retry}
                />
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Zone de saisie + bouton d'envoi */}
      <div className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // <- Appuie sur Entrée pour envoyer
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
          placeholder="Tapez votre message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
