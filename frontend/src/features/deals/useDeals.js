import { useCallback, useEffect, useState } from "react";
import { dealRepository } from "@/data/dealRepository";
export const useDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try { setDeals(await dealRepository.list()); setError(""); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); window.addEventListener("metro-deals-changed", reload); window.addEventListener("focus", reload); return () => { window.removeEventListener("metro-deals-changed", reload); window.removeEventListener("focus", reload); }; }, [reload]);
  return { deals, loading, error, reload };
};