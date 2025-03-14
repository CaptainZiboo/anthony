"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface TextSizeContextType {
  fontSize: string;
  setFontSize: (size: string) => void;
}


const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);


export const TextSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<string>("base");  


  return (
    <TextSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};


export const useTextSize = (): TextSizeContextType => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error("useTextSize must be used within a TextSizeProvider");
  }
  return context;
};
