import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { X, Send, MessageCircle } from 'lucide-react';

export default function Chat({ roomId, displayName, isOpen, onClose }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = ({ from, message, timestamp }) => {
      console.log('Chat received message:', { from, message, timestamp });
      setMessages(prev => [...prev, { from, message, timestamp }]);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      from: displayName,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('chat-message', messageData);
    setInputMessage('');
  };

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full shadow-lg flex-shrink-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              No messages yet
            </p>
            <p className="text-gray-500 text-xs">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.from === displayName;
            return (
              <div
                key={index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Show sender name above message */}
                {!isMe && (
                  <div className="text-xs font-semibold text-gray-700 mb-1 px-1">
                    {msg.from}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 max-w-xs break-words shadow-sm ${
                    isMe
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl font-medium transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
