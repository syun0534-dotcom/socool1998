"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { displayTitle, formatMemoDate } from "@/lib/format";
import type { Memo } from "@/lib/types";

type MemoDetailProps = {
  memo: Memo | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDraftChange: (patch: { title?: string; body?: string }) => void;
};

export function MemoDetail({
  memo,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDraftChange,
}: MemoDetailProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      titleRef.current?.focus();
    }
  }, [isEditing, memo?.id]);

  useEffect(() => {
    if (!isEditing) return;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSave();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditing, onSave, onCancel]);

  if (!memo) {
    return (
      <Box
        as="section"
        display="flex"
        flex="1"
        h="full"
        alignItems="center"
        justifyContent="center"
        bg="bg"
        px="6"
      >
        <Text fontSize="sm" color="fg.muted">
          메모를 선택하거나 새로 만드세요
        </Text>
      </Box>
    );
  }

  return (
    <Box as="section" display="flex" flex="1" h="full" flexDir="column" bg="bg">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        gap="3"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.panel"
        px="5"
        py="3"
      >
        <Text fontSize="xs" color="fg.muted">
          {formatMemoDate(memo.updatedAt)}
        </Text>
        <Flex align="center" gap="2">
          {isEditing ? (
            <>
              <Button colorPalette="teal" onClick={onSave}>
                저장
              </Button>
              <Button variant="outline" onClick={onCancel}>
                취소
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onEdit}>
              <Pencil size={16} />
              수정
            </Button>
          )}
          <Button colorPalette="red" variant="subtle" onClick={onDelete}>
            <Trash2 size={16} />
            삭제
          </Button>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        flex="1"
        w="full"
        maxW="3xl"
        mx="auto"
        px="6"
        py="8"
      >
        {isEditing ? (
          <>
            <Input
              ref={titleRef}
              value={memo.title}
              onChange={(event) => onDraftChange({ title: event.target.value })}
              placeholder="제목"
              variant="flushed"
              fontSize="3xl"
              fontWeight="semibold"
              letterSpacing="tight"
              px="0"
              h="auto"
              border="none"
              _focusVisible={{ boxShadow: "none", borderColor: "transparent" }}
            />
            <Textarea
              value={memo.body}
              onChange={(event) => onDraftChange({ body: event.target.value })}
              placeholder="메모를 입력하세요"
              flex="1"
              resize="none"
              variant="flushed"
              fontSize="md"
              lineHeight="1.75"
              mt="6"
              px="0"
              border="none"
              _focusVisible={{ boxShadow: "none", borderColor: "transparent" }}
            />
          </>
        ) : (
          <>
            <Heading as="h2" size="3xl" fontWeight="semibold" letterSpacing="tight">
              {displayTitle(memo.title)}
            </Heading>
            <Box mt="6" fontSize="md" lineHeight="1.75" whiteSpace="pre-wrap">
              {memo.body.trim() ? (
                memo.body
              ) : (
                <Text as="span" color="fg.muted">
                  내용이 없습니다
                </Text>
              )}
            </Box>
          </>
        )}
      </Flex>
    </Box>
  );
}
