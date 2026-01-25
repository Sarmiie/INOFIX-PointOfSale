import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Table from "../components/ui/Table";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ConfirmDelete from "../components/common/ConfirmDelete";
import api from "../services/api";
import toast from "react-hot-toast";
import { useProductList } from "../hooks/useProductList";

export default function Products() {
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("")
  const {
    products,
    loading,
    search,
    pagination,
    handleSearch,
    handlePageChange,
    refreshData,
    fetchProducts
 } = useProductList();

 useEffect(() => {
    if (location.state?.message && location.state?.success) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCreate = () => {
    navigate("/products/create");
  };

  const handleEdit = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProductToDelete(null);
      toast.success('Produk berhasil dihapus')
      refreshData();
    } catch (err) {
      toast.error("Gagal menghapus produk")
    }
  };

  const columns = [
    {
      header: "Gambar",
      accessor: "image_url",
      width: "80px",
      render: (row) => {
        const imageUrl = row.image_url;

        return imageUrl ? (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={row.name}
              className="w-10 h-10 object-cover rounded border border-gray-200 shadow-sm"
              onError={(e) => {
                console.warn("❌ Image failed to load:", imageUrl);
                e.target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No img</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Nama",
      accessor: "name",
      render: (row) => <div className="font-medium text-gray-900">{row.name}</div>,
    },
    {
      header: "Kode",
      accessor: "code",
      render: (row) => <span className="text-gray-600 text-sm">{row.code}</span>,
    },
    {
      header: "Harga",
      accessor: "price",
      render: (row) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(row.price),
    },
    {
      header: "Stok",
      accessor: "stock",
      render: (row) => (
        <Badge
          variant={
            row.stock > 10 ? "success" : row.stock > 0 ? "warning" : "danger"
          }
        >
          {row.stock}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      accessor: "actions",
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: <span className="font-semibold">{pagination.total}</span> produk
          </p>
        </div>
        <Button onClick={handleCreate} icon={<PlusIcon className="h-5 w-5" />}>
          Tambah Produk
        </Button>
      </div>

      {/* Pencarian */}
      <div className="mb-6 max-w-md">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Cari nama atau kode produk..."
        />
      </div>

      {/* Tabel */}
      <Table
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="Belum ada produk. Tambahkan produk pertama Anda!"
      />

      {pagination.total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info Pagination */}
          <div className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{pagination.from}</span> hingga{" "}
            <span className="font-semibold">{pagination.to}</span> dari{" "}
            <span className="font-semibold">{pagination.total}</span> produk
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition ${
                pagination.current_page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                const isCurrentPage = page === pagination.current_page;
                const isNearCurrent = Math.abs(page - pagination.current_page) <= 1;

                if (pagination.last_page <= 5) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition ${
                        isCurrentPage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === 1 || page === pagination.last_page || isNearCurrent) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition ${
                        isCurrentPage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === 2 && pagination.current_page > 3) ||
                  (page === pagination.last_page - 1 &&
                    pagination.current_page < pagination.last_page - 2)
                ) {
                  return (
                    <span key={page} className="text-gray-500 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_more}
              className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition ${
                !pagination.has_more
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {productToDelete && (
        <ConfirmDelete
          isOpen={true}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Produk"
          message={`Anda yakin ingin menghapus "${productToDelete.name}"?`}
        />
      )}
    </div>
  );
}