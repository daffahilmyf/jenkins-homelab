import { Post, PostsApiResponse } from '@/types';
import { logger } from '@/lib/logger';

const API_BASE_URL = '/api/posts';

interface PostFormData {
  title: string;
  content?: string;
  published?: boolean;
}

// Reusable fetch handler with logging
async function fetchWithLogging<T>(input: RequestInfo, init: RequestInit | undefined, context: string): Promise<T> {
  try {
    const response = await fetch(input, init);

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const responseData = isJson ? await response.json() : {};

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.errors ||
        `HTTP error! status: ${response.status}`;
      const errorToThrow = new Error(
        typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      );

      logger.error(
        {
          url: input,
          status: response.status,
          error: errorToThrow,
          response: responseData,
        },
        `${context} failed`
      );

      throw errorToThrow;
    }

    return responseData;
  } catch (error) {
    logger.error(
      {
        url: input,
        error,
      },
      `${context} network error`
    );
    throw error;
  }
}

// GET /api/posts
export const getPosts = async (skip = 0, take = 10): Promise<PostsApiResponse> => {
  const url = `${API_BASE_URL}?skip=${skip}&take=${take}`;
  return fetchWithLogging<PostsApiResponse>(url, undefined, 'Fetching posts');
};

// POST /api/posts
export const createPost = async (data: PostFormData): Promise<Post> => {
  return fetchWithLogging<Post>(
    API_BASE_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    'Creating post'
  );
};

// PUT /api/posts/:id
export const updatePost = async (id: string, data: PostFormData): Promise<Post> => {
  const url = `${API_BASE_URL}/${id}`;
  return fetchWithLogging<Post>(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    `Updating post (ID: ${id})`
  );
};

// DELETE /api/posts/:id
export const deletePost = async (id: string): Promise<void> => {
  const url = `${API_BASE_URL}/${id}`;
  await fetchWithLogging<void>(
    url,
    {
      method: 'DELETE',
    },
    `Deleting post (ID: ${id})`
  );
};
