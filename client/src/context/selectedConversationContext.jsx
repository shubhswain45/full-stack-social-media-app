import React, { createContext, useState, useContext } from 'react';

const selectedConversationContext = createContext();

export const SelectedConversationProvider = ({ children }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <selectedConversationContext.Provider value={{ selectedConversation, setSelectedConversation }}>
      {children}
    </selectedConversationContext.Provider>
  );
};

export const useselectedConversation = () => {
  const context = useContext(selectedConversationContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
