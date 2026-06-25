import { test, expect } from "@playwright/test";

test("renderiza 8 cards e abre jogo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("img[alt='Bora Jogar']")).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(8);

  await page.getByRole("button", { name: /Conexoes do Saber/i }).click();
  await expect(page.getByRole("heading", { name: /Conexoes do Saber/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Validar/i })).toBeVisible();
});

test("abre labirinto com controles", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Rota em Rede/i }).click();
  await expect(page.getByRole("button", { name: "Cima" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Baixo" })).toBeVisible();
});
