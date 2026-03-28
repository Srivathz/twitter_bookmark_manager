import React, { useState } from 'react';
import Input from './ui/Input';

interface AddCategoryFormProps {
  onAdd: (name: string) => Promise<void>;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    setLoading(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="New category..."
        error={error || undefined}
        disabled={loading}
      />
      <button type="submit" className="mt-2 px-4 py-2 bg-twitter text-white rounded" disabled={loading}>
        {loading ? 'Adding...' : 'Add Category'}
      </button>
    </form>
  );
};

export default AddCategoryForm;
