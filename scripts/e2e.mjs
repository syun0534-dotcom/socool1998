import { chromium } from "playwright-core";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHROME_PATH =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.getByRole("button", { name: "Google로 계속하기", exact: true }).waitFor();
    await page.getByRole("button", { name: "로그인", exact: true }).waitFor();
    await page.getByRole("button", { name: "회원가입", exact: true }).waitFor();
    if (!(await page.getByText("계정으로 로그인하세요").isVisible())) {
      throw new Error("로그인 안내 문구가 없습니다");
    }
    console.log("E2E OK");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
