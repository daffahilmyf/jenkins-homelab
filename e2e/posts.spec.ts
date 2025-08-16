import { test, expect } from '@playwright/test';
import { PostForm } from './page-objects/PostForm';

test.describe('Post Form', () => {
  let postForm: PostForm;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    postForm = new PostForm(page);
  });

  test.describe('Form Submission', () => {
    test('should create a published post', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Published Post',
        content: 'This is a published post.',
        published: true,
      });
      await postForm.submitForm();
    });

    test('should create a draft post when published is false', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Draft Post',
        content: 'This post should be a draft.',
        published: false,
      });
      await postForm.submitForm();
    });

    test('should show validation error when title is missing', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: '',
        content: 'Missing title',
        published: true,
      });

      await postForm.submitButton.click();
      await postForm.expectValidationErrorOnField('title');
    });

    test('should show validation error when content is missing', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Title only',
        content: '',
        published: true,
      });

      await postForm.submitButton.click();
      await postForm.expectValidationErrorOnField('content');
    });

    test.skip('should prevent double submission', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Spammy Post',
        content: 'Clicking too fast!',
        published: true,
      });

      await Promise.all([postForm.submitForm(), postForm.submitForm()]);

      await expect(postForm.postForm).not.toBeVisible();
    });
  });

  test.describe('Form Behavior', () => {
    test('should close form when canceled', async () => {
      await postForm.openForm();
      await postForm.cancelForm();
    });

    test('should reset form fields after submission', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Reset on Submit',
        content: 'This will reset',
        published: true,
      });
      await postForm.submitForm();

      await postForm.openForm();
      await expect(postForm.titleInput).toHaveValue('');
      await expect(postForm.contentInput).toHaveValue('');
      await expect(postForm.publishedCheckbox).not.toBeChecked();
    });

    test('should reset form fields after canceling', async () => {
      await postForm.openForm();
      await postForm.fillForm({
        title: 'Reset on Cancel',
        content: 'This will also reset',
        published: true,
      });
      await postForm.cancelForm();

      await postForm.openForm();
      await expect(postForm.titleInput).toHaveValue('');
      await expect(postForm.contentInput).toHaveValue('');
      await expect(postForm.publishedCheckbox).not.toBeChecked();
    });

    test('should show published checkbox unchecked by default', async () => {
      await postForm.openForm();
      await expect(postForm.publishedCheckbox).not.toBeChecked();
    });
  });
});
