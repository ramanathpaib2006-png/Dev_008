import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import PostCard from "@/components/PostCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const EMOTIONS = ["All", "Happy", "Sad", "Angry", "Anxious", "Frustrated"];
const CATEGORIES = ["All", "College", "Relationships", "Work", "Family", "General"];

export default function FeedPage() {
  const [posts, setPosts] = useState<Tables<"posts">[]>([]);
  const [loading, setLoading] = useState(true);
  const [emotionFilter, setEmotionFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (emotionFilter !== "All") query = query.eq("emotion", emotionFilter);
    if (categoryFilter !== "All") query = query.eq("category", categoryFilter);
    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [emotionFilter, categoryFilter]);

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Community Feed</h1>
        <p className="text-sm text-muted-foreground">Anonymous stories from your community</p>
      </div>

      <div className="mb-4 flex gap-3">
        <Select value={emotionFilter} onValueChange={setEmotionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Emotion" />
          </SelectTrigger>
          <SelectContent>
            {EMOTIONS.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No posts yet. Be the first to share.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
