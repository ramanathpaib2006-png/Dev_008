import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { callAi } from "@/lib/ai";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const emotionColors: Record<string, string> = {
  Happy: "bg-emotion-happy text-success-foreground",
  Sad: "bg-emotion-sad text-primary-foreground",
  Angry: "bg-emotion-angry text-destructive-foreground",
  Anxious: "bg-emotion-anxious text-accent-foreground",
  Frustrated: "bg-emotion-frustrated text-primary-foreground",
};

interface PostCardProps {
  post: Tables<"posts">;
  onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [support, setSupport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === post.user_id;

  const handleSupport = async () => {
    setLoading(true);
    try {
      const result = await callAi("generate_support", post.content);
      setSupport(result);
      // Create notification for post owner
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        message: `Someone generated a supportive response for your post: "${post.content.slice(0, 50)}..."`,
      });
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      onDelete?.();
    }
  };

  return (
    <Card className="animate-fade-in overflow-hidden">
      {post.is_crisis && (
        <div className="flex items-center gap-2 bg-crisis/10 px-4 py-2 text-sm text-crisis">
          <AlertTriangle className="h-4 w-4" />
          If you are in immediate danger, please contact a mental health helpline.
        </div>
      )}
      <CardContent className="p-4">
        <p className="mb-3 text-sm leading-relaxed">{post.content}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={emotionColors[post.emotion] || "bg-secondary text-secondary-foreground"}>
            {post.emotion}
          </Badge>
          <Badge variant="outline">{post.category}</Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSupport} disabled={loading || !!support}>
            {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
            {support ? "Generated" : "Generate Support"}
          </Button>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {support && (
          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-medium text-primary">💛 AI Support</p>
            <p className="mt-1 text-muted-foreground">{support}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
