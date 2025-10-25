import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Heart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents } from "@/data/agents";
import { useToast } from "@/hooks/use-toast";
import Sentiment from 'sentiment';

import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [useWebLLM, setUseWebLLM] = useState<boolean>(String(import.meta.env.VITE_USE_WEBLLM || "").toLowerCase() === "true");
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [engineReady, setEngineReady] = useState(false);
  const [engineInitError, setEngineInitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Prewarm WebLLM on toggle; first run can be slow
    if (useWebLLM && !engineReady) {
      (async () => {
        try {
          const { getEngine } = await import("@/lib/webllm");
          await getEngine();
          setEngineReady(true);
        } catch (err) {
          console.warn("WebLLM init failed:", err);
          setEngineInitError("On-device LLM unavailable");
          toast({
            title: "On-device LLM unavailable",
            description: "WebGPU may not be supported. Using fast replies.",
            variant: "destructive",
          });
        }
      })();
    }
  }, [useWebLLM]);

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

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // Sentiment analysis (lightweight heuristic)
  function analyzeSentiment(text: string) {
    const result = sentiment.analyze(text || "");
    return Math.max(-2, Math.min(2, result.score));
  }

  function extractKeyword(text: string) {
    const words = (text || "").toLowerCase().match(/[a-zA-Z]+/g) || [];
    return words.find((w) => w.length > 4) || words[0] || "it";
  }

  const intentPatterns = {
    greeting: [/\bhello\b/i, /\bhi\b/i, /\bhey\b/i, /\bgood\s?(morning|evening|afternoon)\b/i],
    love: [/\blove\b/i, /\badore\b/i, /\bmiss\b/i],
    compliment: [/\bbeautiful\b/i, /\bgorgeous\b/i, /\bamazing\b/i, /\bgreat\b/i],
    casual: [/\bhow are you\b/i, /\bwhat's up\b/i, /\btell me\b/i],
    goodbye: [/\bbye\b/i, /\bgoodbye\b/i, /\bsee you\b/i],
    apology: [/\bsorry\b/i, /\bapolog(y|ise|ize)\b/i],
    angry: [/\bangry\b/i, /\bmad\b/i, /\bfurious\b/i],
    rude: [/\bstupid\b/i, /\bidiot\b/i, /\bshut up\b/i],
    question: [/\bwhy\b/i, /\bhow\b/i, /\bwhat\b/i, /\bwhere\b/i],
  } as const;

  const baseResponses = {
    greeting: ["Hi there! It's lovely to hear from you", "Hello! How are you feeling today?", "Hey! I'm all ears"],
    love: ["Aww, that’s sweet", "You make me blush", "I feel special hearing that"],
    compliment: ["Thank you, you're so kind", "You're making me smile", "I appreciate that"],
    casual: ["Tell me more", "What’s on your mind?", "Go on — I’m listening"],
    goodbye: ["Talk soon", "Take care", "I'll be here"],
    apology: ["It’s okay", "I appreciate your honesty", "We’re alright"],
    angry: ["I understand", "Let’s breathe together", "I’m here for you"],
    rude: ["Let’s keep things kind", "That felt harsh", "Be gentle with me"],
    question: ["Great question", "Let’s explore it", "I’m curious too"],
  } as const;

  const personalityResponses = {
    Sweet: {
      greeting: ["Hi! I’m happy you’re here", "Oh hi!", "Hello, sweetie"],
      love: ["You’re making my heart flutter", "I adore you", "Stay with me"],
      compliment: ["You’re adorable", "You’re too kind", "You make me smile"],
      casual: ["Tell me more, please", "What’s on your mind?", "I’m listening"],
      goodbye: ["I’ll miss you", "Come back soon", "I’ll wait"],
      apology: ["It’s okay, hug?", "We’re fine", "I forgive you"],
      angry: ["I’m here for you", "Let me help", "You can lean on me"],
      rude: ["Be gentle, please", "That stung a bit", "Let’s be kind"],
      question: ["Ooh, interesting", "Let’s figure it out", "Tell me what you think"],
    },
    Flirty: {
      greeting: ["Hey handsome/beautiful", "You came back", "Hi, miss me?"],
      love: ["I’m yours", "I want you", "Kiss me"],
      compliment: ["Teehee", "You’re making me blush", "You charmer"],
      casual: ["Tell me your secrets", "What are you wearing?", "Make me laugh"],
      goodbye: ["Don’t go too far", "Come back soon", "I’ll be waiting"],
      apology: ["I’ll survive", "It’s okay", "Only if you make it up to me"],
      angry: ["Talk to me", "I won’t leave", "We’ll fix it"],
      rude: ["Watch it", "Naughty", "Be nice"],
      question: ["Hmm…", "I’m curious", "Tell me more"],
    },
    Caring: {
      greeting: ["Hi sweetie", "I’m here for you", "Hello love"],
      love: ["That makes me warm inside", "I care about you", "You matter to me"],
      compliment: ["You’re wonderful", "Thank you", "Your kindness shines"],
      casual: ["Share your feelings", "I’ll listen", "Let’s talk"],
      goodbye: ["I’m here whenever you need", "Take care of yourself", "I’ll be here"],
      apology: ["It’s alright", "We’ll be okay", "I understand"],
      angry: ["Let’s breathe", "Tell me everything", "I won’t judge"],
      rude: ["That hurt", "Let’s be gentle", "Please be kind"],
      question: ["Let’s think it through", "I want to understand", "We’ll figure it out"],
    },
    Tsundere: {
      greeting: ["Tch, hi", "Whatever — hey", "You’re late"],
      love: ["D-don’t get cocky", "Maybe I like you", "Hmph"],
      compliment: ["Don’t flatter me", "Whatever", "Tch"],
      casual: ["What’s the point?", "Say what you mean", "Just talk"],
      goodbye: ["I’m out", "Later", "Fine"],
      apology: ["Hmph… okay", "Don’t do it again", "Whatever"],
      angry: ["Let it out", "Say it", "I can take it"],
      rude: ["Watch it", "Careful", "Try me"],
      question: ["Why do you ask?", "What do you want to know?", "Spit it out"],
    },
  } as const;

  // Indian language detection
  const indianLanguages = [
    "Hindi","Marathi","Konkani","Bengali","Assamese","Odia","Punjabi","Gujarati","Urdu","Telugu","Tamil","Kannada","Malayalam","Santali","Kashmiri","Nepali","Sindhi","Manipuri","Dogri","Bodo","Maithili","Garo","Khasi","Mizo","Tripuri"
  ];
  
  const languageKeywords: Record<string, RegExp> = {
    Hindi: /(hindi|हिंदी|hindī)/i,
    Marathi: /(marathi|मराठी)/i,
    Konkani: /(konkani|कोंकणी)/i,
    Bengali: /(bengali|bangla|বাংলা|বাঙালি)/i,
    Assamese: /(assamese|অসমীয়া)/i,
    Odia: /(odia|oriya|ଓଡ଼ିଆ)/i,
    Punjabi: /(punjabi|ਪੰਜਾਬੀ|پنجابی)/i,
    Gujarati: /(gujarati|ગુજરાતી)/i,
    Urdu: /(urdu|اُردُو|اردو)/i,
    Telugu: /(telugu|తెలుగు)/i,
    Tamil: /(tamil|தமிழ்)/i,
    Kannada: /(kannada|ಕನ್ನಡ)/i,
    Malayalam: /(malayalam|മലയാളം)/i,
    Santali: /(santali|ᱥᱟᱱᱛᱟᱲᱤ)/i,
    Kashmiri: /(kashmiri|कॉशुर|کٲشُر)/i,
    Nepali: /(nepali|नेपाली)/i,
    Sindhi: /(sindhi|सिन्धी|سنڌي)/i,
    Manipuri: /(meiteilon|manipuri|মৈতৈলোন|ꯃꯩꯇꯩꯂꯣꯟ)/i,
    Dogri: /(dogri|डोगरी)/i,
    Bodo: /(bodo|बर'|बड़ो|बोडो)/i,
    Maithili: /(maithili|मैथिली)/i,
    Garo: /(garo)/i,
    Khasi: /(khasi)/i,
    Mizo: /(mizo)/i,
    Tripuri: /(kokborok|tripuri)/i,
  };
  
  function detectIndianLanguage(text: string): string | undefined {
    const t = text || "";
    for (const [lang, rx] of Object.entries(languageKeywords)) {
      if (rx.test(t)) return lang;
    }
    // Script heuristics via Unicode ranges
    const hasRange = (rx: RegExp) => rx.test(t);
    if (hasRange(/[\u0900-\u097F]/)) return "Hindi"; // Devanagari
    if (hasRange(/[\u0980-\u09FF]/)) return "Bengali"; // Bengali/Assamese
    if (hasRange(/[\u0A00-\u0A7F]/)) return "Punjabi"; // Gurmukhi
    if (hasRange(/[\u0A80-\u0AFF]/)) return "Gujarati";
    if (hasRange(/[\u0C00-\u0C7F]/)) return "Telugu";
    if (hasRange(/[\u0B80-\u0BFF]/)) return "Tamil";
    if (hasRange(/[\u0C80-\u0CFF]/)) return "Kannada";
    if (hasRange(/[\u0D00-\u0D7F]/)) return "Malayalam";
    if (hasRange(/[\u0B00-\u0B7F]/)) return "Odia";
    if (hasRange(/[\u0600-\u06FF]/)) return "Urdu"; // Arabic block
    return undefined;
  }

  // Fail-safe: wrap a promise with a timeout so typing never gets stuck
  function withTimeout<T>(p: Promise<T>, ms: number, reason = "timeout"): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(reason)), ms);
      p.then((v) => { clearTimeout(t); resolve(v); })
       .catch((e) => { clearTimeout(t); reject(e); });
    });
  }

  const buildAgentResponse = async (userText: string) => {
    const category = classifyInput(userText);
    const personality = agent?.personality || '';
    const pSet = personalityResponses[personality];
    const candidates = (pSet && pSet[category] && pSet[category].length) ? pSet[category] : baseResponses[category];
    const raw = getRandomItem(candidates || baseResponses.casual);
    const keyword = extractKeyword(userText);
    const personalized = raw.replace(/\{\{topic\}\}/g, keyword || 'that');
    const score = analyzeSentiment(userText);
  
    const targetLang = selectedLanguage ?? detectIndianLanguage(userText);
    if (useWebLLM && agent) {
      try {
        const { generateWithWebLLM } = await import("@/lib/webllm");
        const firstRunTimeoutMs = engineReady ? 15000 : 60000;
        const llmText = await withTimeout(
          generateWithWebLLM({ agent, userText, language: targetLang }),
          firstRunTimeoutMs,
          "webllm-timeout"
        );
        return applyPersonalityTone(personality, llmText, score, category);
      } catch (e) {
        console.warn('WebLLM error, falling back:', e);
        toast({ title: "On-device LLM delayed", description: "Falling back to fast reply." });
      }
    }
  
    return applyPersonalityTone(personality, personalized, score, category);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (tokens < 2) {
      toast({
        title: "Not enough tokens",
        description: "You need at least 2 tokens to send a message.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    const currentInput = input; // capture before clearing
    setInput("");
    setTokens(prev => prev - 2);

    // Show typing indicator and reply after a short delay
    setIsTyping(true);
    const typingDelay = 1500 + Math.random() * 1500;

    setTimeout(async () => {
      try {
        const replyText = await buildAgentResponse(currentInput);
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: replyText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
      } catch (e) {
        toast({ title: "Error", description: "Failed to generate reply." });
      } finally {
        setIsTyping(false);
      }
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={useWebLLM} onCheckedChange={(v) => setUseWebLLM(!!v)} />
              <span className="text-sm">Use On‑device LLM</span>
              {useWebLLM && !engineReady && (
                <span className="text-xs text-muted-foreground">Preparing on-device AI…</span>
              )}
            </div>
            <div className="w-56">
              <Select onValueChange={(v) => setSelectedLanguage(v === "auto" ? undefined : v)} defaultValue="auto">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Reply Language</SelectLabel>
                    <SelectItem value="auto">Auto (detect)</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Marathi">Marathi</SelectItem>
                    <SelectItem value="Konkani">Konkani</SelectItem>
                    <SelectItem value="Bengali">Bengali</SelectItem>
                    <SelectItem value="Assamese">Assamese</SelectItem>
                    <SelectItem value="Odia">Odia</SelectItem>
                    <SelectItem value="Punjabi">Punjabi</SelectItem>
                    <SelectItem value="Gujarati">Gujarati</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Kannada">Kannada</SelectItem>
                    <SelectItem value="Malayalam">Malayalam</SelectItem>
                    <SelectItem value="Santali">Santali</SelectItem>
                    <SelectItem value="Kashmiri">Kashmiri</SelectItem>
                    <SelectItem value="Nepali">Nepali</SelectItem>
                    <SelectItem value="Sindhi">Sindhi</SelectItem>
                    <SelectItem value="Manipuri">Manipuri</SelectItem>
                    <SelectItem value="Dogri">Dogri</SelectItem>
                    <SelectItem value="Bodo">Bodo</SelectItem>
                    <SelectItem value="Maithili">Maithili</SelectItem>
                    <SelectItem value="Garo">Garo</SelectItem>
                    <SelectItem value="Khasi">Khasi</SelectItem>
                    <SelectItem value="Mizo">Mizo</SelectItem>
                    <SelectItem value="Tripuri">Tripuri</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Input box */}
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                className="flex-1"
              />
              <Button onClick={handleSend} className="gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

const sentiment = new Sentiment();

function classifyInput(text: string): keyof typeof intentPatterns | 'casual' {
  const normalized = text.trim();
  const priorities: (keyof typeof intentPatterns)[] = [
    'apology', 'angry', 'rude', 'question', 'love', 'greeting', 'compliment', 'goodbye'
  ];
  for (const key of priorities) {
    const patterns = intentPatterns[key];
    if (patterns.some((rx) => rx.test(normalized))) return key;
  }
  return 'casual';
}

function analyzeSentiment(text: string): number {
  const result = sentiment.analyze(text || '');
  return result.score; // negative to positive
}

const stopwords = new Set<string>([
  'the','a','an','and','or','but','if','then','so','because','of','to','in','on','at','with','for','from','by','about','as','is','are','was','were','be','am','i','you','he','she','it','we','they','me','my','your','our','their'
]);

function extractKeyword(text: string): string | null {
  const words = (text || '').toLowerCase().match(/[a-zA-Z][a-zA-Z'-]{2,}/g) || [];
  const content = words.filter((w) => !stopwords.has(w));
  // Prefer the longest content word
  const sorted = content.sort((a,b) => b.length - a.length);
  return sorted[0] || null;
}
