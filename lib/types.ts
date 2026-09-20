export type Memo = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export function memoFromRow(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
