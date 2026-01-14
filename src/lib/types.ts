export type UserRole = "user" | "admin";
export type ReportStatus = "open" | "resolved" | "dismissed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          role: UserRole;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          role?: UserRole;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          role?: UserRole;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
          score: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
          score?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          score?: number;
        };
      };
      votes: {
        Row: {
          user_id: string;
          story_id: string;
          vote_type: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          story_id: string;
          vote_type: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          story_id?: string;
          vote_type?: number;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          story_id: string;
          reporter_id: string;
          reason: string | null;
          created_at: string;
          status: ReportStatus;
          admin_note: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          story_id: string;
          reporter_id: string;
          reason?: string | null;
          created_at?: string;
          status?: ReportStatus;
          admin_note?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          story_id?: string;
          reporter_id?: string;
          reason?: string | null;
          created_at?: string;
          status?: ReportStatus;
          admin_note?: string | null;
          resolved_at?: string | null;
        };
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Story = Database["public"]["Tables"]["stories"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];

export type StoryWithAuthor = Story & {
  profiles: Pick<Profile, "username" | "avatar_url">;
  user_vote?: number | null;
};

export type ReportWithDetails = Report & {
  stories: Pick<Story, "id" | "content" | "created_at" | "score">;
  reporter: Pick<Profile, "username" | "avatar_url">;
};
