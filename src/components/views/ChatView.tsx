import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Paperclip,
  Square,
  MessageSquare,
  ExternalLink,
  Search,
  X,
  Sidebar,
} from 'lucide-react';
import { useAssistant } from '../../lib/assistant-context';
import { ChatMessage } from '../../types';

interface ChatViewProps {
  voiceEnabled?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = () => {
  const { chat, listening, startListening, stopListening } = useAssistant();
  const {
    conversations,
    activeId,
    active,
    busy,
    send,
    stop,
    newChat,
    selectChat,
    deleteChat,
    clearHistory,
    filter,
    setFilter,
  } = chat;

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);

  const messages = active?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, busy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    send(input.trim(), attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          type: file.type,
          text: event.target?.result as string,
        },
      ]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredConversations = conversations.filter((c) =>
    filter.trim() ? c.title.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-bg">
      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-16 left-0 z-30 w-72 border-r border-line bg-card/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 lg:flex lg:flex-col`}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-accent" />
            <span className="text-xs font-semibold tracking-wider uppercase text-ink">
              Conversations
            </span>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="flex items-center gap-1 rounded-xl bg-ink px-2.5 py-1 text-2xs font-semibold text-black hover:opacity-90"
          >
            <Plus size={12} /> New
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-3 border-b border-line">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-xl border border-line bg-elevated py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((c) => {
            const isActive = c.id === activeId;
            return (
              <div
                key={c.id}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-elevated text-ink font-medium'
                    : 'text-muted hover:text-ink hover:bg-elevated/40'
                }`}
                onClick={() => {
                  selectChat(c.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="truncate flex-1 mr-2">{c.title || 'New conversation'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-danger p-1 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={clearHistory}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-2xs text-muted hover:text-danger hover:border-danger/30 transition-colors"
          >
            <Trash2 size={12} /> Clear all conversations
          </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top Chat Bar */}
        <div className="flex h-12 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-line text-muted hover:text-ink lg:hidden"
            >
              <Sidebar size={15} />
            </button>
            <span className="text-xs font-medium text-ink truncate max-w-md">
              {active?.title || 'Conversation'}
            </span>
          </div>

          <button
            type="button"
            onClick={newChat}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <Plus size={13} /> New Chat
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.length === 0 ? (
              <div className="my-16 text-center space-y-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-elevated mx-auto text-accent text-xl">
                  ✳︎
                </div>
                <h3 className="text-lg font-semibold text-ink">
                  How can MANTRA assist you?
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Type a command, launch websites, track tasks, or ask any question.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {[
                    'Open ChatGPT',
                    'Add task: Review PR at 3pm',
                    'Search for best AI tools on Google',
                    'Show my open tasks',
                    'Take a screenshot',
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => send(example)}
                      className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-muted hover:text-ink hover:border-accent transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m: ChatMessage) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-2xl rounded-2xl px-4.5 py-3.5 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'card bg-card text-ink rounded-bl-sm'
                      }`}
                    >
                      {m.pending ? (
                        <div className="flex items-center gap-2 text-muted">
                          <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                          <span>MANTRA is thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      )}

                      {/* Attachments preview */}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.attachments.map((att: any, idx: number) => (
                            <span
                              key={idx}
                              className="rounded bg-black/20 px-2 py-0.5 text-2xs"
                            >
                              📎 {att.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons (e.g. Open URL, Run Task) */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-line/40">
                          {m.actions.map((act, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (act.url) {
                                  window.open(act.url, '_blank', 'noopener,noreferrer');
                                } else if (act.action) {
                                  send(act.action);
                                }
                              }}
                              className="flex items-center gap-1.5 rounded-lg border border-line bg-elevated/80 px-2.5 py-1 text-2xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                            >
                              {act.label}
                              {act.url && <ExternalLink size={10} />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Source citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 text-2xs text-muted pt-1">
                          <span className="font-semibold">Sources: </span>
                          {m.sources.map((s, idx) => (
                            <span key={idx} className="mr-2">
                              {s.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-line bg-card/60 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-3xl space-y-2">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-elevated px-2.5 py-1 text-2xs text-ink"
                  >
                    📎 {a.name}
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted hover:text-danger"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-elevated text-muted hover:text-ink transition-colors"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MANTRA anything or type a command..."
                className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />

              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
                  listening
                    ? 'border-accent bg-accent/20 text-accent animate-pulse'
                    : 'border-line bg-elevated text-muted hover:text-ink'
                }`}
                title={listening ? 'Stop listening' : 'Voice input'}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
                  title="Stop generation"
                >
                  <Square size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() && attachments.length === 0}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-black disabled:opacity-30 hover:opacity-90 transition-opacity"
                  title="Send message"
                >
                  <Send size={15} />
                </button>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
