import React, { createContext, useState } from 'react';

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
     const [conversation, setConversation] = useState([])

     const formatResponse = (responseText) => {
       

        return responseText
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') 
        .replace(/\*([^*]+)\*/g, '<em>$1</em>') 
        .replace(/•/g, '<li>')
        .replace(/(https?:\/\/[^\s<\[\]()]+)/g, '<a href="$1" target="_blank">$1</a>') 
        .replace(/(www\.[^\s<\[\]()]+)/g, '<a href="http://$1" target="_blank">$1</a>') 
        .replace(/href="?(https?:\/\/[^\s"'>\[\]()]+)"?[^>]*>/g, '<a href="$1" target="_blank">$1</a>') 
        .replace(/(https?:\/\/[^\s<\[\]()]+)(<\/a>)?/g, '<a href="$1" target="_blank">$1</a>') 
        .replace(/\n/g, '<br/>')
        .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
        .replace(/<li>(.*?)<\/li>/g, '<ul>$1</ul>') 

    }

    return (
        <ConversationContext.Provider value={{ conversations, setConversations,formatResponse, conversation, setConversation }}>
            {children}
        </ConversationContext.Provider>
    );
};
