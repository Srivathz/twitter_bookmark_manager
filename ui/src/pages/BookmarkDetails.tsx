import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BookmarkDetailModal from '../components/BookmarkDetailModal';
import { fetchBookmarks, updateBookmark } from '../api';

const BookmarkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch bookmarks and find the one with the given id
  const { data: bookmarks = [], isLoading, error } = useQuery({ queryKey: ['bookmarks'], queryFn: fetchBookmarks });
  const bookmark = bookmarks.find((bm: any) => bm.id === id);

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: ({ read }: { read: boolean }) => updateBookmark(id!, { is_read: read }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  // Edit categories mutation (placeholder)
  const editCategories = () => {
    // Implement category editing logic
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading bookmark.</div>;
  if (!bookmark) return <div>Bookmark not found.</div>;

  return (
    <BookmarkDetailModal
      bookmark={bookmark}
      open={true}
      onClose={() => navigate(-1)}
      onMarkRead={read => markReadMutation.mutate({ read })}
      onEditCategories={editCategories}
    />
  );
};

export default BookmarkDetails;
