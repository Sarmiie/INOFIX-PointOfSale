import { useState, useEffect } from 'react';
import { CubeIcon, UserGroupIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch data statistik
  const fetchDashboardData = async () => {
    try {
      // Jalankan semua request secara paralel
      const [productsRes, customersRes, transactionsRes] = await Promise.all([
        api.get('/products?per_page=1'),
        api.get('/customers?per_page=1'),
        api.get('/transactions?per_page=1')
      ]);

      setStats({
        totalProducts: productsRes.data.pagination?.total || productsRes.data.length || 0,
        totalCustomers: customersRes.data.pagination?.total || customersRes.data.length || 0,
        totalTransactions: transactionsRes.data.pagination?.total || transactionsRes.data.length || 0
      });
    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        totalTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'bg-blue-500',
      delay: 0
    },
    {
      title: 'Pelanggan',
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      delay: 100
    },
    {
      title: 'Transaksi',
      value: stats.totalTransactions,
      icon: CreditCardIcon,
      color: 'bg-purple-500',
      delay: 200
    },
  ];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
            style={{ animationDelay: `${card.delay}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? (
                    <span className="animate-pulse">—</span>
                  ) : (
                    new Intl.NumberFormat('id-ID').format(card.value)
                  )}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Memuat data dashboard...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && stats.totalProducts === 0 && stats.totalCustomers === 0 && stats.totalTransactions === 0 && (
        <div className="mt-12 text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data</h3>
          <p className="text-gray-600">Mulai tambahkan produk, pelanggan, dan transaksi untuk melihat statistik di sini.</p>
        </div>
      )}
    </div>
  );
}