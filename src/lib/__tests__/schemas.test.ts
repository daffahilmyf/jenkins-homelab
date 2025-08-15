import { postCreateSchema, postUpdateSchema } from '@/lib/schemas';

describe('postCreateSchema', () => {
  it('should validate a post with valid title, content, and published status', () => {
    const validPost = { title: 'Test Title', content: 'Test Content', published: true };
    const result = postCreateSchema.safeParse(validPost);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validPost);
  });

  it('should fail validation if title is missing', () => {
    const invalidPost = { content: 'Test Content', published: true };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toEqual([
      'Invalid input: expected string, received undefined',
    ]);
  });

  it('should fail validation if title is empty', () => {
    const invalidPost = { title: '', content: 'Test Content', published: true };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toEqual(['Title is required']);
  });

  it('should fail validation if content is missing', () => {
    const invalidPost = { title: 'Test Title', published: true };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.content).toEqual([
      'Invalid input: expected string, received undefined',
    ]);
  });

  it('should fail validation if content is empty', () => {
    const invalidPost = { title: 'Test Title', content: '', published: true };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.content).toEqual(['Content is required']);
  });

  it('should fail validation if published is missing', () => {
    const invalidPost = { title: 'Test Title', content: 'Test Content' };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.published).toEqual([
      'Invalid input: expected boolean, received undefined',
    ]);
  });

  it('should fail validation if published is not a boolean', () => {
    const invalidPost = {
      title: 'Test Title',
      content: 'Test Content',
      published: 'not a boolean',
    };
    const result = postCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.published).toEqual([
      'Invalid input: expected boolean, received string',
    ]);
  });
});

describe('postUpdateSchema', () => {
  it('should validate a post with valid title and content', () => {
    const validUpdate = { title: 'Updated Title', content: 'Updated Content' };
    const result = postUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validUpdate);
  });

  it('should validate a post with only title', () => {
    const validUpdate = { title: 'Updated Title' };
    const result = postUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validUpdate);
  });

  it('should validate a post with only content', () => {
    const validUpdate = { content: 'Updated Content' };
    const result = postUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validUpdate);
  });

  it('should validate a post with only published status', () => {
    const validUpdate = { published: true };
    const result = postUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validUpdate);
  });

  it('should fail validation if title is empty when provided', () => {
    const invalidUpdate = { title: '', content: 'Updated Content' };
    const result = postUpdateSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toEqual(['Title is required']);
  });

  it('should fail validation if content is empty when provided', () => {
    const invalidUpdate = { title: 'Updated Title', content: '' };
    const result = postUpdateSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.content).toEqual(['Content is required']);
  });
});
