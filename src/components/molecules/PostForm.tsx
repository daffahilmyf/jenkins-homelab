import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Import motion
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { Post } from '@/types';

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: { title: string; content?: string; published?: boolean }) => void;
  isSubmitting: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [published, setPublished] = useState(initialData?.published || false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setPublished(initialData.published || false);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, published });
  };

  return (
    <motion.form
      data-testid="post-form"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} // Removed y translation
      transition={{ duration: 0.4 }} // Increased duration
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-8 mb-8"
    >
      <Input
        id="title"
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        id="content"
        label="Content"
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="mb-6 flex items-center">
        <input
          id="published"
          data-testid="post-form-published-checkbox"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded-sm border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
          Published
        </label>
      </div>
      <div className="flex justify-end">
        <Button data-testid="post-form-submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </motion.form>
  );
};

export default PostForm;
