import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import SearchBar from "../components/common/SearchBar";
import Table from "../components/ui/Table";
import api from "../services/api";

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State pagination sama seperti Customers
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    has_more: false,
  });

  const debounceTimer = useRef(null);
  const lastSearchQuery = useRef("");
  const cacheRef = useRef({});

  // Fetch transactions sama seperti Customers
  const fetchTransactions = useCallback(async (query = "", page = 1) => {
    const cacheKey = `${query}_page_${page}`;

    if (cacheRef.current[cacheKey]) {
      setTransactions(cacheRef.current[cacheKey].transactions);
      setPagination(cacheRef.current[cacheKey].pagination);
      setLoading(false);
      return;
    }

    setLoading(true);
    lastSearchQuery.current = query;

    try {
      const params = {
        page: page,
        per_page: 10,
      };

      if (query) {
        params.search = query;
      }

      const response = await api.get("/transactions", { params });

      if (!response.data || !Array.isArray(response.data.data)) {
        setTransactions([]);
        setPagination({
          total: 0,
          per_page: 10,
          current_page: 1,
          last_page: 1,
          from: 0,
          to: 0,
          has_more: false,
        });
        return;
      }

      cacheRef.current[cacheKey] = {
        transactions: response.data.data,
        pagination: response.data.meta || response.data.pagination,
      };

      setTransactions(response.data.data);
      setPagination(response.data.meta || response.data.pagination);
    } catch (err) {
      console.error("Error saat fetch transactions:", err);

      if (err.response?.status === 401) {
        console.warn("Token tidak valid, redirect ke login...");
        localStorage.removeItem("auth_token");
        navigate("/login", { replace: true });
      }

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTransactions("", 1);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchTransactions]);

  // Handle search sama 
  const handleSearch = useCallback(
    (value) => {
      setSearch(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetchTransactions(value, 1);
      }, 500);
    },
    [fetchTransactions],
  );

  // Handle page change sama 
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchTransactions(search, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define columns
  const columns = [
    {
      header: "No. Transaksi",
      accessor: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-900">#{row.id}</span>
        </div>
      ),
    },
    {
      header: "Pelanggan",
      accessor: "customer.name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900">{row.customer?.name || "-"}</span>
        </div>
      ),
    },
    {
      header: "Tanggal",
      accessor: "created_at",
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="h-4 w-4" />
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
              navigate(`/transactions/${row.id}`);
            }}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Daftar Transaksi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {pagination.total} transaksi
          </p>
        </div>
        <Button onClick={() => navigate("/pos")}>+ Transaksi Baru</Button>
      </div>

      {/* Pencarian */}
      <div className="mb-6 max-w-md">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Cari nomor transaksi atau nama pelanggan..."
        />
      </div>

      {/* Tabel */}
      <Table
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="Belum ada transaksi. Mulai dengan membuat transaksi baru!"
      />

      {pagination.total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info Pagination */}
          <div className="text-sm text-gray-600">
            Menampilkan {pagination.from} hingga {pagination.to} dari{" "}
            {pagination.total} transaksi
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
              {Array.from(
                { length: pagination.last_page },
                (_, i) => i + 1,
              ).map((page) => {
                const isCurrentPage = page === pagination.current_page;
                const isNearCurrent =
                  Math.abs(page - pagination.current_page) <= 1;

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
                } else if (
                  page === 1 ||
                  page === pagination.last_page ||
                  isNearCurrent
                ) {
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
    </div>
  );
}
