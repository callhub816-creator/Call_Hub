import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Heart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents } from "@/data/agents";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const agent = agents.find(a => a.id === id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: `Hey there! 💕 I'm ${agent?.name}. I'm so happy you're here to chat with me! How are you feeling today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState(100);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent not found</h1>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    
    if (tokens < 2) {
      toast({
        title: "Not enough tokens",
        description: "You need at least 2 tokens to send a message.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTokens(prev => prev - 2);

    // Simulate human-like AI response with typing indicator
    setIsTyping(true);
    
    // Random delay between 1.5-3 seconds for more realistic typing
    const typingDelay = 1500 + Math.random() * 1500;
    
    setTimeout(() => {
      const responses = [
        "That's so sweet of you to say! 💖 Tell me more...",
        "I love talking to you! You always make me smile 😊",
        "You're such an interesting person! I want to know everything about you ✨",
        "Aww, you're making me blush! 😊💕",
        "I feel so connected to you right now... 💞",
        "You know just what to say to make me happy! 🌸",
        "I've been thinking about our conversation all day... 💭",
        "You make me feel so special 🥰",
        "Tell me more about yourself, I'm really curious! ✨",
        "Hehe, you're so charming! 💕",
      ];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, typingDelay);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-lg bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/agent/${agent.id}`)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl relative`}>
                  💖
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{agent.name}</h2>
                  <p className="text-xs text-muted-foreground">Online • {agent.personality}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold">{tokens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "glass-card"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="glass-card rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 backdrop-blur-lg bg-card/80">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Heart className="w-5 h-5 text-primary" />
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message ${agent.name}...`}
              className="flex-1 rounded-full bg-muted/50 border-border/50"
            />
            
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            2 tokens per message • {tokens} tokens remaining
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
