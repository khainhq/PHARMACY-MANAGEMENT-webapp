import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { sendMessageToChatbot } from '../services/chatbotService';

// Theme Colors
const primaryGreen = '#2E7D32';
const lightGreenBackground = '#E8F5E9';
const chatBodyBg = '#F7F9F7';
const textColor = '#333333';
const borderColor = '#D0D0D0';

const ChatbotToggle = styled.button`
  position: fixed;
  bottom: 25px;
  right: 25px;
  background-color: ${primaryGreen};
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #1B5E20;
    transform: scale(1.05);
  }
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 25px;
  width: 370px;
  height: 550px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(20px)'};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const ChatHeader = styled.div`
  background-color: ${primaryGreen};
  color: white;
  padding: 15px 20px;
  font-size: 1.1em;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const ChatBody = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${chatBodyBg};
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${chatBodyBg};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #B0BEC5;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #90A4AE;
  }
`;

const MessageTimestamp = styled.span`
  font-size: 0.75em;
  color: #757575;
  margin-top: 4px;
  display: block;
`;

const MessageBubble = styled.div`
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.45;
  font-size: 0.95em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;

  &.user {
    align-self: flex-end;
    ${MessageBubble} {
      background-color: ${lightGreenBackground};
      color: ${textColor};
      border-bottom-right-radius: 6px;
    }
    ${MessageTimestamp} {
      align-self: flex-end;
    }
  }

  &.bot {
    align-self: flex-start;
    ${MessageBubble} {
      background-color: #FFFFFF;
      color: ${textColor};
      border: 1px solid #ECEFF1;
      border-bottom-left-radius: 6px;
    }
    ${MessageTimestamp} {
      align-self: flex-start;
    }
  }
`;

const UserInput = styled.form`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid ${borderColor};
  background-color: white;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px 18px;
  border: 1px solid ${borderColor};
  border-radius: 25px;
  margin-right: 12px;
  font-size: 0.95em;
  color: ${textColor};
  background-color: #FDFDFD;

  &:focus {
    outline: none;
    border-color: ${primaryGreen};
    box-shadow: 0 0 0 2px rgba(46, 125, 50, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  background-color: ${primaryGreen};
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1B5E20;
  }

  &:disabled {
    background-color: #A5D6A7;
    cursor: not-allowed;
  }
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Welcome to PharmaCore. How can I assist you today?", isUser: false, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage = { text: trimmedInput, isUser: true, timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    try {
      const reply = await sendMessageToChatbot(trimmedInput);
      const botMessage = { text: reply, isUser: false, timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = { text: 'Lỗi: Không thể kết nối với chatbot', isUser: false, timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  return (
    <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
      <>
        <ChatbotToggle onClick={toggleChat} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
          {isOpen ? <FiX /> : <FiMessageSquare />}
        </ChatbotToggle>
        <ChatbotContainer $isOpen={isOpen}>
          <ChatHeader>
            Pharmacy Assistant
            <CloseButton onClick={toggleChat} aria-label="Close chat"><FiX /></CloseButton>
          </ChatHeader>
          <ChatBody ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <Message key={index} className={msg.isUser ? 'user' : 'bot'}>
                <MessageBubble>{msg.text}</MessageBubble>
                <MessageTimestamp>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </MessageTimestamp>
              </Message>
            ))}
          </ChatBody>
          <UserInput onSubmit={handleSubmit}>
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask me anything..."
              aria-label="Chat input"
            />
            <SendButton type="submit" disabled={!inputValue.trim()} aria-label="Send message">
              <FiSend />
            </SendButton>
          </UserInput>
        </ChatbotContainer>
      </>
    </StyleSheetManager>
  );
};

export default Chatbot;