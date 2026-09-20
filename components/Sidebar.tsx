import type { CSSProperties } from "react";
import { LogOut, Plus } from "lucide-react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Separator,
  Text,
  visuallyHiddenStyle,
} from "@chakra-ui/react";
import { MemoListItem } from "@/components/MemoListItem";
import type { Memo } from "@/lib/types";

type SidebarProps = {
  memos: Memo[];
  selectedId: string | null;
  query: string;
  draftId: string | null;
  hasAnyMemos: boolean;
  errorMessage?: string | null;
  onQueryChange: (query: string) => void;
  onNewMemo: () => void;
  onSelect: (id: string) => void;
  onLogout: () => void;
};

export function Sidebar({
  memos,
  selectedId,
  query,
  draftId,
  hasAnyMemos,
  errorMessage,
  onQueryChange,
  onNewMemo,
  onSelect,
  onLogout,
}: SidebarProps) {
  const emptyMessage = query.trim()
    ? "검색 결과가 없습니다"
    : hasAnyMemos
      ? "이 목록에 표시할 메모가 없습니다"
      : "메모가 없습니다";

  return (
    <Box
      as="aside"
      display="flex"
      flexDir="column"
      w={{ base: "full", md: "320px" }}
      h={{ base: "42vh", md: "full" }}
      flexShrink={0}
      bg="bg.subtle"
      borderBottomWidth={{ base: "1px", md: "0" }}
      borderRightWidth={{ base: "0", md: "1px" }}
      borderColor="border"
    >
      <Box px="4" py="4">
        <Flex mb="3" align="center" justify="space-between" gap="2">
          <Heading as="h1" size="lg">
            메모
          </Heading>
          <Button size="sm" colorPalette="teal" onClick={onNewMemo}>
            <Plus size={16} />
            새 메모
          </Button>
        </Flex>
        <label htmlFor="memo-search" style={visuallyHiddenStyle as CSSProperties}>
          메모 검색
        </label>
        <Input
          id="memo-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="메모 검색"
        />
        {errorMessage ? (
          <Text mt="2" fontSize="xs" color="red.500">
            {errorMessage}
          </Text>
        ) : null}
      </Box>
      <Separator />
      <Box flex="1" minH="0" overflowY="auto" p="3">
        {memos.length === 0 ? (
          <Text px="1" py="8" textAlign="center" fontSize="sm" color="fg.muted">
            {emptyMessage}
          </Text>
        ) : (
          <Flex direction="column" gap="2">
            {memos.map((memo) => (
              <MemoListItem
                key={memo.id}
                memo={memo}
                selected={memo.id === selectedId}
                unsavedDraft={memo.id === draftId}
                onSelect={onSelect}
              />
            ))}
          </Flex>
        )}
      </Box>
      <Separator />
      <Box px="4" py="3">
        <Button variant="outline" size="sm" w="full" onClick={onLogout}>
          <LogOut size={16} />
          로그아웃
        </Button>
      </Box>
    </Box>
  );
}
