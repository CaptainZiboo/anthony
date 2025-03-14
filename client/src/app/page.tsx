"use client";
import React, { useState, useRef } from "react";
import Chatbot from "@/components/llm/chatbot";
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Home: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const handleToggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
    toggleButtonRef.current?.focus(); // Retourner le focus au bouton après fermeture
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-grow">
        <iframe
          className="w-full h-screen"
          id="antony"
          title="Site d'antony"
          src="https://www.ville-antony.fr/demarches"
          style={{ border: 0 }}
        />
      </main>

      {/* Le Chatbot est conditionnellement rendu */}
      <Chatbot isVisible={isChatbotOpen} onClose={handleCloseChatbot} />

      <button
        onClick={handleToggleChatbot}
        ref={toggleButtonRef}
        className="fixed bottom-4 right-4 bg-custom-blue text-white px-4 py-2 rounded-full shadow-lg hover:bg-white hover:text-custom-blue border border-custom-blue focus:outline-none focus:ring-2 focus:ring-custom-blue"
        aria-label={isChatbotOpen ? "Fermer le chatbot" : "Ouvrir le chatbot"}
      >
        {isChatbotOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default Home;
