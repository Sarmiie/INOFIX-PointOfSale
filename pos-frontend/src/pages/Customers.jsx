import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Table from "../components/ui/Table";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/ui/Button";
import ConfirmDelete from "../components/common/ConfirmDelete";
import api from "../services/api";
import toast from "react-hot-toast";
import { useCustomerList } from "../hooks/useCustomerList";

export default function Customers() {
  const navigate = useNavigate();
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const {
    customers,
    loading,
    search,
    pagination,
    handleSearch,
    handlePageChange,
    refreshData,
    fetchCustomers,
    formatDate
  } = useCustomerList();

  useEffect(() => {
    if (location.state?.message && location.state?.success) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const handleCreate = () => {
    navigate("/customers/create");
  };

  const handleEdit = (customer) => {
    navigate(`/customers/edit/${customer.id}`);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      setCustomerToDelete(null)
      toast.success("Pelanggan berhasil dihapus")
      refreshData();
    } catch (err) {
      toast.error("Gagal menghapus pelanggan")
    }
  };

  const columns = [
    {
      header: "Nama",
      accessor: "name",
      render: (row) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
          {row.email || '-'}
        </div>
      ),
    },
    {
      header: "Telepon",
      accessor: "phone",
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          {row.phone}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      accessor: "created_at",
      render: (row) => (
        <div className="flex items-center text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          {formatDate(row.created_at)}
        </div>
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
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pelanggan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {pagination.total} pelanggan
          </p>
        </div>
        <Button onClick={handleCreate} icon={<PlusIcon className="h-5 w-5" />}>
          Tambah Pelanggan
        </Button>
      </div>

      {/* Pencarian */}
      <div className="mb-6 max-w-md">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Cari nama, email, atau telepon..."
        />
      </div>

      {/* Tabel */}
      <Table
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="Belum ada pelanggan. Tambahkan pelanggan pertama Anda!"
      />

      {/* ✅ Pagination Controls */}
      {pagination.total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info Pagination */}
          <div className="text-sm text-gray-600">
            Menampilkan {pagination.from} hingga {pagination.to} dari {pagination.total} pelanggan
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg transition ${
                pagination.current_page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === 2 && pagination.current_page > 3) ||
                  (page === pagination.last_page - 1 && pagination.current_page < pagination.last_page - 2)
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {customerToDelete && (
        <ConfirmDelete
          isOpen={true}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Pelanggan"
          message={`Anda yakin ingin menghapus "${customerToDelete.name}"?`}
        />
      )}
    </div>
  );
}