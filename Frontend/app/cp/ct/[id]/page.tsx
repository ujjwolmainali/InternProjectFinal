'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Editor from '@/app/components/Editor';
import api from '@/app/lib/axios';
import Breadcrumb from '@/app/components/Breadcrum';

interface CategoryFormProps {
  params: {
    id: string; // 'new' or number as string
  };
}


export default  function page() {
  const router = useRouter();
  const param = useParams()
 const id = param.id;
  const isEditMode = id && id !== 'new';

  const [formData, setFormData] = useState({
    Id:'',
    Name: '',
    Description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setFetching(true);
    setError('');
    
    try {
      const response = await api.get(`/products/categories/all/${id}`);
      
      setFormData(response.data);
    } catch (err:any) {
      setError(err.message || 'Failed to load category');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.Name.trim()) {
      setError('Category name is required');
      return false;
    }
    if (formData.Name.length < 2) {
      setError('Category name must be at least 2 characters');
      return false;
    }
    if (!formData.Description.trim()) {
      setError('Description is required');
      return false;
    }
    return true;
  };

 const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const url = isEditMode
      ? `/products/categories/${id}`
      : `/products/categories`;

    const response = isEditMode
      ? await api.put(url, formData)
      : await api.post(url, formData);

    setSuccess(
      isEditMode
        ? 'Category updated successfully!'
        : 'Category created successfully!'
    );

    // Redirect after success
    setTimeout(() => {
      router.push('/cp/category');
    }, 1500);

  } catch (err: any) {
    setError(
      err?.response?.data?.message ||
      err.message ||
      'An error occurred while saving'
    );
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
     setFormData({
        Id:'',
        Name:'',
        Description:''
      });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading category...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 mt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
       <div className="flex items-start justify-between">
  {/* Left side */}
  <div>
    <h1 className="text-3xl font-bold text-slate-900">
      {isEditMode ? 'Edit Category' : 'Add New Category'}
    </h1>

    <p className="text-slate-600 mt-2">
      {isEditMode
        ? 'Update the category information below'
        : 'Fill in the details to create a new category'}
    </p>
  </div>

  {/* Right side */}
  <div className="mt-1">
    <Breadcrumb />
  </div>
        </div>


       {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-2">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label 
                htmlFor="Name" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Category Name *
              </label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Enter category name"
                disabled={loading}
              />
            </div>

            {/* Description Field */}
            <div>
              <label 
                htmlFor="Description" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Description *
              </label>
              
              <Editor data={formData.Description} onChange={(v) => setFormData((prev) => ({ ...prev, Description: v }))}/>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Save className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1E2939] text-white rounded-lg disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditMode ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        {isEditMode && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Category ID:</strong> {id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}