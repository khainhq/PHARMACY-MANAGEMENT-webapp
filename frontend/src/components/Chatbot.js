import React, { useEffect, useRef, useState } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import { sendMessageToChatbot } from '../services/chatbotService';

const primaryBlue = '#0369a1';
const lightBlue = '#e0f2fe';
const chatBodyBg = '#f3f8fb';
const textColor = '#333333';
const borderColor = '#d0d7de';

const ChatbotToggle = styled.button`
  position: fixed;
  bottom: ${({ $withContactDock }) => ($withContactDock ? '8.9rem' : '1.55rem')};
  right: 1.55rem;
  background-color: ${primaryBlue};
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(3, 105, 161, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #075985;
    transform: scale(1.05);
  }
`;

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: ${({ $withContactDock }) => ($withContactDock ? '13.8rem' : '6.25rem')};
  right: 1.55rem;
  width: min(370px, calc(100vw - 2rem));
  height: min(550px, calc(100vh - 8rem));
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(20px)'};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const ChatHeader = styled.div`
  background-color: ${primaryBlue};
  color: white;
  padding: 15px 20px;
  font-size: 1.05rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 22px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
`;

const ChatBody = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${chatBodyBg};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageTimestamp = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 4px;
  display: block;
`;

const MessageBubble = styled.div`
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 85%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.45;
  font-size: 0.95rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;

  &.user {
    align-self: flex-end;

    ${MessageBubble} {
      background-color: ${lightBlue};
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
      background-color: #ffffff;
      color: ${textColor};
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 6px;
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
  min-width: 0;
  padding: 12px 18px;
  border: 1px solid ${borderColor};
  border-radius: 25px;
  margin-right: 12px;
  font-size: 0.95rem;
  color: ${textColor};
  background-color: #fdfdfd;

  &:focus {
    outline: none;
    border-color: ${primaryBlue};
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.18);
  }
`;

const SendButton = styled.button`
  background-color: ${primaryBlue};
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

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const Chatbot = ({ withContactDock = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Xin chào! Tôi là Trợ lý PharmaCare. Bạn có thể hỏi tôi cách đăng nhập, tạo hóa đơn, thêm thuốc, quản lý nhân viên hoặc dùng từng phân hệ.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isSending) return;

    setMessages((current) => [...current, { text: trimmedInput, isUser: true, timestamp: new Date() }]);
    setInputValue('');
    setIsSending(true);

    try {
      const reply = await sendMessageToChatbot(trimmedInput);
      setMessages((current) => [...current, { text: reply, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      setMessages((current) => [...current, {
        text: 'Lỗi: Không thể kết nối với Trợ lý PharmaCare. Bạn vui lòng kiểm tra backend hoặc API key Gemini.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
      <>
        <ChatbotToggle
          $withContactDock={withContactDock}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
          title="Trợ lý PharmaCare"
        >
          {isOpen ? <FiX /> : <FiMessageSquare />}
        </ChatbotToggle>
        <ChatbotContainer $isOpen={isOpen} $withContactDock={withContactDock}>
          <ChatHeader>
            Trợ lý PharmaCare
            <CloseButton onClick={() => setIsOpen(false)} aria-label="Đóng chatbot"><FiX /></CloseButton>
          </ChatHeader>
          <ChatBody ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <Message key={`${msg.timestamp.getTime()}-${index}`} className={msg.isUser ? 'user' : 'bot'}>
                <MessageBubble>{msg.text}</MessageBubble>
                <MessageTimestamp>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </MessageTimestamp>
              </Message>
            ))}
            {isSending && (
              <Message className="bot">
                <MessageBubble>Đang tìm hướng dẫn phù hợp...</MessageBubble>
              </Message>
            )}
          </ChatBody>
          <UserInput onSubmit={handleSubmit}>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi hướng dẫn sử dụng..."
              aria-label="Nhập câu hỏi chatbot"
            />
            <SendButton type="submit" disabled={!inputValue.trim() || isSending} aria-label="Gửi câu hỏi">
              <FiSend />
            </SendButton>
          </UserInput>
        </ChatbotContainer>
      </>
    </StyleSheetManager>
  );
};

export default Chatbot;
