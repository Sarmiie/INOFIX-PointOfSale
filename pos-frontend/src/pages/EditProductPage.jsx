import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../services/api";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    stock: "",
  });

  const [originalImage, setOriginalImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState("");

  const getImageUrl = (product) => {
    if (product.image_url) {
      return product.image_url;
    }

    if (product.image_path) {
      // Hapus leading slash jika ada
      const cleanPath = product.image_path.startsWith("/")
        ? product.image_path.slice(1)
        : product.image_path;

      // Construct URL ke storage
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      return `${baseUrl}/storage/${cleanPath}`;
    }

    // Fallback: Return null jika tidak ada gambar
    return null;
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        let productData = null;

        // Handle berbagai format response
        if (response.data?.data) {
          productData = response.data.data;
        } else if (response.data?.id) {
          productData = response.data;
        }

        if (productData) {
          setFormData({
            name: productData.name,
            code: productData.code,
            price: String(productData.price),
            stock: String(productData.stock),
          });

          // Handle berbagai format image URL
          let imageUrl = null;
          if (productData.image_url) {
            imageUrl = productData.image_url;
          } else if (productData.image_path) {
            // Jika backend mengirim image_path, construct full URL
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
            imageUrl = `${baseUrl}/storage/${productData.image_path}`;
          }

          setOriginalImage(imageUrl);
          setImagePreview(imageUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading product:", err);

        if (err.response?.status === 404) {
          setGeneralError("Produk tidak ditemukan");
          setTimeout(() => navigate("/products"), 1500);
        } else if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setGeneralError("Gagal memuat data produk. Coba lagi.");
        }

        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Ukuran file maksimal 2MB" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "File harus berupa gambar" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Simpan file untuk di-upload
    setImageFile(file);
    setImageChanged(true);

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Hapus gambar yang dipilih
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(originalImage);
    setImageChanged(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!formData.code.trim()) newErrors.code = "Kode produk wajib diisi";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Harga harus lebih dari 0";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Stok tidak boleh negatif";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) {
      console.warn("Validasi client gagal");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gunakan FormData jika ada gambar yang di-upload
      const submitData = new FormData();

      submitData.append("name", formData.name.trim());
      submitData.append("code", formData.code.trim());
      submitData.append("price", parseFloat(formData.price));
      submitData.append("stock", parseInt(formData.stock));
      submitData.append("_method", "PUT");

      // Hanya kirim gambar jika ada perubahan
      if (imageChanged && imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await api.post(`/products/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success || response.status === 200) {
        setTimeout(() => {
          navigate("/products");
          toast.success('Produk berhasil diubah')
        });
      }
    } catch (err) {
      toast.error("Gagal menyimpan perubahan", {
        id: loadingToast,
        duration: 500
      })

      if (err.response) {
        console.error("Response Status:", err.response.status);

        if (err.response.status === 422) {
          if (err.response.data?.errors) {
            const formattedErrors = {};
            Object.keys(err.response.data.errors).forEach((key) => {
              const messages = err.response.data.errors[key];
              formattedErrors[key] = Array.isArray(messages)
                ? messages[0]
                : messages;
            });
            setErrors(formattedErrors);
            console.error("Validation Errors:", formattedErrors);
          }
        } else if (err.response.status === 404) {
          setGeneralError("Produk tidak ditemukan");
        } else {
          setGeneralError(err.response.data?.message || "Server error");
        }
      } else if (err.request) {
        console.error("No response from server");
        setGeneralError(
          "Server tidak merespons. Pastikan backend sedang berjalan.",
        );
      } else {
        console.error("Error:", err.message);
        setGeneralError(err.message || "Terjadi kesalahan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Produk</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl w-full">
        <Card className="h-full">
          <form onSubmit={handleSubmit}>
            {/* General Error Message */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {generalError}
              </div>
            )}

            {/* Image Preview */}
            <div className="mb-6 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Produk
              </label>
              <div
                onClick={handleImageClick}
                className="relative w-32 h-32 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition group"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview produk"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {/* Tombol hapus gambar */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      title="Hapus gambar"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 text-center px-2">
                      Klik untuk unggah
                    </span>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">
                Format: JPG, PNG, GIF. Maks: 2MB
              </p>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Nama Produk */}
            <Input
              label="Nama Produk *"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Masukan nama produk"
              required
            />

            {/* Kode Produk */}
            <Input
              label="Kode Produk *"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="Masukan kode produk"
              required
            />

            {/* Harga */}
            <Input
              label="Harga (Rp) *"
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="Masukan harga produk"
              min="1"
              step="1"
              required
            />

            {/* Stok */}
            <Input
              label="Stok *"
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
              placeholder="Masukan jumlah stock"
              min="0"
              step="1"
              required
            />

            {/* Aksi */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/products")}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
