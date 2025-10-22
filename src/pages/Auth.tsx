import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isOver18, setIsOver18] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !isOver18) {
      toast({
        title: "Age Verification Required",
        description: "You must be 18 or older to use CallHub.AI",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && parseInt(formData.age) < 18) {
      toast({
        title: "Age Restriction",
        description: "You must be 18 or older to use this service",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual authentication
    toast({
      title: isLogin ? "Welcome back!" : "Account created!",
      description: "Redirecting you to your AI companions...",
    });
    
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-primary fill-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            CallHub.AI
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back to your AI companions" : "Create your account to get started"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 border border-border/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required={!isLogin}
                    min="18"
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-muted/50 border-border/50"
              />
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <Checkbox
                  id="age-verify"
                  checked={isOver18}
                  onCheckedChange={(checked) => setIsOver18(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="age-verify"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I confirm that I am 18 years or older
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    CallHub.AI is for adults only. You must be 18+ to use this service.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 py-6 text-lg"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
          <br />
          This is a fantasy AI service for entertainment purposes only.
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;
