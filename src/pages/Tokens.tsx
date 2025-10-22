import { motion } from "framer-motion";
import { Coins, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const tokenPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    tokens: 50,
    price: 99,
    popular: false,
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "popular",
    name: "Popular Pack",
    tokens: 150,
    price: 249,
    popular: true,
    icon: Zap,
    color: "from-primary to-secondary",
    bonus: "+20 bonus tokens",
  },
  {
    id: "premium",
    name: "Premium Pack",
    tokens: 500,
    price: 699,
    popular: false,
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    bonus: "+100 bonus tokens",
  },
];

const Tokens = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePurchase = (packageId: string, price: number) => {
    // TODO: Implement Razorpay integration
    toast({
      title: "Payment Coming Soon",
      description: "Razorpay integration will be added next. Stay tuned!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar tokens={100} isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
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
              Back to Home
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Coins className="w-5 h-5 text-accent" />
              <span className="text-sm">Get More Tokens</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Choose Your Package
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Purchase tokens to unlock unlimited conversations and calls with your AI companions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {tokenPackages.map((pkg, index) => {
              const Icon = pkg.icon;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative"
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <Card className={`relative overflow-hidden border-2 ${pkg.popular ? 'border-primary/50 glow-pink' : 'border-border/50'} transition-all duration-300`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-5`} />
                    
                    <div className="relative p-8 space-y-6">
                      <div className="space-y-2">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${pkg.color} bg-opacity-20`}>
                          <Icon className="w-8 h-8 text-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                        {pkg.bonus && (
                          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                            {pkg.bonus}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">₹{pkg.price}</span>
                          <span className="text-muted-foreground">INR</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Coins className="w-5 h-5 text-accent" />
                          <span className="text-lg font-semibold">{pkg.tokens} Tokens</span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{Math.floor(pkg.tokens / 2)} Messages</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          <span>{Math.floor(pkg.tokens / 5)} Minutes of Calls</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>All AI Personalities</span>
                        </li>
                      </ul>

                      <Button
                        onClick={() => handlePurchase(pkg.id, pkg.price)}
                        className={`w-full ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        size="lg"
                      >
                        Purchase Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8 border border-border/50"
          >
            <h3 className="text-xl font-bold mb-4">How Tokens Work</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <div className="font-semibold text-foreground mb-2">💬 Chat Messages</div>
                <p>Each message you send costs 2 tokens. Receive unlimited responses!</p>
              </div>
              <div>
                <div className="font-semibold text-foreground mb-2">📞 Voice Calls</div>
                <p>Voice calls with AI companions cost 5 tokens per minute.</p>
              </div>
              <div>
                <div className="font-semibold text-foreground mb-2">🔒 Secure Payment</div>
                <p>All payments are processed securely through Razorpay.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Tokens;
