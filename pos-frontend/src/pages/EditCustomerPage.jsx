import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../services/api";
import toast from "react-hot-toast";

export default function EditCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await api.get(`/customers/${id}`);

        if (response.data?.data) {
          const customer = response.data.data;
          setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || "",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading customer:", err);

        if (err.response?.status === 404) {
          setGeneralError("Pelanggan tidak ditemukan");
          setTimeout(() => navigate("/customers"), 1500);
        } else if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setGeneralError("Gagal memuat data pelanggan. Coba lagi.");
        }

        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error saat user mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nama pelanggan wajib diisi";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email tidak valid";

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
      const submitData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
      };

      const response = await api.put(`/customers/${id}`, submitData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.success || response.status === 200) {

        // Navigate ke customers page
        setTimeout(() => {
          navigate("/customers");
          toast.success("Pelanggan berhasil diubah")
        });
      }
    } catch (err) {
      toast.error("Gagal menyimpan perubahan", {
        duration: 500
      })

      if (err.response) {

        if (err.response.status === 422) {
          // Validasi error dari Laravel
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
          setGeneralError("Pelanggan tidak ditemukan");
        } else {
          setGeneralError(err.response.data?.message || "Server error");
        }
      } else if (err.request) {
        console.error("No response from server");
        setGeneralError(
          "Server tidak merespons. Pastikan backend sedang berjalan."
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
          <p className="text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Pelanggan
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

            {/* Nama Pelanggan */}
            <Input
              label="Nama Pelanggan *"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Contoh: Budi Santoso"
              required
            />

            {/* Nomor Telepon */}
            <Input
              label="Nomor Telepon *"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Contoh: 081234567890"
              required
            />

            {/* Email */}
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Contoh: budi@email.com (Opsional)"
            />

            {/* Aksi */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/customers")}
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