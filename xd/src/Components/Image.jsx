import React, { useContext, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { ConversationContext } from './ConversationContext';

export default function Image() {
    const { conversations, setConversations,formatResponse } = useContext(ConversationContext);
    const [search,setSearch] = useState('')
    const [mode, setMode] = useState('light');
    const [isOn, setIsOn] = useState(false);
    const [isRecording, setISrecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const [error, setError] = useState('');
    const navigate = useNavigate()


    const API_Key = import.meta.env.VITE_OPENAI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: API_Key  });

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
        setISrecording(true);

        recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognitionRef.current.onresult = (e) => {
            const text = e.results[0][0].transcript;
            console.log(text);
            setSearch(text);
        };

        recognitionRef.current.start();
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        const stream = mediaRecorderRef.current.stream;
        stream.getTracks().forEach(track => track.stop());
        setISrecording(false);
        if (search.trim() === '') {
            setError('Ask or Type Something Below.');
        } else {
            getResponse();
        }
    };

    const newChat = () => {
        setConversations([]);
        setSearch('');
        window.speechSynthesis.cancel();
    };

    const changeMode = () => {
        setMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'));
        setIsOn(prev => !prev);
    };

    async function getResponse() {
        if (search.trim() === '') {
            setError('Ask or Type Something Below.');
        } else {
           
            const userMessage = { user: 'Abhi', text: search };

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash-exp-image-generation",
                    contents: search,
                    config: {
                        responseModalities: ["Text", "Image"],
                    },
                });

                let imgUrl = '';
                for (const part of response.candidates[0].content.parts) {
                    if (part.text) {
                        console.log(part.text);
                    } else if (part.inlineData) {
                        const imageData = part.inlineData.data;
                        const binaryString = atob(imageData);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'image/png' });
                        imgUrl = URL.createObjectURL(blob);
                        console.log("Image URL created:", imgUrl);
                    }
                }

                if (imgUrl) {
                    setSearch('')
                    setConversations([...conversations, userMessage, { user: 'AI', img: imgUrl }]);
                }
               
                const result = formatResponse(response.text)

                setConversations([...conversations, userMessage, { user: 'AI', text: result, img: imgUrl }]);
               setSearch('')
                setError('');
            } catch (err) {
               console.log(err)
            }
        }
    }


    return (
        <div className={`app-cont bg-${mode}`}>
            <div className={`nav d-flex justify-content-between align-items-center bg-${mode}`}>
                <img src="/Images/logo-brand-1.png" width={100} className="logo" alt="" />
                <div className="btn-cont text-center d-flex justify-content-end">
                    <button className={`text-center btn btn-light text-dark me-2 ${isOn ? 'on' : 'off'}`} onClick={changeMode}>
                        {isOn ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-moon-stars" viewBox="0 0 16 16">
                            <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286" />
                            <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
                        </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-brightness-low" viewBox="0 0 16 16">
                                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8m.5-9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m5-5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m-11 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9.743-4.036a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m-7.779 7.779a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m7.072 0a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707M3.757 4.464a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707" />
                            </svg>}
                    </button>
                    <button onClick={newChat} className='btn btn-light text-dark'>New Chat</button>
                </div>
            </div>
            <div className='main-cont d-flex flex-column'>
                <h1 className='heading text-center mb-5'>Thoughts Into Pictures.</h1>
                <div className='conversation d-flex flex-column flex-grow-1'>
                    {conversations.map((msg, index) => (
                        <div className={`${msg.user === 'AI' ? 'ai-mssg' : 'message'}`} key={index}>

                            {msg.text && <p className={`${msg.user === 'AI' ? 'ai-mssg-cont' : 'user-message'}`} dangerouslySetInnerHTML={{ __html: msg.text }}/>}
                            {msg.img && <img className='ai-img' src={msg.img} alt="Generated" />}
                        </div>
                    ))}
                </div>
                <p className='container text-danger'>{error}</p>
                <div className='input-cont input-group'>
                    <button className='form-btn' onClick={isRecording ? stopRecording : startRecording}>
                        {isRecording ? <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="red" className="bi bi-stop-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                            <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5z" />
                        </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-mic" viewBox="0 0 16 16">
                                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3" />
                            </svg>
                        }
                    </button>

                    <button className='form-btn' onClick={() => navigate('/')}>

                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-chat-text" viewBox="0 0 16 16">
                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                            <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5" />
                        </svg>

                    </button>
                    <textarea
                        onChange={(e) => { setSearch(e.target.value); }}
                        placeholder='Type Something to Convert it to as an Image'
                        className='form-control pt-2 text-center'
                        value={search}
                        rows="3"
                    />
                    <button onClick={getResponse} className='form-btn text-dark'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0 A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
