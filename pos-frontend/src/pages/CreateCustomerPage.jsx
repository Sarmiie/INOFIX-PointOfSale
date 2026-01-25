import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import api from "../services/api";
import toast from "react-hot-toast";

export default function CreateCustomerPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

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

      const response = await api.post("/customers", submitData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.success || response.status === 201) {

        setTimeout(() => {
          navigate("/customers");
          toast.success("Pelanggan berhasil ditambahkan")
        });
      }
    } catch (err) {
      toast.error("Gagal menyimpan pelanggan", {
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

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Tambah Pelanggan Baru
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
              placeholder="Masukan nama pelanggan"
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
              placeholder="Masukan nomor telepon"
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
              placeholder="Email pelanggan (opsional)"
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
                {isSubmitting ? "Menyimpan..." : "Simpan Pelanggan"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}