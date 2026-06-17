// tests/purchase.spec.ts
import { test, expect } from '@playwright/test';

test('Flujo de compra de producto', async ({ page }) => {
  // 1. Acceso a la web (la sesión ya está inyectada por storageState)
  await page.goto('/');

  // 2. Validación de sesión
  await expect(page.locator('#nameofuser')).toBeVisible();

  // 3. Selección de producto
  await page.locator('.hrefch').first().click();

  // 4. Agregar al carrito y manejo de alerta
  
  page.once('dialog', dialog => dialog.accept());
  const addToCartBtn = page.getByRole('link', { name: 'Add to cart' });
  await addToCartBtn.click();

  // 5. Ir al carrito y tramitar pedido
  await page.getByRole('link', { name: 'Cart', exact: true }).click();
  await page.getByRole('button', { name: 'Place Order' }).click();

  // 6. Completar formulario
  await page.fill('#name', 'Test User');
  await page.fill('#country', 'Colombia');
  await page.fill('#city', 'Envigado');
  await page.fill('#card', '123456789');
  await page.fill('#month', '06');
  await page.fill('#year', '2026');
  
  await page.getByRole('button', { name: 'Purchase' }).click();

  // 7. Validación de éxito
  await expect(page.locator('h2:has-text("Thank you for your purchase!")')).toBeVisible();
});