import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Select({
  value,
  onChange,
  options = [],
  fetchOptions,
  placeholder = "Pilih...",
  searchable = true,
  isClearable = true,
  disabled = false,
  className = "",
  isLoading: externalLoading = false,
  error = null,
  onCreateNew
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [internalOptions, setInternalOptions] = useState(options);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  // Handle klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch options jika ada fungsi fetch
  useEffect(() => {
    if (fetchOptions && isOpen) {
      const loadOptions = async () => {
        setIsLoading(true);
        try {
          const data = await fetchOptions(search);
          setInternalOptions(data);
        } catch (err) {
          console.error('Gagal memuat opsi:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadOptions();
    } else {
      // Filter opsi lokal jika tidak ada fetch
      if (!fetchOptions) {
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(search.toLowerCase())
        );
        setInternalOptions(filtered);
      }
    }
  }, [search, isOpen, fetchOptions, options]);

  const selectedOption = internalOptions.find(opt => opt.value === value);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input yang bisa diklik */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-white border rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="flex items-center space-x-1">
          {/* Tombol Tambah Baru (jika tersedia) */}
          {onCreateNew && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateNew();
              }}
              className="p-0.5 text-blue-600 hover:bg-blue-100 rounded-full transition"
              title="Tambah data baru"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Tombol Clear */}
          {value && isClearable && !disabled && (
            <button
              onClick={handleClear}
              className="p-0.5 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          {/* Chevron Icon */}
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Pencarian */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {(isLoading || externalLoading) && (
            <div className="px-4 py-2 text-sm text-gray-500">Memuat...</div>
          )}

          {/* Daftar Opsi */}
          {!isLoading && !externalLoading && (
            <div className="py-1">
              {internalOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">Tidak ada data</div>
              ) : (
                internalOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}