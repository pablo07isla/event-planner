import { useState } from "react";
import { supabase } from "../supabaseClient"; // Adjust path if necessary depending on where hooks folder is
import { format } from "date-fns";

export const useEventSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [singleDate, setSingleDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState("company");
  const [selectedCompany, setSelectedCompany] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      let query = supabase.from("events").select("*");

      // Filter by company name
      if (searchTerm) {
        query = query.ilike("companyName", `%${searchTerm}%`);
      }

      // Filter by company identification number
      if (companyId) {
        const { data: matchingCompanies, error: companyError } = await supabase
          .from("CompanyGroups")
          .select("id")
          .ilike("identificationNumber", `%${companyId}%`);

        if (companyError) throw companyError;

        if (matchingCompanies && matchingCompanies.length > 0) {
          const companyIds = matchingCompanies.map((company) => company.id);
          query = query.in("companyGroupId", companyIds);
        } else {
          setSearchResults([]);
          setLoading(false);
          return;
        }
      }

      // Filter by selected company
      if (selectedCompany) {
        query = query.eq("companyGroupId", selectedCompany);
      }

      // Filter by single date
      if (singleDate && searchMode === "singleDate") {
        const dateOnly = format(singleDate, "yyyy-MM-dd");
        const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
        query = query
          .gte("start", startOfDay.toISOString())
          .lt("start", endOfDay.toISOString());
      }

      // Filter by date range
      if (startDate && endDate && searchMode === "dateRange") {
        const startDateOnly = format(startDate, "yyyy-MM-dd");
        const endDateOnly = format(endDate, "yyyy-MM-dd");
        const startOfStartDate = new Date(`${startDateOnly}T00:00:00.000Z`);
        const endOfEndDate = new Date(`${endDateOnly}T23:59:59.999Z`);
        query = query
          .gte("start", startOfStartDate.toISOString())
          .lt("start", endOfEndDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with company info if needed
      if (data && data.length > 0) {
        const companyGroupIds = [
          ...new Set(
            data
              .filter((event) => event.companyGroupId)
              .map((event) => event.companyGroupId)
          ),
        ];

        if (companyGroupIds.length > 0) {
          const { data: companyData, error: companyError } = await supabase
            .from("CompanyGroups")
            .select("id, companyName, identificationNumber")
            .in("id", companyGroupIds);

          if (companyError) throw companyError;

          const companyMap = {};
          companyData.forEach((company) => {
            companyMap[company.id] = company;
          });

          data.forEach((event) => {
            if (event.companyGroupId && companyMap[event.companyGroupId]) {
              event.companyInfo = companyMap[event.companyGroupId];
            }
          });
        }
      }

      const sortedData = data
        ? [...data].sort((a, b) => {
            return new Date(a.start) - new Date(b.start);
          })
        : [];

      setSearchResults(sortedData);
    } catch (err) {
      console.error("Error in search:", err);
      setError(`Error al realizar la búsqueda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    companyId,
    setCompanyId,
    singleDate,
    setSingleDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchResults,
    setSearchResults,
    loading,
    error,
    searchMode,
    setSearchMode,
    selectedCompany,
    setSelectedCompany,
    handleSearch,
  };
};
