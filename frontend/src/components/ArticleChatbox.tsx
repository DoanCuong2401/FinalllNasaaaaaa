import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, MessageSquare, Lightbulb, FlaskConical } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ChatMode = "direct" | "real-world" | "experiment" | null;

interface ArticleChatboxProps {
  articleTitle: string;
  articleContent: string;
}

export function ArticleChatbox({ articleTitle, articleContent }: ArticleChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !chatMode) {
      // Reset when opening chatbox
      setMessages([]);
    } else if (chatMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, chatMode]);

  const handleModeSelect = (mode: ChatMode) => {
    setChatMode(mode);
    
    let welcomeMessage = "";
    
    switch (mode) {
      case "direct":
        welcomeMessage = "Hello! I can help you understand this research article better. Feel free to ask me any questions about the content, methodology, or findings.";
        break;
      case "real-world":
        welcomeMessage = "Hello! I'll help you explore real-world phenomena related to this research article. Ask me about practical applications, real-life examples, or how these findings manifest in everyday situations.";
        break;
      case "experiment":
        welcomeMessage = "This experiment cannot be performed at this time. When it is completed, I will notify you immediately. Thank you for your understanding.";
        break;
    }
    
    setMessages([{
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  };

  const handleBack = () => {
    setChatMode(null);
    setMessages([]);
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // If in experiment mode, show the unavailable message
    if (chatMode === "experiment") {
      const userMessage: Message = {
        role: "user",
        content: input.trim(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInput("");

      const assistantMessage: Message = {
        role: "assistant",
        content: "This experiment cannot be performed at this time. When it is completed, I will notify you immediately. Thank you for your understanding.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Modify the request based on chat mode
      const requestBody: any = {
        question: userMessage.content,
        article_title: articleTitle,
        article_context: articleContent
      };

      if (chatMode === "real-world") {
        requestBody.mode = "real-world";
        requestBody.question = `Relate this to real-world phenomena: ${userMessage.content}`;
      }

      const response = await fetch("http://localhost:8000/chat_article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure the backend is running and try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">
                {chatMode === null ? "Article Assistant" : 
                 chatMode === "direct" ? "Direct Chat" :
                 chatMode === "real-world" ? "Real-World Phenomena" :
                 "Practical Experiment"}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setChatMode(null);
                setMessages([]);
              }}
              className="hover:bg-blue-700 p-1 rounded transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selection Screen */}
          {chatMode === null ? (
            <div className="flex-1 p-6 bg-gray-50 flex flex-col justify-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Choose Your Chat Mode
              </h4>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Select how you'd like to interact with the article
              </p>
              
              <div className="space-y-3">
                {/* Direct Chat Option */}
                <button
                  onClick={() => handleModeSelect("direct")}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Direct Chat</h5>
                      <p className="text-xs text-gray-600">
                        Ask questions directly about the article's content, methodology, and findings
                      </p>
                    </div>
                  </div>
                </button>

                {/* Real-World Phenomena Option */}
                <button
                  onClick={() => handleModeSelect("real-world")}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                      <Lightbulb className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Real-World Phenomena</h5>
                      <p className="text-xs text-gray-600">
                        Explore practical applications and real-life examples related to this research
                      </p>
                    </div>
                  </div>
                </button>

                {/* Practical Experiment Option */}
                <button
                  onClick={() => handleModeSelect("experiment")}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">Practical Experiment</h5>
                      <p className="text-xs text-gray-600">
                        Design and conduct experiments based on the research findings
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Interface */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {/* Back button */}
                <button
                  onClick={handleBack}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mb-2"
                >
                  ← Back to mode selection
                </button>

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Only show if not experiment mode or after first message */}
              {(chatMode !== "experiment" || messages.length > 1) && (
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                  <div className="flex gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={chatMode === "experiment" ? "Feature coming soon..." : "Ask about the article..."}
                      className="flex-1 resize-none border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      disabled={isLoading || chatMode === "experiment"}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading || chatMode === "experiment"}
                      className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}