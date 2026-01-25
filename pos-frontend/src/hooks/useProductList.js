import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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

  const getImageUrl = (product) => {
    if (product.image_url) {
      return product.image_url;
    }

    if (product.image_path) {
      const cleanPath = product.image_path.startsWith("/")
        ? product.image_path.slice(1)
        : product.image_path;
      
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      return `${baseUrl}/storage/${cleanPath}`;
    }

    return null;
  };

  // Transform produk
  const transformProducts = (productsData) => {
    return productsData.map((product) => ({
      ...product,
      image_url: getImageUrl(product),
    }));
  };

  // Fetch produk
  const fetchProducts = useCallback(async (query = "", page = 1) => {
    const cacheKey = `${query}_page_${page}`;

    if (cacheRef.current[cacheKey]) {
      setProducts(cacheRef.current[cacheKey].products);
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

      const response = await api.get("/products", { params });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn("Invalid response format");
        setProducts([]);
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

      const transformedProducts = transformProducts(response.data.data);

      cacheRef.current[cacheKey] = {
        products: transformedProducts,
        pagination: response.data.pagination,
      };

      setProducts(transformedProducts);
      setPagination(response.data.pagination);

      console.log("Products loaded:", {
        count: transformedProducts.length,
        total: response.data.pagination?.total,
      });
    } catch (err) {
      console.error("Error fetching products:", err.message);

      if (err.response?.status === 401) {
        console.warn("Token tidak valid, redirect ke login...");
        localStorage.removeItem("auth_token");
        navigate("/login", { replace: true });
      } else if (err.request) {
        console.error("Tidak ada respons dari server");
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Inisialisasi
  useEffect(() => {
    fetchProducts("", 1);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchProducts]);

  // Handle pencarian dengan debounce
  const handleSearch = useCallback((value) => {
    setSearch(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchProducts(value, 1);
    }, 500);
  }, [fetchProducts]);

  // Handle perubahan halaman
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchProducts(search, newPage);
    }
  }, [fetchProducts, search, pagination.last_page]);

  // Refresh data
  const refreshData = useCallback(() => {
    cacheRef.current = {};
    fetchProducts(search, pagination.current_page);
  }, [fetchProducts, search, pagination.current_page]);

  return {
    products,
    loading,
    search,
    pagination,
    handleSearch,
    handlePageChange,
    refreshData,
    fetchProducts
  };
}