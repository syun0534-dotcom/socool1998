import type { PairingId, PriceBandId, ThemeId, WineType } from "./types.ts";

export const PRICE_BANDS: {
  id: PriceBandId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "price_entry", label: "입문", min: 0, max: 25000 },
  { id: "price_everyday", label: "데일리", min: 25001, max: 40000 },
  { id: "price_gift_light", label: "가벼운 선물", min: 40001, max: 60000 },
  { id: "price_gift_std", label: "표준 선물", min: 60001, max: 100000 },
  { id: "price_premium", label: "프리미엄", min: 100001, max: 200000 },
  { id: "price_icon", label: "아이콘", min: 200001, max: Number.POSITIVE_INFINITY },
];

export const THEMES: { id: ThemeId; label: string; hint: string }[] = [
  { id: "th_birthday", label: "생일", hint: "축하·밝은 분위기" },
  { id: "th_promotion", label: "승진·취임", hint: "격식·리스펙트" },
  { id: "th_housewarming", label: "집들이", hint: "부담 없는 선물" },
  { id: "th_date", label: "데이트", hint: "로맨틱·부담 ↓" },
  { id: "th_dinner_guest", label: "손님 초대", hint: "테이블 와인" },
  { id: "th_thanks", label: "감사·인사", hint: "무난·품위" },
  { id: "th_holiday", label: "명절·연말", hint: "시즌 선물" },
  { id: "th_valentine", label: "발렌타인", hint: "스파클링·로제" },
  { id: "th_everyday", label: "오늘 한 잔", hint: "데일리 가성비" },
  { id: "th_beginner", label: "입문 추천", hint: "실패 최소화" },
  { id: "th_collect", label: "셀러·보관", hint: "중장기" },
];

export const PAIRINGS: { id: PairingId; label: string }[] = [
  { id: "pair_steak", label: "스테이크·적육" },
  { id: "pair_pork", label: "돼지고기" },
  { id: "pair_chicken", label: "치킨·백육" },
  { id: "pair_seafood", label: "해산물" },
  { id: "pair_oyster", label: "오이스터" },
  { id: "pair_pasta_cream", label: "크림 파스타" },
  { id: "pair_pasta_tomato", label: "토마토 파스타" },
  { id: "pair_pizza", label: "피자" },
  { id: "pair_cheese_soft", label: "소프트 치즈" },
  { id: "pair_cheese_hard", label: "하드 치즈" },
  { id: "pair_spicy", label: "매운 한식" },
  { id: "pair_bbq", label: "바비큐·그릴" },
  { id: "pair_dessert", label: "디저트" },
  { id: "pair_aperitif", label: "식전" },
];

export const WINE_TYPE_LABEL: Record<WineType, string> = {
  type_red: "레드",
  type_white: "화이트",
  type_rose: "로제",
  type_sparkling: "스파클링",
  type_orange: "오렌지",
};

export function priceBandFor(price: number): PriceBandId {
  const band = PRICE_BANDS.find((b) => price >= b.min && price <= b.max);
  return band?.id ?? "price_icon";
}

export function formatWon(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}
