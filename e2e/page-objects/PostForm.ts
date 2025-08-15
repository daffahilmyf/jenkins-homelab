import { expect, Page } from 'playwright/test';

export class PostForm {
  constructor(private page: Page) {}

  get postForm() {
    return this.page.getByTestId('post-form');
  }
  get titleInput() {
    return this.page.getByTestId('input-title');
  }
  get contentInput() {
    return this.page.getByTestId('input-content');
  }
  get publishedCheckbox() {
    return this.page.getByTestId('post-form-published-checkbox');
  }
  get openFormButton() {
    return this.page.getByTestId('create-post-button');
  }
  get submitButton() {
    return this.page.getByTestId('post-form-submit-button');
  }
  get cancelButton() {
    return this.page.getByTestId('cancel-button');
  }

  async openForm(): Promise<void> {
    await expect(this.openFormButton).toBeVisible();
    await this.openFormButton.click();
    await expect(this.postForm).toBeVisible();
  }

  async fillForm({
    title,
    content,
    published = false,
  }: {
    title: string;
    content: string;
    published?: boolean;
  }) {
    await expect(this.titleInput).toBeVisible();
    await expect(this.contentInput).toBeVisible();
    await expect(this.publishedCheckbox).toBeVisible();

    await this.titleInput.fill(title);
    await this.contentInput.fill(content);

    if (published) {
      await this.publishedCheckbox.check();
      await expect(this.publishedCheckbox).toBeChecked();
    } else {
      await this.publishedCheckbox.uncheck();
      await expect(this.publishedCheckbox).not.toBeChecked();
    }

    await expect(this.titleInput).toHaveValue(title);
    await expect(this.contentInput).toHaveValue(content);
  }

  async submitForm(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
    await expect(this.postForm).not.toBeVisible();
  }

  async cancelForm(): Promise<void> {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
    await expect(this.postForm).not.toBeVisible();
  }

  async expectValidationErrorOnField(
    field: 'title' | 'content',
    expectedMessage: string = 'Please fill out this field.'
  ): Promise<void> {
    const input = field === 'title' ? this.titleInput : this.contentInput;
    const actualMessage = await input.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(actualMessage).toBe(expectedMessage);
  }
}
