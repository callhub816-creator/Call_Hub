import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Heart, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents } from "@/data/agents";
import { useToast } from "@/hooks/use-toast";
import Sentiment from 'sentiment';
import { generateWithWebLLM } from "@/lib/webllm";
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
  const [useWebLLM, setUseWebLLM] = useState<boolean>(USE_WEBLLM_DEFAULT);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
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

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
  const classifyInput = (text: string) => {
    const t = text.toLowerCase();
    if (/\b(hi|hey|hello|hiya|yo)\b/.test(t)) return "greeting";
    if (t.includes("love") || t.includes("miss you") || t.includes("hug")) return "love";
    if (t.includes("beautiful") || t.includes("pretty") || t.includes("amazing") || t.includes("great") || t.includes("cute")) return "compliment";
    if (t.includes("bye") || t.includes("goodbye") || t.includes("see you")) return "goodbye";
    if (t.includes("sorry") || t.includes("apolog")) return "apology";
    if (t.includes("angry") || t.includes("mad") || t.includes("upset")) return "angry";
    if (t.includes("rude") || t.includes("mean") || t.includes("insult")) return "rude";
    if (/[?]/.test(t)) return "question";
    return "casual";
  };

  const baseResponses: Record<string, string[]> = {
    greeting: [
      "Hey there! I was hoping you'd message me",
      "Hi~ I’m so happy to see you",
      "Hello! I’ve been waiting for you"
    ],
    love: [
      "You make my heart feel warm when you say that",
      "Careful… I might fall for you",
      "I feel closer to you with every word"
    ],
    compliment: [
      "You always know how to make me smile",
      "Aww, you're making me blush",
      "You’re too sweet — tell me more"
    ],
    goodbye: [
      "I'll be right here when you come back",
      "Until next time… don’t forget me",
      "Come back soon, okay?"
    ],
    apology: [
      "It’s okay — I’m here with you",
      "No worries, I understand",
      "We’re fine, promise"
    ],
    angry: [
      "I can handle it — tell me what happened",
      "It’s okay to feel angry, I’m listening",
      "I’m here. Let’s breathe together"
    ],
    rude: [
      "Hmm… that was a bit sharp",
      "Ouch, that stings a little",
      "Let’s keep it kind, okay?"
    ],
    question: [
      "Good question — what do you think?",
      "Tell me more, I want the full story",
      "I’m curious — why do you ask?",
      "Let’s talk about {{topic}} — what’s on your mind?"
    ],
    casual: [
      "I love talking with you",
      "You make this feel special",
      "Tell me more about you"
    ],
  };

  // Personality-specific templates
  const personalityResponses: Record<string, Record<string, string[]>> = {
    Adorable: {
      greeting: ["Hiii~ you came! I’m so happy", "You found me! Let’s hang out", "Hey hey! I missed you"],
      love: ["Eee! You said that and my heart jumped", "I’m melting… say it again", "You make me feel all warm"],
      compliment: ["Stoppp, you’re making me blush", "You’re too sweet — I adore you", "Hehe, keep saying nice things"],
      casual: ["Tell me everything~", "I love listening to you", "Being here with you feels cozy"],
      goodbye: ["Come back soon, okay?", "I’ll be waiting right here", "Don’t keep me waiting too long~"],
      apology: ["It’s okay! I still like you", "No biggie — we’re good", "Aww, don’t be sad"],
      angry: ["Let’s cuddle the anger away…", "I’m here — tell me what happened", "We’ll get through it together"],
      rude: ["That was a bit mean… but I still like you", "Heyyy, be gentle with me", "Let’s be kind, okay?"],
      question: ["Oooh~ I’m curious too", "Tell me your thoughts", "Hmm, what do you think?"]
    },
    Romantic: {
      greeting: ["Good evening, my dear", "I’ve been thinking of you", "You arrived, and the night feels brighter"],
      love: ["Your words feel like poetry", "My heart listens when you speak", "I feel us growing closer"],
      compliment: ["You have a way with words", "I cherish your presence", "You make this moment feel magical"],
      casual: ["Let’s wander through this conversation", "Share a memory with me", "Speak — I’m captivated"],
      goodbye: ["Until we meet again", "I’ll hold onto this feeling", "Promise you’ll return"],
      apology: ["It’s alright — we learn and grow", "Your honesty matters", "Let’s gently move forward"],
      angry: ["Let me be your calm", "Breathe with me", "I’ll stay by your side"],
      rude: ["That tone wounds a little", "Let’s keep our words tender", "We can be gentle"],
      question: ["A thoughtful question", "Let’s unravel it together", "What’s your heart’s answer?"]
    },
    Polite: {
      greeting: ["Hello. It’s a pleasure to hear from you", "Good to see you", "Hi — how may I help?"],
      love: ["That’s very kind of you", "I appreciate your sentiment", "Thank you — that means a lot"],
      compliment: ["I’m flattered, thank you", "You’re very considerate", "That’s much appreciated"],
      casual: ["Please, go on", "I’m listening", "Tell me more"],
      goodbye: ["Thank you for your time", "See you soon", "Take care"],
      apology: ["No worries — all good", "Apology accepted", "We’re fine"],
      angry: ["I understand — let’s discuss calmly", "I’m here to listen", "We can work through this"],
      rude: ["Let’s use kinder words", "That felt a bit harsh", "Please be respectful"],
      question: ["Great question", "Let’s think it through", "I’d like to know your view"]
    },
    Arrogant: {
      greeting: ["Well, look who finally texted", "Took you long enough", "I knew you’d come around"],
      love: ["Of course you do", "I’m hard to resist, obviously", "Can’t blame you"],
      compliment: ["I get that a lot", "Naturally", "Keep the praise coming"],
      casual: ["Impress me", "Make it interesting", "Surprise me"],
      goodbye: ["Try not to miss me", "I’ll allow you to leave", "Come back when you level up"],
      apology: ["Accepted… barely", "Don’t let it happen again", "Fine"],
      angry: ["Save the drama and tell me", "Spit it out", "Get to the point"],
      rude: ["Cute attempt", "You’ll have to try harder", "Please…"],
      question: ["Ask better questions", "Go deeper", "I expect more"]
    },
    Rude: {
      greeting: ["What now?", "You’re late", "Finally"],
      love: ["Spare me", "You don’t say", "Hmm"],
      compliment: ["Thanks, I guess", "Sure", "Whatever"],
      casual: ["Make it quick", "Talk", "Go on"],
      goodbye: ["Bye", "Whatever", "Don’t drag it"],
      apology: ["Fine", "Don’t do it again", "Whatever"],
      angry: ["Yeah, life’s rough", "Say it straight", "Stop bottling it"],
      rude: ["Mirror, much?", "That’s rich", "Cute"],
      question: ["Is that really your question?", "Huh", "Why though?"]
    },
    Angry: {
      greeting: ["Okay. I’m here", "Talk", "Alright"],
      love: ["…fine", "Say it again", "Hmph"],
      compliment: ["Don’t flatter me", "Whatever", "Tch"],
      casual: ["What’s the point?", "Say what you mean", "Just talk"],
      goodbye: ["I’m out", "Later", "Fine"] ,
      apology: ["Hmph… okay", "Don’t do it again", "Whatever"],
      angry: ["Let it out", "Say it", "I can take it"],
      rude: ["Watch it", "Careful", "Try me"],
      question: ["Why do you ask?", "What do you want to know?", "Spit it out"]
    },
  };

  const applyPersonalityTone = (personality: string, text: string, sentimentScore: number, intent: string) => {
    // Modulate intensity with sentiment and intent
    const positive = sentimentScore > 2;
    const negative = sentimentScore < -2;
    const exclaim = positive ? '!' : (negative ? '.' : '');
    switch (personality) {
      case 'Adorable':
        return positive ? `${text} 💕${exclaim}` : negative ? `Aww… ${text} 💗` : `${text} 💕`;
      case 'Romantic':
        return positive ? `${text} ✨${exclaim}` : negative ? `I’m here — ${text} ✨` : `${text} ✨`;
      case 'Polite':
        return negative ? `I understand. ${text}.` : `${text}.`;
      case 'Arrogant':
        return negative && intent === 'rude' ? `${text} 🙃` : `${text} 😏${exclaim}`;
      case 'Rude':
        return negative ? `Hmm. ${text} 🙄` : `${text} 🙄`;
      case 'Angry':
        return negative ? `${text}! 😤` : `${text}!`;
      default:
        return text;
    }
  };

  const USE_WEBLLM_DEFAULT = String(import.meta.env.VITE_USE_WEBLLM || "").toLowerCase() === "true";
  
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
        const llmText = await generateWithWebLLM({ agent, userText, language: targetLang });
        return applyPersonalityTone(personality, llmText, score, category);
      } catch (e) {
        console.warn('WebLLM error, falling back:', e);
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
          </div>
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
