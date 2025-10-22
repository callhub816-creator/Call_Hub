import { motion } from "framer-motion";
import { Heart, MessageCircle, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/data/agents";
import { useNavigate } from "react-router-dom";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

export const AgentCard = ({ agent, index }: AgentCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="cursor-pointer"
      onClick={() => navigate(`/agent/${agent.id}`)}
    >
      <Card className="relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 glow-pink group">
        <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
        
        <div className="relative p-6 space-y-4">
          {/* Avatar */}
          <div className={`w-full aspect-square rounded-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
            <img 
              src={agent.image} 
              alt={agent.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-20 group-hover:opacity-10 transition-opacity`} />
            <div className="absolute bottom-3 right-3">
              <Heart className="w-6 h-6 text-white fill-white animate-pulse drop-shadow-lg" />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {agent.name}
              </h3>
            </div>

            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {agent.personality}
            </Badge>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {agent.description}
            </p>

            {/* Traits */}
            <div className="flex flex-wrap gap-2">
              {agent.traits.slice(0, 3).map((trait, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-foreground/80">
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Chat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Call</span>
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
