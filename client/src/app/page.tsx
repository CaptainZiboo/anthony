"use client";
import React, { useState } from "react";
import Chatbot from "@/components/llm/chatbot";
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from "@heroicons/react/24/solid";

const Home: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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

      {/* Le Chatbot est toujours présent, mais caché avec display: none */}
      <Chatbot isVisible={isChatbotOpen} />

      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="absolute bottom-4 right-4 bg-custom-blue text-white px-4 py-2 rounded-full shadow-lg hover:bg-white hover:text-custom-blue border border-custom-blue"
      >
        {isChatbotOpen ? <XMarkIcon className="w-6 h-6" /> : <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default Home;
