// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginMenu: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Solo definimos la estructura, no los datos
    this.loginMenu = page.locator('#login2');
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');
    this.loginButton = page.locator('button[onclick="logIn()"]');
  }

  async navigate() {
    await this.page.goto('/');
  }

  // Aquí recibimos los datos como argumentos
  async login(user: string, pass: string) {
    await this.loginMenu.click();
    await this.usernameInput.waitFor({ state: 'visible' });
    
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}