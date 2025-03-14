import React from "react";
import { useTextSize } from "@/context/TextSizeContext";

const TextSizeButton: React.FC = () => {
  const { fontSize, setFontSize } = useTextSize();

  const handleChangeSize = (size: string) => {
    setFontSize(size);
    // Mettre à jour l'attribut data-font-size sur le HTML
    document.documentElement.setAttribute("data-font-size", size);
  };

  return (
    <div className="flex justify-center gap-4 p-4">
      <button
        onClick={() => handleChangeSize("small")}
        className={`px-4 py-2 rounded-md ${fontSize === "small" ? "bg-custom-blue text-white" : "bg-black text-white"}`}
      >
        Petit
      </button>
      <button
        onClick={() => handleChangeSize("base")}
        className={`px-4 py-2 rounded-md ${fontSize === "base" ? "bg-custom-blue text-white" : "bg-black text-white"}`}
      >
        Moyen
      </button>
      <button
        onClick={() => handleChangeSize("large")}
        className={`px-4 py-2 rounded-md ${fontSize === "large" ? "bg-custom-blue text-white" : "bg-black text-white"}`}
      >
        Grand
      </button>
    </div>
  );
};

export default TextSizeButton;
