import { useState } from "react";
import { supabase } from "../supabaseClient";

export const useCompanySearch = () => {
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [companyIdType, setCompanyIdType] = useState("");
  const [companyIdNumber, setCompanyIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompanySearch = async () => {
    setLoading(true);
    setError(null);
    setCompanySearchResults([]);

    try {
      let query = supabase.from("CompanyGroups").select("*");

      if (companySearchTerm) {
        query = query.ilike("companyName", `%${companySearchTerm}%`);
      }
      if (companyIdNumber) {
        query = query.ilike("identificationNumber", `%${companyIdNumber}%`);
      }
      if (companyIdType) {
        query = query.eq("identificationType", companyIdType);
      }

      const { data, error } = await query.order("companyName");
      if (error) throw error;

      setCompanySearchResults(data || []);
    } catch (err) {
      console.error("Error in company search:", err);
      setError(`Error al buscar empresas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    companySearchResults,
    setCompanySearchResults,
    companySearchTerm,
    setCompanySearchTerm,
    companyIdType,
    setCompanyIdType,
    companyIdNumber,
    setCompanyIdNumber,
    loading,
    error,
    handleCompanySearch,
  };
};
