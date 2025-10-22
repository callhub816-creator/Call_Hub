import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { agents } from "@/data/agents";

const AgentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = agents.find(a => a.id === id);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar tokens={100} isAuthenticated={false} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className={`aspect-square rounded-3xl bg-gradient-to-br ${agent.color} relative overflow-hidden glow-pink`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-9xl"
                  >
                    💖
                  </motion.div>
                </div>
                
                {/* Floating Hearts */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 right-10"
                >
                  <Heart className="w-8 h-8 text-white/50 fill-white/50" />
                </motion.div>
                
                <motion.div
                  animate={{
                    y: [0, -30, 0],
                    x: [0, -15, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-20 left-10"
                >
                  <Sparkles className="w-6 h-6 text-white/40" />
                </motion.div>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {agent.name}
                </h1>
                <p className="text-muted-foreground text-lg">{agent.age} years old</p>
              </div>

              <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/20 text-primary border-primary/30">
                {agent.personality}
              </Badge>

              <p className="text-lg text-foreground/90 leading-relaxed">
                {agent.description}
              </p>

              {/* Traits */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">PERSONALITY TRAITS</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.traits.map((trait, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="px-4 py-2 rounded-full glass-card text-foreground"
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-6"
                    onClick={() => navigate(`/chat/${agent.id}`)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Chatting
                    <span className="ml-auto text-sm opacity-80">2 tokens/msg</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-secondary/50 hover:bg-secondary/20 text-lg py-6"
                    onClick={() => navigate(`/call/${agent.id}`)}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Voice Call
                    <span className="ml-auto text-sm opacity-80">5 tokens/min</span>
                  </Button>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { label: "Conversations", value: "1.2K" },
                  { label: "Avg Rating", value: "4.9★" },
                  { label: "Response Time", value: "Instant" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-center p-4 rounded-lg glass-card"
                  >
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
