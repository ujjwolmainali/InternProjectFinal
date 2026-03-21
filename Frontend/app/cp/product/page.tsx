'use client';
import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus, X } from 'lucide-react';
import api from '@/app/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import ReadMore from '@/app/components/ReadMore';
import Breadcrumb from '@/app/components/Breadcrum';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  quantity:number;
  description: string;
  salePrice:number;
  image: string;
}

const categoriesList = ['Electronics', 'Fashion', 'Books', 'Home'];

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    salePrice:'',
    category: 'Electronics',
    quantity:'',
    description: '',
    image: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/products');

        const mapped: Product[] = res.data.map((p: any) => {
          let image = '';

          if (p.images?.length > 0) {
            image = p.images[0].imageUrl;
          } else if (p.colors?.length > 0 && p.colors[0].images?.length > 0) {
            image = p.colors[0].images[0].imageUrl;
          }

          return {
            id: p.Id,
            name: p.Name ?? '',
            price: p.Price ?? 0,
            salePrice: p.SalePrice ?? 0,
            category: p.Category ?? '',
            quantity: p.Quantity ?? 0,
            description: p.Description ?? '',
            image: image.replaceAll('\\', '/'),
          };
        });

        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch products', err);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  

  // Filtered products
 const filtered = products.filter(
  (p) =>
    (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
);


  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  // Handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

 

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Delete failed');
    }
  };


  // Skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: itemsPerPage }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mt-2"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-16"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-20"></div>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-8 dark:bg-gray-900 mt-10">
      <div className="lg:w-6xl mx-auto">
        <div className="flex items-start justify-between mt-10 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Manage your product inventory
            </p>
          </div>

          {/* Right: Breadcrumb */}
          <div>
            <Breadcrumb />
          </div>
        </div>


        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {[5, 10, 15, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
            <Link href="/cp/add-product">
            <button
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Product</span>
            </button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['ID', 'Image', 'Product Name', 'Original Price',"Sales Price",'Quantity' ,'Category', 'Description', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  renderSkeletonRows()
                ) : currentItems.length > 0 ? (
                  currentItems.map((product, idx) => (
                    <tr
                      key={`product-${product.id ?? idx}`}
                      className="hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={`${apiUrl}/${product.image}`}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/100?text=${product.name}`;
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">${product.price}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">${product.salePrice}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">{product.quantity}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <ReadMore html={product.description} maxLength={10} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/cp/edit-product/${product.id}`}>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && (
            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
                </div>

                <div className="flex items-center gap-2">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    &lt;
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(totalPages, currentPage + 2)
                    )
                    .map((pageNum) => (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-\[40px\] px-3 py-2 rounded-lg transition-all shadow-sm ${
                          pageNum === currentPage
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
}