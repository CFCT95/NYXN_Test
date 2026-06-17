// tests/auth.setup.ts
import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

setup('login y guardado de sesión', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  
  // USUARIO Y CONTRASEÑA
  await loginPage.login('testuser_nyxn', 'password123');

  // Esperamos a que la UI confirme el login
  await page.waitForSelector('#nameofuser', { timeout: 10000 });
  
  // Guardamos la sesión
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});