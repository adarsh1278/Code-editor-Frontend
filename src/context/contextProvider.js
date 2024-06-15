// src/context/MyContext.js
"use client"
// src/context/contextProvider.js
import React, { createContext, useState } from 'react';

// Create the context
export const MyContext = createContext();

// Create a provider component
export const MyProvider = ({ children }) => {
  const [file, setFile] = useState("initial value");

  return (
    <MyContext.Provider value={{ file, setFile }}>
      {children}
    </MyContext.Provider>
  );
};
