// src/App.tsx

import { useState, useEffect } from "react";
import "./App.css";
import { fetchName } from "./actions";


function useFetchName() {
  const [name, setName] = useState("unknown");
  const [loading, setLoading] = useState(false);

  const fetchNameData = async () => {
    try {
      setLoading(true);
      const data = await fetchName();
      setName(data.name);
    } catch (error) {
      console.error("Failed to fetch name:", error);
      setName("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNameData();
  }, []);

  return { name, loading, refetch: fetchNameData };
}

function App() {
  const [count, setCount] = useState(0);
  const { name, loading, refetch } = useFetchName();

  
  return (
    <>
     <div>
        <button
          onClick={() => setCount((count) => count + 1)}
          aria-label="increment"
        >
          count is {count}
        </button>
        <button
          onClick={() => setCount(() => 0)}
          aria-label="reset"
        >
          reset count
        </button>
      </div>
      <div className="card">
        <button
          onClick={refetch}
          aria-label="get name"
          disabled={loading}
        >
          {loading ? "Loading..." : `Name from API is: ${name}`}
        </button>
      </div>
    </>
  );
}

export default App;
