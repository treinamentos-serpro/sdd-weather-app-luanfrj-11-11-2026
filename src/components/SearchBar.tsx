import { useId, useState, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError('Informe o nome de uma cidade.');
      return;
    }
    if (trimmedCity.length < 2) {
      setError('Digite pelo menos 2 caracteres.');
      return;
    }

    setError('');
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="search"
          value={city}
          maxLength={100}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setCity(event.target.value);
            setError('');
          }}
          placeholder="Digite o nome da cidade"
          className="min-w-0 flex-1 rounded-md border border-white/20 bg-night-900/70 px-4 py-2 text-white placeholder:text-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-accent-500 px-5 py-2 font-medium text-night-900 enabled:hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}