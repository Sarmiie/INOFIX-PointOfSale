import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';

export default function SearchBar({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        containerClassName="mb-0"
      />
    </div>
  );
}