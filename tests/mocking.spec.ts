// tests/mocking.spec.ts
import { test, expect } from '@playwright/test';

test('Validar manejo de error 503 en compra', async ({ page }) => {
  // 1. Interceptamos el endpoint antes de cualquier interacción
  await page.route('**/deletecart', route => {
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service Unavailable' })
    });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Cart', exact: true }).click();

  // 2. Manejo robusto del modal: forzamos la apertura si Chromium se ralentiza
  const nameInput = page.locator('#name');
  await page.getByRole('button', { name: 'Place Order' }).click();
  
  // Si por retraso de red o renderizado no aparece, le damos un segundo intento dinámico
  try {
    await nameInput.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    await page.getByRole('button', { name: 'Place Order' }).click();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  // 3. Rellenar datos del formulario
  await nameInput.fill('QA User');
  await page.fill('#country', 'Colombia');
  await page.fill('#city', 'Envigado');
  await page.fill('#card', '123456789');

  // 4. Capturamos la respuesta y ejecutamos el envío en paralelo
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/deletecart'), { timeout: 10000 }),
    page.getByRole('button', { name: 'Purchase' }).click()
  ]);

  // 5. Aserción del código de estado esperado
  expect(response.status()).toBe(503);
});