import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { Navbar } from "@/components/Navbar";
import { agents } from "@/data/agents";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar tokens={100} isAuthenticated={false} />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">18+ Only • AI Companions</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your AI Girlfriend.
            </span>
            <br />
            <span className="text-foreground">Anytime. Anywhere.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Where Hearts Meet Technology. Connect with AI Friends who truly listen, 
            understand, and make every conversation feel like coming home.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            {["💬 Flirty Chat", "🎤 Voice Calls", "💞 Emotional Reactions", "✨ Unique Personalities"].map((feature, i) => (
              <div key={i} className="px-4 py-2 rounded-full bg-muted/30 text-sm">
                {feature}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">
            Meet Your <span className="text-primary">AI Friends</span>
          </h2>
          <p className="text-muted-foreground">Each with a unique personality, voice, and style</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-border/50 py-8"
      >
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 CallHub.AI • Love in pixels • 18+ Only</p>
          <p className="mt-2">Made with  for emotional AI experiences</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
