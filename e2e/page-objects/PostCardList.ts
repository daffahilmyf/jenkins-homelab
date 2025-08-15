import { Page, Locator, expect } from 'playwright/test';
import { PostCard } from './PostCard';

export class PostCardList {
  constructor(private page: Page) {}

  private get allCards(): Locator {
    return this.page.locator('[data-testid^="post-card-"]');
  }

  get firstCard(): PostCard {
    return new PostCard(this.allCards.first());
  }

  getCardByIndex(index: number): PostCard {
    return new PostCard(this.allCards.nth(index));
  }

  getCardById(postId: string): PostCard {
    return new PostCard(this.page.getByTestId(`post-card-${postId}`));
  }

  getCardByTitle(title: string): PostCard {
    const card = this.allCards.filter({
      has: this.page.getByTestId('post-card-title'),
      hasText: title,
    });
    return new PostCard(card);
  }

  async count(): Promise<number> {
    return await this.allCards.count();
  }

  async expectCardCount(expectedCount: number): Promise<void> {
    await expect(this.allCards).toHaveCount(expectedCount);
  }
}
