import { supabase } from "@/integrations/supabase/client";

type AiAction = "detect_emotion" | "crisis_check" | "generate_support";

export async function callAi(action: AiAction, text: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-helper", {
    body: { action, text },
  });

  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.result;
}
