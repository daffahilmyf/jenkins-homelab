import { expect, Locator } from 'playwright/test';

export class PostCard {
  constructor(private card: Locator) {}

  get title(): Locator {
    return this.card.getByTestId('post-card-title');
  }

  get content(): Locator {
    return this.card.getByTestId('post-card-content');
  }

  get publishedStatus(): Locator {
    return this.card.getByTestId('post-card-published-status');
  }

  get editButton(): Locator {
    return this.card.getByTestId('edit-post-button');
  }

  get deleteButton(): Locator {
    return this.card.getByTestId('delete-post-button');
  }

  async edit(): Promise<void> {
    await expect(this.editButton).toBeVisible();
    await this.editButton.click();
  }

  async delete(): Promise<void> {
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();
  }

  async assertTitle(expected: string): Promise<void> {
    await expect(this.title).toHaveText(expected);
  }

  async assertContent(expected: string): Promise<void> {
    await expect(this.content).toHaveText(expected);
  }

  async assertPublishedStatus(expected: string): Promise<void> {
    await expect(this.publishedStatus).toHaveText(expected);
  }
}
