import { useState } from "react";

export default function App() {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState<string[]>([
    "numbers",
    "alphabets",
    "highest_alphabet",
  ]); // Default: Show all

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    try {
      const parsedInput = JSON.parse(input);

      // Validate input structure
      if (
        typeof parsedInput !== "object" ||
        !parsedInput.hasOwnProperty("data") ||
        !Array.isArray(parsedInput.data) ||
        Object.keys(parsedInput).length !== 1
      ) {
        throw new Error('Invalid JSON format. Expected { "data": [] }');
      }

      const res = await fetch(
        "https://bajaj-backend-production-e983.up.railway.app/api",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedInput),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch data from API");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Function to toggle filter selection
  const toggleFilter = (filterType: string) => {
    setFilters(
      (prev) =>
        prev.includes(filterType)
          ? prev.filter((item) => item !== filterType) // Remove if already selected
          : [...prev, filterType] // Add if not selected
    );
  };

  // Function to format and filter response based on selected filters
  const formatResponse = () => {
    if (!response) return null;

    const {
      is_success,
      user_id,
      email,
      roll_number,
      numbers,
      alphabets,
      highest_alphabet,
    } = response;

    let filteredData: Record<string, any> = {};

    if (filters.includes("numbers")) filteredData.numbers = numbers;
    if (filters.includes("alphabets")) filteredData.alphabets = alphabets;
    if (filters.includes("highest_alphabet"))
      filteredData.highest_alphabet = highest_alphabet;

    return (
      <div className="bg-gray-100 p-4 mt-4 rounded">
        <p>
          <strong>Status:</strong> {is_success ? "Successful" : "Failed"}
        </p>
        <p>
          <strong>User ID:</strong> {user_id}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Roll Number:</strong> {roll_number}
        </p>
        {Object.entries(filteredData).map(([key, value]) => (
          <p key={key}>
            <strong>{key.replace("_", " ")}:</strong>{" "}
            {Array.isArray(value) ? value.join(", ") : value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder='Enter JSON (e.g., { "data": [] })'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.includes("numbers")}
              onChange={() => toggleFilter("numbers")}
            />
            Show Numbers
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.includes("alphabets")}
              onChange={() => toggleFilter("alphabets")}
            />
            Show Alphabets
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.includes("highest_alphabet")}
              onChange={() => toggleFilter("highest_alphabet")}
            />
            Show Highest Alphabet
          </label>
        </div>

        <button className="bg-blue-500 text-white p-2 rounded" type="submit">
          Submit
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && formatResponse()}
    </div>
  );
}
