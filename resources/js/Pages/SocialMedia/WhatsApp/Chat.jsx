import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';

const ChatSidebar = ({ chats, onSelect, selectedChatId }) => (
  <aside className="w-80 border-r h-full flex flex-col bg-white">
    <div className="p-4 font-bold text-lg border-b">Chats</div>
    <div className="flex-1 overflow-y-auto">
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`p-4 cursor-pointer border-b hover:bg-gray-100 ${selectedChatId === chat.id ? 'bg-gray-100 font-semibold' : ''}`}
          onClick={() => onSelect(chat.id)}
        >
          <div className="flex items-center gap-2">
            {chat.contact?.profile_image && (
              <img src={chat.contact.profile_image} alt="" className="h-8 w-8 rounded-full" />
            )}
            <span>{chat.contact?.name || chat.group_name || 'Unknown'}</span>
          </div>
          <div className="text-xs text-gray-500 truncate">
            {chat.messages?.[0]?.content || chat.messages?.[0]?.media_url ? 'Media' : ''}
          </div>
        </div>
      ))}
    </div>
  </aside>
);

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
    <div className={`rounded-lg px-4 py-2 max-w-xs ${isOwn ? 'bg-green-100 text-right' : 'bg-gray-200'}`}>
      {message.media_url && (
        <img src={message.media_url} alt="media" className="mb-1 max-h-40 rounded" />
      )}
      <div>{message.content}</div>
      <div className="text-xs text-gray-500 mt-1">{new Date(message.created_at).toLocaleTimeString()}</div>
    </div>
  </div>
);

const ChatThread = ({ chatId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    axios.get(`/whatsapp/chats/${chatId}`).then(res => setMessages(res.data));
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    let media_url = null;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const upload = await axios.post(`/whatsapp/chats/${chatId}/upload`, formData);
      media_url = upload.data.url;
    }
    await axios.post(`/whatsapp/chats/${chatId}/send`, {
      content: input,
      media_url,
      sender_id: userId,
      receiver_id: null, // Set appropriately for your app
    });
    setInput('');
    setFile(null);
    axios.get(`/whatsapp/chats/${chatId}`).then(res => setMessages(res.data));
    setSending(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t bg-white">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message"
          disabled={sending}
        />
        <input
          type="file"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={e => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={sending || (!input && !file)}
        >
          Send
        </button>
      </form>
    </div>
  );
};

const WhatsAppChat = ({ userId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    axios.get('/whatsapp/chats').then(res => setChats(res.data));
  }, []);

  return (
      <div className="flex h-[80vh] bg-white rounded shadow overflow-hidden">
        <ChatSidebar chats={chats} onSelect={setSelectedChat} selectedChatId={selectedChat} />
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatThread chatId={selectedChat} userId={userId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start messaging</div>
          )}
        </div>
      </div>
  );
};

export default WhatsAppChat;
