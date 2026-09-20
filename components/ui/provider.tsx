"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        },
        body: {
          value: '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        },
      },
    },
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
