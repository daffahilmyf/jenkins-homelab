import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { PostCardList } from './page-objects/PostCardList';

// Define the viewport sizes we want to test
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

test.describe('Visual and Responsiveness Testing', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  // Visual Regression Test for the main container
  test('should match the screenshot of the main container', async () => {
    await expect(homePage.mainContainer).toHaveScreenshot('main-container.png', { threshold: 0.2 });
  });

  // Visual Regression Test for the PostCard component
  test('should match the screenshot of the first post card', async ({ page }) => {
    const postCardList = new PostCardList(page);
    await expect(postCardList.firstCard.locator).toHaveScreenshot('post-card.png', { threshold: 0.2 });
  });

  // Responsiveness Tests
  for (const viewport of viewports) {
    test(`should be responsive on ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(homePage.postListContainer).toHaveScreenshot(`post-list-container-${viewport.name}.png`, { threshold: 0.2 });
    });
  }
});