import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import TodoList from "./pages/TodoList";

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      <Route path="/" element={<TodoList />} />
    </Routes>
  );
}
