import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../services/api";
import toast from "react-hot-toast";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    price: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

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
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Ukuran file maksimal 2MB" }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "File harus berupa gambar" }));
      return;
    }

    setImage(file);

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
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
    setErrors({});

    if (!validate()) {
      console.warn("Validasi client gagal");
      return;
    }

    const loadingToast = toast.loading("Menyimpan produk...");

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("code", formData.code.trim());
      submitData.append("price", parseFloat(formData.price));
      submitData.append("stock", parseInt(formData.stock));

      if (image) {
        submitData.append("image", image);
      }

      const response = await api.post("/products", submitData);

      toast.success("Produk berhasil ditambahkan!", {
        id: loadingToast,
      });

      navigate("/products");
    } catch (err) {
      toast.error("Gagal menyimpan produk", {
        id: loadingToast,
        duration: 500,
      });

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
        } else {
          setGeneralError(err.response.data?.message || "Server error");
        }
      } else if (err.request) {
        console.error("❌ No response from server");
        setGeneralError(
          "Server tidak merespons. Pastikan backend sedang berjalan.",
        );
      } else {
        console.error("❌ Error:", err.message);
        setGeneralError(err.message || "Terjadi kesalahan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Tambah Produk Baru
          </h1>
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

            {/* Image Upload */}
            <div className="mb-6 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Produk (Opsional)
              </label>
              <div
                onClick={handleImageClick}
                className="w-32 h-32 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview produk"
                    className="w-full h-full object-cover rounded-xl"
                  />
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
                JPG, PNG, GIF. Maks: 2MB
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
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
