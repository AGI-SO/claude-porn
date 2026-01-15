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
          posted_via_mcp: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
          score?: number;
          posted_via_mcp?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          score?: number;
          posted_via_mcp?: boolean;
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
      comments: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      comment_reports: {
        Row: {
          id: string;
          comment_id: string;
          reporter_id: string;
          reason: string | null;
          created_at: string;
          status: ReportStatus;
          admin_note: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          comment_id: string;
          reporter_id: string;
          reason?: string | null;
          created_at?: string;
          status?: ReportStatus;
          admin_note?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          comment_id?: string;
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
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentReport = Database["public"]["Tables"]["comment_reports"]["Row"];

export type StoryWithAuthor = Story & {
  profiles: Pick<Profile, "username" | "avatar_url">;
  user_vote?: number | null;
  comment_count?: number;
};

export type ReportWithDetails = Report & {
  stories: Pick<Story, "id" | "content" | "created_at" | "score">;
  reporter: Pick<Profile, "username" | "avatar_url">;
};

export type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, "username" | "avatar_url">;
};

export type CommentReportWithDetails = CommentReport & {
  comments: Pick<Comment, "id" | "content" | "created_at"> & {
    story_id: string;
  };
  reporter: Pick<Profile, "username" | "avatar_url">;
};
