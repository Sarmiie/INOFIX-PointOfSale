import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";
import Button from "../Button";

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPhone("");
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/customers", {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
      });

      console.log("✅ Raw response:", response);

      let newCustomer = null;
      
      if (response.data?.data) {
        newCustomer = response.data.data;
      } 
      else if (response.data?.id && typeof response.data === 'object') {
        newCustomer = response.data;
      }
      else if (Array.isArray(response.data) && response.data.length > 0) {
        newCustomer = response.data[0];
      }
      else if (typeof response.data === 'object' && response.data !== null) {
        newCustomer = response.data;
      }

      if (!newCustomer || !newCustomer.id) {
        throw new Error('Data pelanggan tidak valid dalam respons');
      }

      newCustomer.name = newCustomer.name || name.trim();
      newCustomer.id = newCustomer.id || null;

      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err) {
      setLoading(false);
      console.error("❌ Error create customer:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data error:", err.response.data);
        
        if (err.response.status === 422) {
          const validationErrors = {};
          if (err.response.data.errors) {
            Object.keys(err.response.data.errors).forEach(field => {
              validationErrors[field] = err.response.data.errors[field][0];
            });
          }
          setErrors(validationErrors);
        } 
        else if (err.response.status === 401) {
          alert("Sesi telah berakhir. Silakan login ulang.");
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        else if (err.response.status >= 500) {
          alert("Terjadi kesalahan server. Silakan coba lagi nanti.");
        }
        else {
          const errorMessage = err.response.data?.message || 
                             err.response.data?.error || 
                             "Gagal menyimpan pelanggan";
          alert(errorMessage);
        }
      } 
      else if (err.request) {
        console.error("Network error:", err.request);
        alert("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } 
      else {
        console.error("Error lain:", err.message);
        alert(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* ✅ Overlay background dengan posisi fixed */}
        <div 
          className="inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isSuccess ? 'Pelanggan Berhasil Ditambahkan!' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-700">
                  Pelanggan baru telah ditambahkan ke daftar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}