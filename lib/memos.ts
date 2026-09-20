import { createClient } from "@/lib/supabase/client";
import { memoFromRow, type Memo, type MemoRow } from "@/lib/types";

export async function listMemos(): Promise<Memo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as MemoRow[]).map(memoFromRow);
}

export async function insertMemo(memo: Memo): Promise<Memo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  const { data, error } = await supabase
    .from("memos")
    .insert({
      id: memo.id,
      user_id: user.id,
      title: memo.title,
      body: memo.body,
    })
    .select()
    .single();

  if (error) throw error;
  return memoFromRow(data as MemoRow);
}

export async function updateMemo(memo: Memo): Promise<Memo> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("memos")
    .update({
      title: memo.title,
      body: memo.body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memo.id)
    .select()
    .single();

  if (error) throw error;
  return memoFromRow(data as MemoRow);
}

export async function deleteMemo(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("memos").delete().eq("id", id);
  if (error) throw error;
}
