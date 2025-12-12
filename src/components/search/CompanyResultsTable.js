import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "../ui/card";
import { Eye, Building } from "lucide-react";

const CompanyResultsTable = ({
  companySearchResults,
  loading,
  error,
  handleViewCompany,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-8 border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (companySearchResults.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="text-center py-6">
          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Building className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            No hay resultados que mostrar
          </h3>
          <p className="text-muted-foreground">
            Utiliza los filtros para buscar empresas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companySearchResults.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="font-medium">{company.companyName}</div>
                </TableCell>
                <TableCell>
                  <div>{company.identificationType}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.identificationNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{company.contactPerson}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.phone}
                  </div>
                </TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>{company.city || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewCompany(company)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver/Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CompanyResultsTable;
