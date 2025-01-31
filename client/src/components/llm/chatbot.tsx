import React, { useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [id, setId] = useState<string | undefined>();
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    // Guard for empty input
    if (!input.trim()) return;

    // Add the user's message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input, sender: "user" },
    ]);

    // Clear the input
    setInput("");

    // Make your server call
    fetch("/api/llm/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, chat_id: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Add the bot's response
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: data.response, sender: "bot" },
        ]);
        setId(data.id);
      })
      .catch((err) => {
        console.error("Error:", err);
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: "Désolé, il y a eu un problème lors de votre requête", sender: "bot" },
        ])
      });
  };

  // Handle the Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission/new line if needed
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-full max-w-md shadow-lg rounded-lg border border-gray-200 bg-white z-50">
      <div className="p-4 bg-custom-blue text-white text-center font-bold rounded-t-lg">
        Chatbot
      </div>

      {/* Chat history */}
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
      </div>

      {/* Input + Send button */}
      <div className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // <- Press Enter to send
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
