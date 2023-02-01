export interface ApiMe {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
}

export interface ResGetMe {
  data: ApiMe;
}
