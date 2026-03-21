"use client"
import { useEffect, useState } from 'react';
import { Edit2, Trash2, Search, Plus } from 'lucide-react';
import Breadcrumb from '@/app/components/Breadcrum';
import api from '@/app/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  Id: number;
  Name: string;
  Description: string;
}


export default function Page() {
  const router  = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Filter categories based on search
  const filtered = categories.filter(
    (c) =>
      c.Name.toLowerCase().includes(search.toLowerCase()) ||
      c.Description.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

 

 useEffect(() => {
  const fetchCategory = async () => {
    try {
      const res = await api.get("/products/categories/all");
      setCategories(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  fetchCategory();
}, []);



const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this category?")) return;

  try {
    await api.delete(`/products/categories/${id}`);

    // Update UI after successful delete
    setCategories((prev) => prev.filter((c) => c.Id !== id));

  } catch (err: any) {
    alert(
      err?.response?.data?.message ||
      "Failed to delete category"
    );
  }
};


  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-8 mt-10 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mt-10 max-w-7xl mx-auto">
                  <div className="flex flex-col">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                      Categories
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-3">
                      Manage your Categories inventory
                    </p>
                  </div>
        
                  {/* Right: Breadcrumb */}
                  <div>
                    <Breadcrumb />
                  </div>
                </div>

        {/* Search Bar and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-5">
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
            <Link href="/cp/ct/new">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Category</span>
            </button>
            </Link>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((category) => (
                    <tr
                      key={category.Id}
                      className="hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                          {category.Id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.Name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-600 dark:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: category.Description }}
                        />

                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/cp/ct/${category.Id}`}>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(category.Id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Search className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-lg font-medium">No categories found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of{' '}
                {filtered.length} entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return pageNum;
                }).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg transition-all shadow-sm ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}