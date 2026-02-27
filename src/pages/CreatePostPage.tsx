import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { callAi } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMOTIONS = ["Happy", "Sad", "Angry", "Anxious", "Frustrated"];
const CATEGORIES = ["College", "Relationships", "Work", "Family", "General"];

export default function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("General");
  const [category, setCategory] = useState("General");
  const [crisisWarning, setCrisisWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingEmotion, setDetectingEmotion] = useState(false);

  const detectEmotion = async () => {
    if (!content.trim()) return;
    setDetectingEmotion(true);
    try {
      const detected = await callAi("detect_emotion", content);
      const cleaned = detected.trim();
      if (EMOTIONS.includes(cleaned)) {
        setEmotion(cleaned);
        toast({ title: "Emotion Detected", description: `AI detected: ${cleaned}` });
      } else {
        toast({ title: "Detection", description: `AI returned: ${cleaned}`, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDetectingEmotion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);

    try {
      // Crisis check
      const crisisResult = await callAi("crisis_check", content);
      const isCrisis = crisisResult.trim().toUpperCase() === "YES";
      setCrisisWarning(isCrisis);

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        emotion,
        category,
        is_crisis: isCrisis,
      });

      if (error) throw error;
      toast({ title: "Posted!", description: "Your anonymous post is live." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-xl py-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Share Anonymously</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts... Everything here is anonymous."
                rows={5}
                required
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label>Emotion</Label>
                <div className="flex gap-2">
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMOTIONS.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={detectEmotion} disabled={detectingEmotion || !content.trim()} title="AI detect emotion">
                    {detectingEmotion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {crisisWarning && (
              <div className="flex items-start gap-2 rounded-lg border border-crisis/30 bg-crisis/10 p-3 text-sm text-crisis">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>If you are in immediate danger, please contact a mental health helpline in your area. Your post has been saved.</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Anonymously
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
