import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostList from '../PostList';
import { createPost, updatePost, deletePost } from '@/lib/api';
import useSWRInfinite from 'swr/infinite';
import toast from 'react-hot-toast';

// Mock modules
jest.mock('swr/infinite');
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));
jest.mock('@/lib/api', () => ({
    getPosts: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
}));

const mockPosts = [
    { id: '1', title: 'First Post', content: 'Hello', published: true, createdAt: '', updatedAt: '' },
    {
        id: '2',
        title: 'Second Post',
        content: 'World',
        published: true,
        createdAt: '',
        updatedAt: '',
    },
];

beforeAll(() => {
    window.scrollTo = jest.fn();
});

describe('PostList component', () => {
    const defaultSWR = {
        data: [{ posts: mockPosts, totalPosts: 2 }],
        error: null,
        isLoading: false,
        mutate: jest.fn(),
        setSize: jest.fn(),
    };

    beforeEach(() => {
        (useSWRInfinite as jest.Mock).mockReturnValue(defaultSWR);
        jest.clearAllMocks();
    });

    it('renders heading and posts', () => {
        render(<PostList />);
        expect(screen.getByTestId('post-list-heading')).toHaveTextContent('Zen Blog Posts');
        expect(screen.getByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Second Post')).toBeInTheDocument();
    });

    it('shows loading message when isLoading is true', () => {
        (useSWRInfinite as jest.Mock).mockReturnValue({ ...defaultSWR, data: null, isLoading: true });
        render(<PostList />);
        expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    it('shows post form when Create New Post is clicked', () => {
        render(<PostList />);
        fireEvent.click(screen.getByTestId('create-post-button'));
        expect(screen.getByTestId('post-form')).toBeInTheDocument();
    });

    it('handles post creation', async () => {
        (createPost as jest.Mock).mockResolvedValue({
            id: 'new-post',
            title: 'New Post',
            content: 'Some content here',
            published: true,
            createdAt: '',
            updatedAt: '',
        });

        render(<PostList />);
        fireEvent.click(screen.getByTestId('create-post-button'));

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Post' } });
        fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Some content here' } });

        fireEvent.click(screen.getByTestId('post-form-submit-button'));

        await waitFor(() => {
            expect(createPost).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Post created successfully!');
        });
    });

    it('shows error toast on post creation failure', async () => {
        (createPost as jest.Mock).mockRejectedValue(new Error('Create failed'));

        render(<PostList />);
        fireEvent.click(screen.getByTestId('create-post-button'));

        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Fail Post' } });
        fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Some content here' } });

        fireEvent.click(screen.getByTestId('post-form-submit-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Create failed'));
        });
    });

    it('handles post update', async () => {
        (updatePost as jest.Mock).mockResolvedValue({
            id: '1',
            title: 'Updated Post',
            content: 'Updated Content',
            published: true,
            createdAt: '',
            updatedAt: '',
        });

        render(<PostList />);
        fireEvent.click(screen.getAllByTestId('post-card-edit-button')[0]);
        fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Post' } });
        fireEvent.click(screen.getByTestId('post-form-submit-button'));

        await waitFor(() => {
            expect(updatePost).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Post updated successfully!');
        });
    });

    it('handles delete flow with confirmation', async () => {
        (deletePost as jest.Mock).mockResolvedValue(undefined);

        render(<PostList />);
        fireEvent.click(screen.getAllByTestId('post-card-delete-button')[0]);
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirmation-dialog-confirm-button'));

        await waitFor(() => {
            expect(deletePost).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Post deleted successfully!');
        });
    });

    it('shows error toast when delete fails', async () => {
        (deletePost as jest.Mock).mockRejectedValue(new Error('Delete failed'));

        render(<PostList />);
        fireEvent.click(screen.getAllByTestId('post-card-delete-button')[0]);
        fireEvent.click(screen.getByTestId('confirmation-dialog-confirm-button'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Delete failed'));
        });
    });

    it('closes confirmation dialog on cancel', async () => {
        render(<PostList />);
        fireEvent.click(screen.getAllByTestId('post-card-delete-button')[0]);
        expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirmation-dialog-cancel-button'));

        await waitFor(() => {
            expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
        });
    });

    it('shows message when there are no posts', () => {
        (useSWRInfinite as jest.Mock).mockReturnValue({
            ...defaultSWR,
            data: [{ posts: [], totalPosts: 0 }],
        });

        render(<PostList />);
        expect(screen.getByTestId('no-posts-message')).toBeInTheDocument();
    });

    it('calls setSize when IntersectionObserver triggers', () => {
        const setSizeMock = jest.fn();

        (useSWRInfinite as jest.Mock).mockReturnValue({
            ...defaultSWR,
            setSize: setSizeMock,
            data: [{ posts: mockPosts, totalPosts: 10 }],
        });

        const observe = jest.fn();
        const unobserve = jest.fn();

        (window as any).IntersectionObserver = jest.fn((cb) => {
            cb([{ isIntersecting: true }]);
            return { observe, unobserve };
        });

        render(<PostList />);
        expect(setSizeMock).toHaveBeenCalled();
    });

    it('shows toast on load error from SWR', () => {
        const swrError = new Error('Load error');
        (useSWRInfinite as jest.Mock).mockReturnValue({
            ...defaultSWR,
            data: null,
            error: swrError,
        });

        render(<PostList />);
        expect(toast.error).toHaveBeenCalledWith('Failed to load posts: Load error');
    });
});
