import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './Components/Home';
import Image from './Components/Image';
import { ConversationProvider } from './Components/ConversationContext';

function App() {
  return (
    <ConversationProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image" element={<Image />} />
        </Routes>
      </HashRouter>
    </ConversationProvider>
  );
}

export default App;
