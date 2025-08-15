import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import Button from '@/components/atoms/Button';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete }) => {
  return (
    <motion.div
      data-testid={`post-card-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} // For potential exit animations if items are removed
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md hover:-translate-y-1 p-6 mb-4 flex flex-col justify-between"
    >
      <h3 data-testid="post-card-title" className="text-xl font-medium text-gray-700 mb-2">
        {post.title}
      </h3>
      <p data-testid="post-card-content" className="text-gray-600 text-base mb-3 flex-grow">
        {post.content}
      </p>
      <p className="text-xs text-gray-500 mb-4" data-testid="post-card-published-status">
        Status: {post.published ? 'Published' : 'Draft'}
      </p>
      <div className="flex space-x-4">
        <Button
          data-testid="post-card-edit-button"
          onClick={() => onEdit(post.id)}
          variant="secondary"
        >
          Edit
        </Button>
        <Button
          data-testid="post-card-delete-button"
          onClick={() => onDelete(post.id)}
          variant="danger"
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

export default PostCard;
