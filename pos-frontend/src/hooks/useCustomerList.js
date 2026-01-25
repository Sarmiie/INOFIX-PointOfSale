import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useCustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const fetchCustomers = useCallback(async (query = "", page = 1) => {
    const cacheKey = `${query}_page_${page}`;
    
    if (cacheRef.current[cacheKey]) {
      setCustomers(cacheRef.current[cacheKey].customers);
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

      const response = await api.get('/customers', { params });
      
      if (!response.data || !Array.isArray(response.data.data)) {
        setCustomers([]);
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
        customers: response.data.data,
        pagination: response.data.pagination,
      };

      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error saat fetch customers:", err);
      
      if (err.response?.status === 401) {
        console.warn("Token tidak valid, redirect ke login...");
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
      }
      
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCustomers("", 1);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchCustomers]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchCustomers(value, 1);
    }, 500);
  }, [fetchCustomers]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchCustomers(search, newPage);
    }
  }, [fetchCustomers, search, pagination.last_page]);

  const refreshData = useCallback(() => {
    cacheRef.current = {};
    fetchCustomers(search, pagination.current_page);
  }, [fetchCustomers, search, pagination.current_page]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return {
    customers,
    loading,
    search,
    pagination,
    handleSearch,
    handlePageChange,
    refreshData,
    fetchCustomers,
    formatDate
  };
}