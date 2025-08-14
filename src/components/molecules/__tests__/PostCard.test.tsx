import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../PostCard';
import { Post } from '@/types';

describe('PostCard', () => {
  const mockPost: Post = {
    id: 'post-1',
    title: 'Test Post Title',
    content: 'This is the content of the test post.',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render post details correctly', () => {
    render(<PostCard post={mockPost} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByTestId(`post-card-${mockPost.id}`)).toBeInTheDocument();
    expect(screen.getByTestId('post-card-title')).toHaveTextContent(mockPost.title);
    expect(screen.getByTestId('post-card-content')).toHaveTextContent(mockPost.content ?? '');
    expect(screen.getByText(/status: published/i)).toBeInTheDocument();
  });

  it('should render draft status correctly', () => {
    const draftPost = { ...mockPost, published: false };
    render(<PostCard post={draftPost} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText(/status: draft/i)).toBeInTheDocument();
  });

  it('should call onEdit with post id when Edit button is clicked', () => {
    render(<PostCard post={mockPost} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const editButton = screen.getByTestId('post-card-edit-button');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockPost.id);
  });

  it('should call onDelete with post id when Delete button is clicked', () => {
    render(<PostCard post={mockPost} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const deleteButton = screen.getByTestId('post-card-delete-button');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockPost.id);
  });
});
