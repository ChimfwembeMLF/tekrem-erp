import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  allEmojis: string[];
  className?: string;
}

const baseCategories = [
  { key: 'faces', label: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😍', '😘', '😜', '🤪', '😎', '🤔', '😴', '😡'] },
  { key: 'gestures', label: 'Gestures', emojis: ['👍', '👎', '👏', '🙌', '🙏', '🤝', '👌', '🤌', '🫶', '🤞', '✌️', '🤟', '🤘', '🤙', '👊', '✊', '🤛', '🤜', '🤲', '🤗'] },
  { key: 'people', label: 'People', emojis: ['👶', '🧒', '👦', '👩', '🧑', '👨', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍⚕️', '👨‍⚕️', '👩‍🏫', '👨‍🏫', '👩‍💼', '👨‍💼', '🧑‍🍳', '👩‍🍳', '🧑‍🚀', '👩‍🚀', '👨‍🚀'] },
  { key: 'animals', label: 'Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣'] },
  { key: 'nature', label: 'Nature', emojis: ['🌵', '🌴', '🌱', '🌿', '🍀', '🍂', '🍁', '🌸', '🌻', '🌞', '🌙', '🌈', '⭐', '⚡', '🔥', '🌪️', '❄️', '🌊', '☁️', '☂️'] },
  { key: 'food', label: 'Food', emojis: ['🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥑', '🌶️', '🍔', '🍟', '🍕', '🌭', '🍿'] },
  { key: 'activities', label: 'Activities', emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊', '🥋', '🎮', '🎧', '🎤', '🎬', '🎨', '🎯', '🎳', '🎻', '🎲'] },
  { key: 'travel', label: 'Travel', emojis: ['🚗', '🚕', '🚌', '🚎', '🚓', '🚑', '🚒', '🚚', '✈️', '🛫', '🛬', '🛩️', '🚢', '⛵', '🚤', '🚲', '🏍️', '🚇', '🚉', '🗺️'] },
  { key: 'objects', label: 'Objects', emojis: ['⌚', '📱', '💻', '🖥️', '🖨️', '💡', '🔦', '🕯️', '💵', '💳', '🔑', '🛏️', '🛋️', '🧸', '🎁', '📚', '✏️', '✂️', '🔒', '🔔'] },
  { key: 'symbols', label: 'Symbols', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💖', '💘', '💝', '💟', '✔️', '❌'] },
  { key: 'flags', label: 'Flags', emojis: ['🏳️', '🏴', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇬🇧', '🇪🇺', '🇨🇦', '🇦🇺', '🇳🇿', '🇿🇦', '🇳🇬', '🇰🇪', '🇨🇳', '🇯🇵', '🇰🇷', '🇧🇷', '🇲🇽', '🇮🇳', '🇸🇬'] },
];

export default function EmojiPicker({ isOpen, onClose, onSelect, allEmojis, className = '' }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('faces');
  const [emojiAnim, setEmojiAnim] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [...baseCategories, { key: 'all', label: 'All', emojis: allEmojis }];
  }, [allEmojis]);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory('faces');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (emoji: string) => {
    setEmojiAnim(emoji);
    setTimeout(() => setEmojiAnim(null), 300);
    onSelect(emoji);
  };

  return (
    <div className={`${className} z-50 bg-white border rounded shadow-md p-2 w-72`}>
      <div className="mb-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Pick an emoji</span>
        <button
          className="text-blue-500 text-xs underline"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex overflow-x-auto pb-1">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="text-[11px] px-2 py-1 whitespace-nowrap"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-2 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key} className="mt-0">
              <div className="grid grid-cols-8 gap-1">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-lg p-1 hover:bg-gray-100 rounded transition-transform duration-200 ${emojiAnim === emoji ? 'scale-125 animate-bounce' : ''}`}
                    onClick={() => handleSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
