import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export function usePOS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [imageCache, setImageCache] = useState({});

  // Build image URL
  const buildImageUrl = useCallback((product) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    if (product.image_url) {
      if (product.image_url.startsWith("http")) {
        return product.image_url;
      }
      return `${baseUrl}${product.image_url.startsWith("/") ? "" : "/"}${product.image_url}`;
    }

    if (product.image_path) {
      const cleanPath = product.image_path.startsWith("/")
        ? product.image_path.slice(1)
        : product.image_path;
      return `${baseUrl}/storage/${cleanPath}`;
    }

    if (product.image) {
      const cleanImage = product.image.startsWith("/") ? product.image.slice(1) : product.image;
      return `${baseUrl}/storage/${cleanImage}`;
    }

    return null;
  }, []);

  // Preload images
  const preloadProductImages = useCallback((productsList) => {
    const newCache = {};
    productsList.forEach((product) => {
      const imageUrl = buildImageUrl(product);
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        newCache[product.id] = imageUrl;
      }
    });
    setImageCache(newCache);
  }, [buildImageUrl]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [productsResponse, customersResponse] = await Promise.all([
        api.get("/products", { params: { per_page: 100, page: 1 } }),
        api.get("/customers", { params: { per_page: 100, page: 1 } })
      ]);

      // Handle products response
      let productsList = [];
      if (productsResponse.data?.data) {
        productsList = productsResponse.data.data;
      } else if (Array.isArray(productsResponse.data)) {
        productsList = productsResponse.data;
      }

      // Handle customers response
      let customersList = [];
      if (customersResponse.data?.data) {
        customersList = customersResponse.data.data;
      } else if (Array.isArray(customersResponse.data)) {
        customersList = customersResponse.data;
      }

      setProducts(productsList);
      
      const customerOptions = customersList.map((customer) => ({
        value: customer.id,
        label: customer.name,
      }));
      setCustomers(customerOptions);

      preloadProductImages(productsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
      }
      setLoading(false);
    }
  }, [navigate, preloadProductImages]);

  // Initialize
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cart functions
  const addToCart = useCallback((product) => {
    if (product.stock <= 0) {
      alert("Stok produk tidak tersedia");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Stok ${product.name} tidak cukup`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { product, qty: 1 }];
      }
    });
  }, []);

  const updateQty = useCallback((productId, newQty) => {
    if (newQty < 1) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty > product.stock) {
      alert(`Stok ${product.name} tidak cukup. Stok tersedia: ${product.stock}`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, qty: newQty } : item
      )
    );
  }, [products]);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  let discountPercentage = 0;
  if (subtotal >= 1000000) {
    discountPercentage = 15;
  } else if (subtotal >= 500000) {
    discountPercentage = 10;
  }
  const discount = (subtotal * discountPercentage) / 100;
  const total = subtotal - discount;

  // Format currency
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  }, []);

  // Checkout
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || !selectedCustomer) return;

    setIsCheckingOut(true);
    try {
      const transactionData = {
        customer_id: parseInt(selectedCustomer),
        items: cart.map((item) => ({
          product_id: item.product.id,
          qty: item.qty,
        })),
      };

      const response = await api.post("/transactions", transactionData);

      // Validasi response
      let transactionResult = null;
      if (response.data.data) {
        transactionResult = response.data.data;
      } else if (response.data.id) {
        transactionResult = response.data;
      } else if (response.data.transaction) {
        transactionResult = response.data.transaction;
      }

      if (!transactionResult?.id) {
        throw new Error('ID transaksi tidak ditemukan');
      }

      toast.success("Transaksi Berhasil");
      
      // Reset state
      setCart([]);
      setSelectedCustomer(null);
      setSearch("");
    } catch (err) {
      console.error("Checkout error:", err);
      
      if (err.response?.status === 422) {
        const errorMsg = err.response.data?.errors
          ? Object.values(err.response.data.errors).flat().join("\n")
          : err.response.data?.message || "Data tidak valid";
        alert("Validasi Gagal:\n" + errorMsg);
      } else if (err.response?.status === 401) {
        alert("Session expired. Silakan login kembali.");
        navigate("/login", { replace: true });
      } else {
        alert(err.response?.data?.message || err.message || "Gagal menyimpan transaksi");
      }
    } finally {
      setIsCheckingOut(false);
    }
  }, [cart, selectedCustomer, navigate]);

  // Get image URL
  const getImageUrl = useCallback((product) => {
    return imageCache[product.id] || buildImageUrl(product);
  }, [imageCache, buildImageUrl]);

  // Filter products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  return {
    products,
    customers,
    setCustomers,
    cart,
    search,
    selectedCustomer,
    loading,
    isCheckingOut,
    imageCache,
    filteredProducts,
    
    // Derived values
    subtotal,
    discount,
    discountPercentage,
    total,
    
    // Functions
    setSearch,
    setSelectedCustomer,
    addToCart,
    updateQty,
    removeFromCart,
    handleCheckout,
    getImageUrl,
    formatCurrency,
    
    // Actions
    resetCart: () => setCart([]),
    clearSearch: () => setSearch("")
  };
}