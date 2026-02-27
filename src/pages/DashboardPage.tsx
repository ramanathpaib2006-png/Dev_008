import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const EMOTIONS = ["Happy", "Sad", "Angry", "Anxious", "Frustrated"];

const emotionEmoji: Record<string, string> = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  Anxious: "😰",
  Frustrated: "😤",
};

const emotionBarColor: Record<string, string> = {
  Happy: "bg-emotion-happy",
  Sad: "bg-emotion-sad",
  Angry: "bg-emotion-angry",
  Anxious: "bg-emotion-anxious",
  Frustrated: "bg-emotion-frustrated",
};

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: posts } = await supabase.from("posts").select("emotion, created_at");
      if (!posts) { setLoading(false); return; }

      const c: Record<string, number> = {};
      let today = 0;
      const todayStr = new Date().toISOString().slice(0, 10);

      for (const p of posts) {
        c[p.emotion] = (c[p.emotion] || 0) + 1;
        if (p.created_at.slice(0, 10) === todayStr) today++;
      }

      setCounts(c);
      setTotal(posts.length);
      setTodayCount(today);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-6">
      <h1 className="mb-6 font-heading text-2xl font-bold">Community Mood Dashboard</h1>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{total}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{todayCount}</p>
            <p className="text-sm text-muted-foreground">Posts Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Emotion Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {EMOTIONS.map((e) => {
            const count = counts[e] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={e} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {emotionEmoji[e]} {e}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${emotionBarColor[e]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
