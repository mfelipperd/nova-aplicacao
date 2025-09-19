export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'local';
}

export interface Image {
  id: string;
  url: string;
  filename: string;
  uploadedAt: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
  comments?: Comment[];
  likes?: number;
  likedBy?: string[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface Party {
  id: string;
  name: string;
  qrCode: string;
  createdAt: Date;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
