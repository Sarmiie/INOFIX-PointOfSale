import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const currentQty = item.qty;

  // Build image URL
  const buildImageUrl = (product) => {
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
  };

  const imageUrl = buildImageUrl(item.product);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex items-center py-3 px-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition">
      {/* Gambar */}
      <div className="w-12 h-12 flex-shrink-0 overflow-hidden flex items-center justify-center rounded-md bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={item.product.name}
            className="w-full h-full object-contain rounded-md"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<span class="text-gray-500 text-xs">No img</span>';
            }}
            loading="lazy"
          />
        ) : (
          <span className="text-gray-500 text-xs">No img</span>
        )}
      </div>
      
      {/* Info Produk */}
      <div className="ml-3 flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-xs text-gray-600">
          {formatCurrency(item.product.price)}
        </p>
      </div>

      {/* Kontrol Quantity */}
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        <button
          onClick={() => onUpdateQty(item.product.id, currentQty - 1)}
          disabled={currentQty <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Kurangi jumlah"
        >
          <MinusIcon className="h-3 w-3 text-gray-700" />
        </button>
        
        <span className="w-6 text-center text-sm font-semibold text-gray-900">
          {currentQty}
        </span>
        
        <button
          onClick={() => onUpdateQty(item.product.id, currentQty + 1)}
          disabled={currentQty >= item.product.stock}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Tambah jumlah"
        >
          <PlusIcon className="h-3 w-3 text-gray-700" />
        </button>
        
        {/* Tombol Hapus */}
        <button
          onClick={() => onRemove(item.product.id)}
          className="ml-1 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition"
          title="Hapus dari keranjang"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}