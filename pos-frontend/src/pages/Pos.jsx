import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import SearchBar from "../components/common/SearchBar";
import Card from "../components/ui/Card";
import CartItem from "../components/ui/POS/CartItem";
import Select from "../components/ui/Select";
import CreateCustomerModal from "../components/ui/POS/CreateCustomerModal";
import { usePOS } from "../hooks/usePOS";

export default function POS() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  
  const {
    products,
    customers,
    cart,
    search,
    selectedCustomer,
    loading,
    isCheckingOut,
    filteredProducts,
    subtotal,
    discountPercentage,
    discount,
    total,
    setSearch,
    setSelectedCustomer,
    setCustomers, 
    addToCart,
    updateQty,
    removeFromCart,
    handleCheckout,
    getImageUrl,
    formatCurrency
  } = usePOS();

  
  const handleCreateCustomer = (newCustomer) => {
    const newOption = { 
      value: newCustomer.id, 
      label: newCustomer.name 
    };
    
    setCustomers(prev => [...prev, newOption]);
    setSelectedCustomer(newCustomer.id);
  };


  useEffect(() => {
    if (location.state?.message && location.state?.success) {
      // Tidak perlu toast karena sudah ada di handleCheckout
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Point of Sale</h1>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Produk */}
        <div className="lg:w-2/3 flex-grow">
          <Card className="mb-4 h-full flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Daftar Produk</h2>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Cari produk..."
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 flex-grow max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
                  <div className="text-center">
                    <p className="font-medium">Produk tidak ditemukan</p>
                    <p className="text-sm mt-1">Coba cari dengan kata kunci lain</p>
                  </div>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const imageUrl = getImageUrl(product);

                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`cursor-pointer rounded-lg p-3 transition border-2 border-transparent ${
                        product.stock > 0
                          ? "hover:bg-blue-50 hover:border-blue-300"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {/* Gambar */}
                      <div className="w-full h-20 mb-2 flex items-center justify-center rounded-md overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain rounded-md"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<span class="text-gray-500 text-xs">No image</span>';
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-gray-500 bg-gray-300 text-xs p-5">No image</span>
                        )}
                      </div>

                      {/* Nama Produk */}
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>

                      {/* Harga */}
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </p>

                      {/* Stok */}
                      <span
                        className={`text-xs ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Stok: {product.stock}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Keranjang */}
        <div className="lg:w-1/3">
          <Card className="bg-gray-50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Pesanan</h2>
              {cart.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {cart.length} item
                </span>
              )}
            </div>

            {/* Pilih Pelanggan */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pelanggan <span className="text-red-600">*</span>
              </label>
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={customers}
                placeholder="Pilih pelanggan..."
                onCreateNew={() => setIsCreateCustomerModalOpen(true)}
                required
              />
            </div>

            {/* Daftar Item */}
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500 flex-grow flex items-center justify-center">
                <div>
                  <div className="text-5xl mb-2">🛒</div>
                  <p className="font-medium">Keranjang kosong</p>
                  <p className="text-sm mt-1">
                    Tambahkan produk untuk memulai
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto mb-4 flex-grow">
                {cart.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}

            {/* Ringkasan */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-2 mt-auto">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Diskon ({discountPercentage}%)</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total Bayar</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {/* Tombol Bayar */}
            <Button
              onClick={handleCheckout}
              disabled={
                cart.length === 0 || isCheckingOut || !selectedCustomer
              }
              className="w-full mt-4 py-3 text-base font-semibold"
            >
              {isCheckingOut ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Memproses...
                </>
              ) : (
                "💳 Bayar Sekarang"
              )}
            </Button>
          </Card>
        </div>

        {/* Modal Tambah Pelanggan */}
        <CreateCustomerModal 
          isOpen={isCreateCustomerModalOpen}
          onClose={() => setIsCreateCustomerModalOpen(false)}
          onCustomerCreated={handleCreateCustomer}
        /> 
      </div>
    </div>
  );
}