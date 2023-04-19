export interface GithubAuth {
  id: string;
  nodeId: string;
  displayName: string;
  username: string;
  profileUrl: string;
  photos?: Array<{ value: string }> | null;
  provider: string;
  _raw: string;
  _json: GithubAuthProfile;
  emails?: Array<{ value: string }> | null;
}

export interface GithubAuthProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company?: string;
  blog: string;
  location: string;
  email?: null;
  hireable?: null;
  bio: string;
  twitter_username?: null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}
