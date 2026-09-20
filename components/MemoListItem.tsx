import { Badge, Box, Card, Flex, Text } from "@chakra-ui/react";
import { displayTitle, formatMemoDate, previewBody } from "@/lib/format";
import type { Memo } from "@/lib/types";

type MemoListItemProps = {
  memo: Memo;
  selected: boolean;
  unsavedDraft: boolean;
  onSelect: (id: string) => void;
};

export function MemoListItem({
  memo,
  selected,
  unsavedDraft,
  onSelect,
}: MemoListItemProps) {
  const title = unsavedDraft ? "제목 없음" : displayTitle(memo.title);
  const preview = unsavedDraft ? "새 메모" : previewBody(memo.body);

  return (
    <Box as="button" w="full" textAlign="left" onClick={() => onSelect(memo.id)}>
      <Card.Root
        size="sm"
        variant="outline"
        bg={selected ? "teal.50" : "bg"}
        borderColor={selected ? "teal.500" : "border"}
        borderWidth={selected ? "2px" : "1px"}
        _hover={{ bg: selected ? "teal.50" : "bg.muted" }}
        transition="background 0.15s ease"
      >
        <Card.Body gap="1">
          <Flex align="start" justify="space-between" gap="2">
            <Card.Title as="p" truncate>
              {title}
            </Card.Title>
            {unsavedDraft ? (
              <Badge colorPalette="orange" flexShrink={0}>
                작성 중
              </Badge>
            ) : null}
          </Flex>
          <Card.Description truncate>{preview}</Card.Description>
          <Text fontSize="xs" color="fg.muted">
            {unsavedDraft ? "미저장" : formatMemoDate(memo.updatedAt)}
          </Text>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
