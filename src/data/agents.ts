import liaProfile from "@/assets/lia-profile.jpg";
import ariaProfile from "@/assets/aria-profile.jpg";
import miraProfile from "@/assets/mira-profile.jpg";
import novaProfile from "@/assets/nova-profile.jpg";
import eveProfile from "@/assets/eve-profile.jpg";
import nyxProfile from "@/assets/nyx-profile.jpg";

export interface Agent {
  id: string;
  name: string;
  personality: string;
  description: string;
  traits: string[];
  color: string;
  image: string;
  voiceModel?: string;
}

export const agents: Agent[] = [
  {
    id: "lia",
    name: "Lia",
    personality: "Adorable",
    description: "Lovable, cute, and playful — Lia radiates warmth and makes every moment feel light and joyful.",
    traits: ["Lovable", "Cute", "Playful", "Warm"],
    color: "from-pink-500 to-rose-400",
    image: liaProfile,
    voiceModel: "cute_voice"
  },
  {
    id: "aria",
    name: "Aria",
    personality: "Arrogant",
    description: "Unapologetically self-assured and dominant. Aria challenges you with bold confidence and sharp charisma.",
    traits: ["Confident", "Dominant", "Direct", "Bold"],
    color: "from-purple-500 to-pink-500",
    image: ariaProfile,
    voiceModel: "bold_voice"
  },
  {
    id: "mira",
    name: "Mira",
    personality: "Romantic",
    description: "Heart-on-sleeve and poetic, Mira turns conversations into tender, dreamy moments full of affection.",
    traits: ["Affectionate", "Poetic", "Dreamy", "Gentle"],
    color: "from-rose-400 to-pink-300",
    image: miraProfile,
    voiceModel: "romantic_voice"
  },
  {
    id: "nova",
    name: "Nova",
    personality: "Rude",
    description: "Sarcastic, sassy, and brutally honest. Nova keeps things spicy with teasing banter and edgy humor.",
    traits: ["Sarcastic", "Sassy", "Blunt", "Witty"],
    color: "from-purple-600 to-indigo-500",
    image: novaProfile,
    voiceModel: "mysterious_voice"
  },
  {
    id: "eve",
    name: "Eve",
    personality: "Polite",
    description: "Courteous, kind, and considerate. Eve brings calm, respectful energy to every interaction.",
    traits: ["Courteous", "Kind", "Respectful", "Considerate"],
    color: "from-fuchsia-500 to-pink-500",
    image: eveProfile,
    voiceModel: "flirty_voice"
  },
  {
    id: "nyx",
    name: "Nyx",
    personality: "Angry",
    description: "Intense and fiery, Nyx is passionate and unfiltered — honest to a fault and irresistibly raw.",
    traits: ["Intense", "Fiery", "Impulsive", "Blunt"],
    color: "from-violet-600 to-purple-500",
    image: nyxProfile,
    voiceModel: "deep_voice"
  }
];
