'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, X, Tag } from 'lucide-react';
import Editor from '@/app/components/Editor';
import api from '@/app/lib/axios';
import { toast } from 'react-toastify';
import Breadcrumb from '@/app/components/Breadcrum';

interface ProductFormData {
  productName: string;
  category: string;
  quantity: string;
  price: string;
  salePrice: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  description: string;
  status: 'draft' | 'active' | 'out_of_stock';
  isFeatured: boolean;
  colors: Array<{ color: string; images: File[]; imagePreviews: string[] }>;
  images: File[];
  imagePreviews: string[];
}

export default function EditProduct() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const { id } = useParams(); // Product ID from URL
  const router = useRouter();

  const getPreviewUrl = (preview: string) => {
  if (!preview) return ''; // fallback
  return preview.startsWith('blob:') ? preview : `${apiUrl}/${preview}`;
};


  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    category: 'Electronics',
    quantity: '',
    price: '',
    salePrice: '',
    discountType: 'percentage',
    discountValue: '',
    description: '',
    status: 'draft',
    isFeatured: false,
    colors: [],
    images: [],
    imagePreviews: []
  });

  const [colorInput, setColorInput] = useState('#000000');
  const [tagInput, setTagInput] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Fetch product data
  useEffect(() => {
  if (!id) return;

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data;

      // Map colors to include File[] empty and imagePreviews as URLs
      const colors = data.colors.map((c: any) => ({
        color: c.color,
        images: [] as File[], // For newly uploaded images
        imagePreviews: c.images?.map((img: any) => img.imageUrl) || [] // Existing color images from server
      }));

      setFormData({
        productName: data.Name || '',   // Updated to match Prisma response
        category: data.Category || 'Electronics',
        quantity: String(data.Quantity || ''),
        price: String(data.Price || ''),
        salePrice: String(data.SalePrice || ''),
        discountType: data.discountType || 'percentage', // Optional, if you use it
        discountValue: String(data.discountValue || ''), // Optional, if you use it
        description: data.Description || '',
        status: data.Status || 'draft',
        isFeatured: data.IsFeatured || false,
        colors,
        images: [] as File[], // For newly uploaded general images
        imagePreviews: data.images?.map((img: any) => img.imageUrl) || [] // General product images
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fetch product');
    }
  };

  fetchProduct();
}, [id]);


  // --- Same input handlers as Add Product ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && formData.colors.length > 0) {
      const updatedColors = [...formData.colors];
      const currentColor = updatedColors[selectedColorIndex];
      const newImages = [...currentColor.images, ...files].slice(0, 5);
      const newPreviews = [...currentColor.imagePreviews, ...files.map(f => URL.createObjectURL(f))].slice(0, 5);

      updatedColors[selectedColorIndex] = {
        ...currentColor,
        images: newImages,
        imagePreviews: newPreviews
      };

      setFormData(prev => ({ ...prev, colors: updatedColors }));
    } else if (files.length > 0) {
      const newImages = [...formData.images, ...files].slice(0, 5);
      const newPreviews = [...formData.imagePreviews, ...files.map(f => URL.createObjectURL(f))].slice(0, 5);
      setFormData(prev => ({ ...prev, images: newImages, imagePreviews: newPreviews }));
    }
  };

  const removeImage = (index: number) => {
    if (formData.colors.length > 0) {
      const updatedColors = [...formData.colors];
      const currentColor = updatedColors[selectedColorIndex];
      updatedColors[selectedColorIndex] = {
        ...currentColor,
        images: currentColor.images.filter((_, i) => i !== index),
        imagePreviews: currentColor.imagePreviews.filter((_, i) => i !== index)
      };
      setFormData(prev => ({ ...prev, colors: updatedColors }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
      }));
    }
  };

  const addColor = () => {
    if (colorInput && !formData.colors.some(c => c.color === colorInput)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, { color: colorInput, images: [], imagePreviews: [] }] }));
      setColorInput('#000000');
      setSelectedColorIndex(formData.colors.length);
    }
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
    if (selectedColorIndex >= formData.colors.length - 1) {
      setSelectedColorIndex(Math.max(0, formData.colors.length - 2));
    }
  };



  const handleUpdateProduct = async () => {
    try {
      const formDataToSend = new FormData();

      // Basic fields
      formDataToSend.append("Name", formData.productName);
      formDataToSend.append("Category", formData.category);
      formDataToSend.append("Price", formData.price);
      formDataToSend.append("SalePrice", formData.salePrice);
      formDataToSend.append("Quantity", formData.quantity);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("Status", formData.status);
      formDataToSend.append("IsFeatured", String(formData.isFeatured));

      // Colors metadata
      const colorMeta = formData.colors.map(c => ({
        color: c.color,
        imageCount: c.images.length,
      }));
      formDataToSend.append("Colors", JSON.stringify(colorMeta));

     // Color images
        formData.colors.forEach(color => {
          color.images.forEach(img => {
            formDataToSend.append(`colorImages[${color.color}]`, img);
          });
        });

        // Product images
        formData.images.forEach(img =>
          formDataToSend.append("productImages", img)
        );



      const res = await api.put(`/products/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      toast.success(res.data.message || "Product updated successfully");
      router.push('/cp/product'); // Redirect to products list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleClear = () => {
    setFormData({
      productName: '',
      category: 'Electronics',
      quantity: '',
      price: '',
      salePrice: '',
      discountType: 'percentage',
      discountValue: '',
      description: '',
      status: 'draft',
      isFeatured: false,
      colors: [],
      images: [],
      imagePreviews: []
    });
  };

  const calculateDiscount = () => {
    if (formData.price && formData.salePrice) {
      const discount = ((parseFloat(formData.price) - parseFloat(formData.salePrice)) / parseFloat(formData.price) * 100);
      return discount > 0 ? discount.toFixed(0) : null;
    }
    return null;
  };

  const calculateSalePriceFromDiscount = () => {
    if (formData.price && formData.discountValue) {
      const price = parseFloat(formData.price);
      const discountVal = parseFloat(formData.discountValue);

      if (formData.discountType === 'percentage') {
        return (price - (price * discountVal / 100)).toFixed(2);
      } else {
        return (price - discountVal).toFixed(2);
      }
    }
    return '';
  };

  const applyDiscount = () => {
    const calculatedPrice = calculateSalePriceFromDiscount();
    if (calculatedPrice && parseFloat(calculatedPrice) >= 0) {
      setFormData(prev => ({ ...prev, salePrice: calculatedPrice }));
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit New Product</h1>
          </div>
          <h1><Breadcrumb/></h1>
        </div>

        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter product details</p>

              <div className="space-y-4">
                {/* Name & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      placeholder="Product name"
                      className="w-full px-3 py-2 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Food</option>
                      <option>Books</option>
                      <option>Home & Garden</option>
                    </select>
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Featured Product</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Product Description
                  </label>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Editor
                    data={formData.description}
                    onChange={(v) => setFormData((prev) => ({ ...prev, description: v }))}
                    />
                    </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Inventory</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Regular Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {calculateDiscount() && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {calculateDiscount()}% off
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* Discount Calculator */}
                <div className="bg-blue-50 dark:bg-gray-700/50 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Discount Calculator</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Type
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Value
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        placeholder={formData.discountType === 'percentage' ? '0' : '0.00'}
                        className="w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={applyDiscount}
                        type="button"
                        disabled={!formData.price || !formData.discountValue}
                        className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                      >
                        Apply Discount
                      </button>
                    </div>
                  </div>
                  {formData.price && formData.discountValue && (
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-gray-600">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Calculated Sale Price: <span className="font-bold text-blue-600 dark:text-blue-400">${calculateSalePriceFromDiscount()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Variants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Variants</h2>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addColor}
                    type="button"
                    className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                
                {formData.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                {formData.colors.map((colorObj, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg"
                    >
                      <div
                        className="w-5 h-5 rounded border border-gray-300 dark:border-gray-500"
                        style={{ backgroundColor: colorObj.color }}  
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{colorObj.color}</span> 
                      <button
                        onClick={() => removeColor(index)}
                        type="button"
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  </div>
                )}
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Images (Max 5)</h2>
                {formData.colors.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading for:</span>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: formData.colors[selectedColorIndex]?.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.colors[selectedColorIndex]?.color}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={
                      formData.colors.length > 0 
                        ? formData.colors[selectedColorIndex]?.images.length >= 5
                        : formData.images.length >= 5
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors ${
                    (formData.colors.length > 0 
                      ? formData.colors[selectedColorIndex]?.images.length >= 5
                      : formData.images.length >= 5)
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}>
                    <Plus className={`w-8 h-8 mb-2 ${
                      (formData.colors.length > 0 
                        ? formData.colors[selectedColorIndex]?.images.length >= 5
                        : formData.images.length >= 5)
                        ? 'text-gray-300' 
                        : 'text-gray-400'
                    }`} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(formData.colors.length > 0 
                        ? formData.colors[selectedColorIndex]?.images.length >= 5
                        : formData.images.length >= 5)
                        ? 'Maximum images reached' 
                        : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formData.colors.length > 0 
                        ? `${formData.colors[selectedColorIndex]?.images.length || 0}/5 images`
                        : `${formData.images.length}/5 images`}
                    </p>
                  </div>
                </div>

                {((formData.colors.length > 0 && formData.colors[selectedColorIndex]?.imagePreviews.length > 0) || 
                  (formData.colors.length === 0 && formData.imagePreviews.length > 0)) && (
                  <div className="grid grid-cols-5 gap-3">
                    {(formData.colors.length > 0 
                      ? formData.colors[selectedColorIndex]?.imagePreviews 
                      : formData.imagePreviews
                    ).map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                      src={preview.startsWith('blob:')
                        ? preview
                        : `${apiUrl}/${preview}`}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />

                        <button
                          onClick={() => removeImage(index)}
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                type="button"
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear
              </button>
              <button
                onClick={handleUpdateProduct}
                type="button"
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500"
              >
                Edit Product
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Preview</h2>
              <div className="space-y-3">
                {/* Image Gallery Preview */}
              <div className="space-y-2">
                { (formData.colors.length > 0 && formData.colors[selectedColorIndex]?.imagePreviews.length > 0) ||
                  (formData.colors.length === 0 && formData.imagePreviews.length > 0) ? (
                  <>
                    {/* Main Preview */}
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl aspect-square overflow-hidden">
                     <img
                      src={getPreviewUrl(
                        formData.colors.length > 0
                          ? formData.colors[selectedColorIndex].imagePreviews[0]
                          : formData.imagePreviews[0]
                      )}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />

                    </div>

                    {/* Additional Previews */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {(
                        formData.colors.length > 0
                          ? formData.colors[selectedColorIndex].imagePreviews.slice(1, 5)
                          : formData.imagePreviews.slice(1, 5)
                      ).map((preview, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square overflow-hidden">
                          <img
                            src={preview}
                            alt={`Preview ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl aspect-square flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
                  </div>
                )}
              </div>


                {/* Product Info */}
                {formData.productName && (
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{formData.productName}</h3>
                      {formData.isFeatured && (
                        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formData.category}</p>
                  </div>
                )}

                {/* Status Badge */}
                {formData.status && (
                  <div>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                      formData.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                        : formData.status === 'draft'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                    }`}>
                      {formData.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  {formData.salePrice ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${formData.salePrice}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-through">${formData.price}</p>
                      {calculateDiscount() && (
                        <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs px-2 py-0.5 rounded">
                          -{calculateDiscount()}%
                        </span>
                      )}
                    </>
                  ) : formData.price ? (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${formData.price}</p>
                  ) : null}
                </div>

                {/* Colors */}
                {formData.colors.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Available Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((colorObj, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedColorIndex(index)}
                          className={`relative cursor-pointer transition-all ${
                            selectedColorIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500"
                            style={{ backgroundColor: colorObj.color }}
                            title={colorObj.color}
                          />
                          {colorObj.images.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                              {colorObj.images.length}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display images for selected color in preview */}
                {formData.colors.length > 0 && formData.colors[selectedColorIndex]?.imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Images for {formData.colors[selectedColorIndex]?.color}:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.colors[selectedColorIndex]?.imagePreviews.slice(0, 3).map((preview, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square overflow-hidden">
                        <img
                          src={getPreviewUrl(preview)}
                          alt={`Color preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}

                    </div>
                  </div>
                )}

                {/* Description */}
                {formData.description && (
                  <div className="ck-content p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                  <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>
                )}

                {/* Stock */}
                {formData.quantity && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available: <span className="font-medium">{formData.quantity}</span> units
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
