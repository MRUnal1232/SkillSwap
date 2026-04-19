export interface Skill {
  id: number;
  skill_name: string;
  category: string;
}

export interface Mentor {
  id: number;
  name: string;
  skill_name: string;
  category: string;
  avg_rating: string | number | null;
  total_reviews: number;
}

export interface UserSkill extends Skill {}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  credits: number;
  avgRating: string | number | null;
  totalReviews: number;
  created_at: string;
  offeredSkills: UserSkill[];
  learnSkills: UserSkill[];
}

export interface Review {
  id: number;
  reviewer_name: string;
  skill_name: string;
  rating: number;
  comment?: string;
}

export interface Slot {
  id: number;
  user_id?: number;
  skill_id: number;
  skill_name: string;
  category: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export type SessionStatus = "booked" | "completed" | "cancelled";

export interface Session {
  id: number;
  skill_name: string;
  mentor_name: string;
  learner_name: string;
  start_time: string;
  status: SessionStatus;
  learner_id: number;
  mentor_id: number;
}

export interface ChatContact {
  contact_id: number;
  contact_name: string;
}

export interface ChatMessage {
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
}
