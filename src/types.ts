export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt?: string;
}

export interface WardrobeItem {
  id: number;
  name: string;
  category: 'OUTERWEAR' | 'INNERWEAR' | 'BOTTOMS' | 'ACCESSORIES' | 'FOOTWEAR';
  era: string;
  imageUrl: string;
  description: string;
  culturalContext: string;
  isHeritage: boolean;
}

export interface OutfitPost {
  id: number;
  title: string;
  event: string;
  aiFeedback: string;
  isApproved: boolean;
  culturalScore: number;
  imageUrl: string;
  author: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string;
    bio: string;
  };
  itemIds: number[];
  items?: WardrobeItem[];
  tags: string[];
  likesCount: number;
  createdAt: string;
}

export interface EvaluationResponse {
  status: 'APPROVED' | 'REJECTED';
  culturalScore: number;
  gatekeeperTitle: string;
  feedback: string;
  culturalNotes: string;
  stylingTips: string;
  hashtags: string[];
  isApproved: boolean;
}
