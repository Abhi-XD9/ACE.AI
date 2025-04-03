import React, { useEffect, useState, useRef, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleGenAI } from "@google/genai";
import {useNavigate } from 'react-router-dom';
import { ConversationContext } from './ConversationContext';

export default function Home() {
    const { conversation, setConversation,formatResponse } = useContext(ConversationContext);
    const [search, setSearch] = useState('')
    const [mode, setMode] = useState('dark')
    const [isOn, setIsOn] = useState(false)
    const [isRecording, setISrecording] = useState(false)
    const mediaRecorderRef = useRef(null)
    const recognitionRef = useRef(null)
    const [error, setError] = useState('')
    const navigate = useNavigate();

    useEffect(() => {
        window.speechSynthesis.cancel()
    }, [])

    const API_Key = import.meta.env.VITE_OPENAI_API_KEY

    const ai = new GoogleGenAI({ apiKey: API_Key })

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.start()
        setISrecording(true)

        recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        recognitionRef.current.onresult = (e) => {
            const text = e.results[0][0].transcript
            console.log(text)
            setSearch(text)
        }

        recognitionRef.current.start()
        window.speechSynthesis.cancel()
    }

    const stopRecording = () => {
        mediaRecorderRef.current.stop()
        const stream = mediaRecorderRef.current.stream;
        stream.getTracks().forEach(track => track.stop())
        setISrecording(false)
        if (search.trim() === '') {
            setError('Ask or Type Something Below.')
        } else {
            getResponse()
        }

    }

    const newChat = () => {
        setConversation([]);
        setSearch('');
        window.speechSynthesis.cancel()
    }

    const changeMode = () => {
        setMode(prevMode => (prevMode === 'dark' ? 'light' : 'dark'))
        setIsOn(prev => !prev);
    }

    async function getResponse() {
        if (search.trim() === '') {
            setError('Ask or Type Something Below.')
        } else {

            const messageHistory = conversation.map(msg => `${msg.user}: ${msg.text}`).join('\n')
            const userMessage = { user: 'Abhi', text: search }
            const fullMessage = `${messageHistory}\n${userMessage.user}: ${userMessage.text}`

            try {
                const textResponse = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: fullMessage,
                    config: {
                        maxTokens: 300,
                        temperature: 0.1,
                    },
                })

               
                const response = formatResponse(textResponse.text)

                setConversation([...conversation, userMessage, { user: 'AI', text: response }])
                setSearch('')
                setError('')
            } catch (err) {
                console.error('Error fetching response:', err)
                setError('An error occurred while fetching the response.')
            }
        }
        window.speechSynthesis.cancel()
    }

    const speakResponse = (text) => {
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
    }
    const stopResponse = () => {
        window.speechSynthesis.cancel()
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
                <h1 className='heading text-center mb-5'>How Can I Help You.</h1>
                <div className='conversation d-flex flex-column flex-grow-1'>
                    {conversation.map((msg, index) => (

                        <div className={`${msg.user === 'AI' ? 'ai-mssg' : 'message'}`}>

                            <p className={`${msg.user === 'AI' ? 'ai-mssg-cont' : 'user-message'}`} key={index} dangerouslySetInnerHTML={{ __html: msg.text }} />
                            <button className={`bg-${mode} text-primary`} onClick={() => speakResponse(msg.text)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-down" viewBox="0 0 16 16">
                                    <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11M12.025 8a4.5 4.5 0 0 1-1.318 3.182L10 10.475A3.5 3.5 0 0 0 11.025 8 3.5 3.5 0 0 0 10 5.525l.707-.707A4.5 4.5 0 0 1 12.025 8" />
                                </svg>
                            </button>
                            <button className={`bg-${mode} text-primary`} onClick={() => stopResponse(msg.text)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-mute" viewBox="0 0 16 16">
                                    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0" />
                                </svg>
                            </button>

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
                    <button className='form-btn' onClick={()=> navigate('/image')}>
                       
                       <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
                            <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                            <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                        </svg>
                      
                    </button>
                    <textarea
                        onChange={(e) => { setSearch(e.target.value); }}
                        placeholder='Message ACE or @mention Agent....'
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
