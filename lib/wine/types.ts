export type WineType =
  | "type_red"
  | "type_white"
  | "type_rose"
  | "type_sparkling"
  | "type_orange";

export type ThemeId =
  | "th_birthday"
  | "th_promotion"
  | "th_housewarming"
  | "th_date"
  | "th_dinner_guest"
  | "th_thanks"
  | "th_holiday"
  | "th_valentine"
  | "th_everyday"
  | "th_beginner"
  | "th_collect";

export type PairingId =
  | "pair_steak"
  | "pair_pork"
  | "pair_chicken"
  | "pair_seafood"
  | "pair_oyster"
  | "pair_pasta_cream"
  | "pair_pasta_tomato"
  | "pair_pizza"
  | "pair_cheese_soft"
  | "pair_cheese_hard"
  | "pair_spicy"
  | "pair_bbq"
  | "pair_dessert"
  | "pair_aperitif";

export type PriceBandId =
  | "price_entry"
  | "price_everyday"
  | "price_gift_light"
  | "price_gift_std"
  | "price_premium"
  | "price_icon";

export type Store = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  hours: string;
  blurb: string;
};

export type WineMaster = {
  sku: string;
  name: string;
  nameKo: string;
  producer: string;
  region: string;
  country: string;
  grape: string;
  type: WineType;
  story: string;
  themes: ThemeId[];
  pairings: PairingId[];
  body: "light" | "medium" | "full";
  sweetness: "dry" | "off" | "medium";
  accent: string;
};

export type StoreInventory = {
  storeId: string;
  sku: string;
  qty: number;
  price: number;
  shelfZone: string;
};

export type RecommendFilters = {
  storeId: string;
  themes?: ThemeId[];
  pairings?: PairingId[];
  priceBands?: PriceBandId[];
};

export type RankedWine = {
  wine: WineMaster;
  inventory: StoreInventory;
  score: number;
};
