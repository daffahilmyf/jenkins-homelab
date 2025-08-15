import { Page, Locator } from 'playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  get mainContainer(): Locator {
    return this.page.locator('main');
  }

  get postListContainer(): Locator {
    return this.page.getByTestId('post-list-container');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
