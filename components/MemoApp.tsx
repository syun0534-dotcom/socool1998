"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { MemoDetail } from "@/components/MemoDetail";
import { Sidebar } from "@/components/Sidebar";
import { Provider } from "@/components/ui/provider";
import { deleteMemo, insertMemo, listMemos, updateMemo } from "@/lib/memos";
import { filterMemos } from "@/lib/search";
import { selectAfterDelete } from "@/lib/selection";
import { createClient } from "@/lib/supabase/client";
import type { Memo } from "@/lib/types";

type PendingNav = { type: "new" } | { type: "select"; id: string };

function createEmptyMemo(): Memo {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function MemoApp() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Memo | null>(null);
  const [isNewDraft, setIsNewDraft] = useState(false);
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMemos()
      .then((loaded) => {
        if (cancelled) return;
        setMemos(loaded);
        setSelectedId(loaded[0]?.id ?? null);
        setHydrated(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "메모를 불러오지 못했습니다",
        );
        setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    if (!isEditing || !draft) return false;
    if (isNewDraft) {
      return draft.title.trim() !== "" || draft.body.trim() !== "";
    }
    const original = memos.find((memo) => memo.id === draft.id);
    if (!original) return true;
    return draft.title !== original.title || draft.body !== original.body;
  }, [draft, isEditing, isNewDraft, memos]);

  const clearEditState = useCallback(() => {
    setIsEditing(false);
    setDraft(null);
    setIsNewDraft(false);
  }, []);

  const startNewMemo = useCallback(() => {
    const next = createEmptyMemo();
    setDraft(next);
    setIsNewDraft(true);
    setIsEditing(true);
    setSelectedId(next.id);
  }, []);

  const applySelect = useCallback(
    (id: string) => {
      clearEditState();
      setSelectedId(id);
    },
    [clearEditState],
  );

  const handleNewMemo = useCallback(() => {
    if (isEditing && isNewDraft && !hasUnsavedChanges()) {
      return;
    }
    if (hasUnsavedChanges()) {
      setPendingNav({ type: "new" });
      return;
    }
    startNewMemo();
  }, [hasUnsavedChanges, isEditing, isNewDraft, startNewMemo]);

  const handleSelect = useCallback(
    (id: string) => {
      if (id === selectedId) return;
      if (hasUnsavedChanges()) {
        setPendingNav({ type: "select", id });
        return;
      }
      applySelect(id);
    },
    [applySelect, hasUnsavedChanges, selectedId],
  );

  const handleConfirmNav = useCallback(() => {
    if (!pendingNav) return;
    if (pendingNav.type === "new") {
      startNewMemo();
    } else {
      applySelect(pendingNav.id);
    }
    setPendingNav(null);
  }, [applySelect, pendingNav, startNewMemo]);

  const handleEdit = useCallback(() => {
    const memo = memos.find((item) => item.id === selectedId);
    if (!memo) return;
    setDraft({ ...memo });
    setIsNewDraft(false);
    setIsEditing(true);
  }, [memos, selectedId]);

  const handleSave = useCallback(async () => {
    if (!draft) return;
    try {
      const saved = isNewDraft
        ? await insertMemo(draft)
        : await updateMemo(draft);
      setMemos((current) => [
        saved,
        ...current.filter((memo) => memo.id !== saved.id),
      ]);
      clearEditState();
      setSelectedId(saved.id);
      setErrorMessage(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "메모를 저장하지 못했습니다",
      );
    }
  }, [clearEditState, draft, isNewDraft]);

  const handleCancel = useCallback(() => {
    if (isNewDraft) {
      clearEditState();
      setSelectedId(memos[0]?.id ?? null);
      return;
    }
    clearEditState();
  }, [clearEditState, isNewDraft, memos]);

  const executeDelete = useCallback(async () => {
    if (!selectedId) return;

    if (isNewDraft && draft?.id === selectedId) {
      clearEditState();
      setSelectedId(memos[0]?.id ?? null);
      return;
    }

    const visible = filterMemos(memos, query);
    try {
      await deleteMemo(selectedId);
      const next = memos.filter((memo) => memo.id !== selectedId);
      setMemos(next);
      clearEditState();
      setSelectedId(selectAfterDelete(visible, selectedId)?.id ?? null);
      setErrorMessage(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "메모를 삭제하지 못했습니다",
      );
    }
  }, [clearEditState, draft?.id, isNewDraft, memos, query, selectedId]);

  const handleDraftChange = useCallback((patch: { title?: string; body?: string }) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  const listMemosToShow = useMemo(() => {
    const filtered = filterMemos(memos, query);
    if (isEditing && isNewDraft && draft) {
      return [draft, ...filtered];
    }
    return filtered;
  }, [draft, isEditing, isNewDraft, memos, query]);

  const selectedMemo = useMemo(() => {
    if (isEditing && draft && draft.id === selectedId) return draft;
    return memos.find((memo) => memo.id === selectedId) ?? null;
  }, [draft, isEditing, memos, selectedId]);

  if (!hydrated) {
    return (
      <Provider>
        <Flex h="100vh" align="center" justify="center" bg="bg">
          <Text color="fg.muted">메모를 불러오는 중...</Text>
        </Flex>
      </Provider>
    );
  }

  return (
    <Provider>
      <Flex h="100vh" minH="0" direction={{ base: "column", md: "row" }} bg="bg" color="fg">
        <Sidebar
          memos={listMemosToShow}
          selectedId={selectedId}
          query={query}
          draftId={isNewDraft && draft ? draft.id : null}
          hasAnyMemos={memos.length > 0 || isNewDraft}
          errorMessage={errorMessage}
          onQueryChange={setQuery}
          onNewMemo={handleNewMemo}
          onSelect={handleSelect}
          onLogout={handleLogout}
        />
        <MemoDetail
          memo={selectedMemo}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={() => {
            void handleSave();
          }}
          onCancel={handleCancel}
          onDelete={() => {
            if (!selectedId) return;
            setDeleteOpen(true);
          }}
          onDraftChange={handleDraftChange}
        />

        <Dialog.Root
          role="alertdialog"
          open={pendingNav !== null}
          onOpenChange={(event) => {
            if (!event.open) setPendingNav(null);
          }}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>저장하지 않은 변경이 있습니다</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Dialog.Description>
                    저장하지 않은 변경이 있습니다. 이동할까요?
                  </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => setPendingNav(null)}>
                    취소
                  </Button>
                  <Button colorPalette="teal" onClick={handleConfirmNav}>
                    확인
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <Dialog.Root
          role="alertdialog"
          open={deleteOpen}
          onOpenChange={(event) => setDeleteOpen(event.open)}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>이 메모를 삭제할까요?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Dialog.Description>
                    삭제한 메모는 되돌릴 수 없습니다.
                  </Dialog.Description>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    취소
                  </Button>
                  <Button
                    colorPalette="red"
                    onClick={() => {
                      void executeDelete();
                      setDeleteOpen(false);
                    }}
                  >
                    확인
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Flex>
    </Provider>
  );
}
