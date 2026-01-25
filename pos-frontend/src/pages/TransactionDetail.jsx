import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  PrinterIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../services/api';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch data transaksi dari API berdasarkan ID
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        
        if (!id) {
          setError("ID transaksi tidak valid");
          setLoading(false);
          return;
        }

        const response = await api.get(`/transactions/${id}`);
        
        if (!response.data) {
          throw new Error('Response data tidak ditemukan');
        }

        let transactionData = null;

        if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          transactionData = response.data.data;
        }
        else if (response.data.id && Array.isArray(response.data.details)) {
          transactionData = response.data;
        }
        else if (response.data.id) {
          transactionData = response.data;
        }
        else if (response.data.transaction) {
          transactionData = response.data.transaction;
        }

        if (!transactionData) {
          throw new Error('Data transaksi tidak ditemukan dalam response');
        }

        setTransaction(transactionData);
        setLoading(false);
      } catch (err) {
        
        if (err.response?.status === 404) {
          setError("Transaksi tidak ditemukan");
          setTimeout(() => navigate("/transactions"), 2000);
        } else if (err.response?.status === 401) {
          localStorage.removeItem('auth_token');
          navigate("/login", { replace: true });
        } else {
          setError(err.message || "Gagal memuat detail transaksi");
        }
        
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id, navigate]);


  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(value));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/transactions")}>Kembali ke Daftar Transaksi</Button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Data transaksi tidak ditemukan</p>
          <Button onClick={() => navigate("/transactions")}>Kembali ke Daftar Transaksi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Detail Transaksi</h1>
      </div>

      {/* Success Banner */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900">Transaksi Berhasil!</h3>
          <p className="text-sm text-green-800 mt-1">Terima kasih atas pembelian Anda. Data transaksi telah disimpan.</p>
        </div>
      </div>

      {/* Card Utama */}
      <Card className="overflow-hidden">
        {/* Header Card - Kode Transaksi */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">Transaksi #{transaction.id}</h2>
              <div className="flex items-center gap-2 text-blue-100 mt-2">
                <CalendarIcon className="h-4 w-4" />
                <p className="text-sm">{formatDate(transaction.created_at)}</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full">
              ✓ Selesai
            </span>
          </div>
        </div>

        {/* Body Card */}
        <div className="p-6 space-y-6">
          {/* Informasi Pelanggan */}
          {transaction.customer ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Informasi Pelanggan</h3>
              </div>
              <div className="ml-7 space-y-1">
                <div>
                  <span className="text-sm text-gray-600">Nama: </span>
                  <span className="font-medium text-gray-900">{transaction.customer.name}</span>
                </div>
                {transaction.customer.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Telepon: </span>
                    <span className="text-gray-900">{transaction.customer.phone}</span>
                  </div>
                )}
                {transaction.customer.email && (
                  <div>
                    <span className="text-sm text-gray-600">Email: </span>
                    <span className="text-gray-900">{transaction.customer.email}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">Pelanggan: <span className="font-medium">Umum</span></p>
              </div>
            </div>
          )}

          {/* Rincian Produk */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
              Rincian Produk ({transaction.details?.length || 0} item)
            </h3>
            <div className="space-y-3">
              {transaction.details && transaction.details.length > 0 ? (
                transaction.details.map((detail, index) => (
                  <div key={detail.id || index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      {/* Nama Produk */}
                      <div className="font-medium text-gray-900">
                        {detail.product?.name || "Produk"}
                      </div>
                      
                      {/* Kode Produk */}
                      {detail.product?.code && (
                        <div className="text-xs text-gray-500 mt-1">
                          Kode: {detail.product.code}
                        </div>
                      )}
                      
                      {/* Harga Saat Transaksi */}
                      <div className="text-sm text-gray-600 mt-2">
                        Harga: {formatCurrency(detail.price_at_time)}
                      </div>
                      
                      {/* Jumlah */}
                      <div className="text-sm text-gray-700 mt-1">
                        Jumlah: <span className="font-medium">{detail.qty}</span>
                      </div>
                    </div>
                    
                    {/* Total Item */}
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-lg">
                        {formatCurrency(parseFloat(detail.price_at_time) * detail.qty)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">Tidak ada item transaksi</p>
              )}
            </div>
          </div>

          {/* Ringkasan Pembayaran */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(transaction.total)}
                </span>
              </div>
              
              {parseFloat(transaction.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Diskon</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(transaction.discount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                <span>Total Pembayaran</span>
                <span className="text-blue-600">
                  {formatCurrency(transaction.final_total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card - Aksi */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => navigate("/transactions")}
            icon={<ArrowLeftIcon className="h-5 w-5" />}
          >
            Kembali ke Daftar
          </Button>
        </div>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}