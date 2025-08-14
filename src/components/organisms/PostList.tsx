"use client";

import toast from 'react-hot-toast';
import React, { useState, useRef, useEffect } from 'react';
import PostCard from '@/components/molecules/PostCard';
import PostForm from '@/components/molecules/PostForm';
import Button from '@/components/atoms/Button';

import useSWRInfinite from 'swr/infinite'; // Import useSWRInfinite

import { Post, PostsApiResponse } from '@/types';
import { getPosts, createPost, updatePost, deletePost } from '@/lib/api'; // Import API functions

import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence
import ConfirmationDialog from '@/components/molecules/ConfirmationDialog'; // Import ConfirmationDialog

const PostList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Keep local error for form submissions

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // State for confirmation dialog
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null); // State to store ID of post to delete

  const postsPerPage = 5; // Display 5 posts per load

  const getKey = (pageIndex: number, previousPageData: PostsApiResponse | null) => {
    if (previousPageData && !previousPageData.posts.length) return null; // Reached the end
    return `/api/posts?skip=${pageIndex * postsPerPage}&take=${postsPerPage}`; // SWR key
  };

  const fetcher = async (url: string): Promise<PostsApiResponse> => {
    const urlObj = new URL(`http://localhost:3000${url}`); // Dummy base URL for URLSearchParams
    const skip = parseInt(urlObj.searchParams.get('skip') || '0');
    const take = parseInt(urlObj.searchParams.get('take') || '10');
    return getPosts(skip, take);
  };

  const { data, error: swrError, isLoading, mutate, setSize } = useSWRInfinite<PostsApiResponse>(
    getKey,
    fetcher
  );

  const posts: Post[] = data ? data.flatMap((page) => page.posts) : [];
  const totalPostsCount = data && data[0] ? data[0].totalPosts : 0;
  const hasMore = posts.length < totalPostsCount;

  const handleCreateOrUpdatePost = async (formData: { title: string; content?: string; published?: boolean }) => {
    setIsSubmitting(true);
    setError(null); // Clear previous errors
    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData); // Use updatePost from api.ts
        toast.success('Post updated successfully!');
      } else {
        const newPost = await createPost(formData); // Use createPost from api.ts
        toast.success('Post created successfully!');
        mutate((currentData) => {
          if (!currentData) return undefined; // No data yet
          const firstPage = currentData[0];
          // Add the new post to the beginning of the first page
          const updatedFirstPage = {
            ...firstPage,
            posts: [newPost, ...firstPage.posts],
            totalPosts: firstPage.totalPosts + 1, // Increment total count
          };
          return [updatedFirstPage, ...currentData.slice(1)];
        }, { revalidate: false }); // Don't revalidate immediately, we've updated the cache
      }
      setShowForm(false);
      setEditingPost(undefined);
      // No need to reset currentPage here, SWRInfinite handles it
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    const postToEdit = posts.find((p) => p.id === id);
    if (postToEdit) {
      setEditingPost(postToEdit);
      setShowForm(true);
    }
  };

  // Function to open the confirmation dialog
  const handleDelete = (id: string) => {
    setPostToDeleteId(id);
    setIsConfirmDialogOpen(true);
  };

  // Function to confirm and proceed with deletion
  const handleConfirmDelete = async () => {
    if (postToDeleteId) {
      setError(null); // Clear previous errors
      try {
        await deletePost(postToDeleteId); // Use deletePost from api.ts
        mutate(); // Revalidate SWR cache
        toast.success('Post deleted successfully!');
      } catch (err: unknown) {
        setError(`Failed to delete post: ${err instanceof Error ? err.message : 'An unknown error occurred'}`); // Provide more informative error to user
        
      } finally {
        setIsConfirmDialogOpen(false);
        setPostToDeleteId(null);
      }
    }
  };

  // Function to cancel deletion
  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setPostToDeleteId(null);
  };

  const observerTarget = useRef(null);

  useEffect(() => {
    const currentObserverTarget = observerTarget.current; // Capture current value

    if (!currentObserverTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setSize((prevSize) => prevSize + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) { // Use captured value in cleanup
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [hasMore, isLoading, setSize]);

  // Effect to prevent body scrolling when dialog is open
  useEffect(() => {
    if (isConfirmDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts or dialog closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isConfirmDialogOpen]);

  useEffect(() => {
    if (swrError) {
      toast.error(`Failed to load posts: ${swrError.message}`);
    }
  }, [swrError]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  return (
    <div data-testid="post-list-container" className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm my-10">
      <h1 data-testid="post-list-heading" className="text-4xl font-light text-center text-gray-700 mb-12 tracking-wide">Zen Blog Posts</h1>

      <div className="mb-8 flex justify-between items-center">
        <Button data-testid="create-post-button" onClick={() => { setShowForm(!showForm); setEditingPost(undefined); }}>
          {showForm ? 'Cancel' : 'Create New Post'}
        </Button>
        {isLoading && <p data-testid="loading-message" className="text-gray-600">Loading...</p>}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            layout // Enables smooth layout transitions
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <PostForm
              initialData={editingPost}
              onSubmit={handleCreateOrUpdatePost}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {posts.length === 0 && !isLoading ? (
            <p data-testid="no-posts-message" className="col-span-full text-center text-gray-500">No posts yet. Create one!</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {hasMore && !isLoading && ( // Only show observer target if there's more to load
        <div ref={observerTarget} className="flex justify-center mt-8">
          {/* Optional: Add a loading spinner here */}
          {isLoading && <p data-testid="loading-more-posts-message" className="text-gray-600">Loading more posts...</p>}
        </div>
      )}

      <AnimatePresence>
        {isConfirmDialogOpen && (
          <ConfirmationDialog
            isOpen={isConfirmDialogOpen}
            title="Confirm Deletion"
            message="Are you sure you want to delete this post? This action cannot be undone."
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostList;
