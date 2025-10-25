import { motion } from "framer-motion";
import { Heart, Coins, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  tokens?: number;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar = ({ tokens = 100, isAuthenticated = false, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CallHub
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Where AI meets emotion</p>
            </div>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Tokens */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass-card cursor-pointer"
                  onClick={() => navigate("/tokens")}
                >
                  <Coins className="w-5 h-5 text-accent" />
                  <span className="font-bold text-foreground">{tokens}</span>
                  <span className="text-sm text-muted-foreground">tokens</span>
                </motion.div>

                {/* Profile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-5 h-5" />
                </Button>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={onLogout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
