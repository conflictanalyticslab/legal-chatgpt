import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React from "react";

export default function InstitutionsList() {
  const institutions = [
    { id: 1, name: "Queen's University (@queensu.ca)" },
    { id: 2, name: "University of Iowa (@uiowa.edu)" },
    { id: 3, name: "University of Portsmouth (@port.ac.uk)" },
    { id: 4, name: "UCLA School of Law (@law.ucla.edu)" },
    {
      id: 5,
      name: "University of Pennsylvania Carey Law School (@law.upenn.edu)",
    },
    { id: 6, name: "Lakehead University (@lakeheadu.ca)" },
    { id: 7, name: "McGill University (@mcgill.ca)" },
    { id: 8, name: "University of Alberta (@ualberta.ca)" },
    { id: 9, name: "University of Calgary (@ucalgary.ca)" },
    { id: 10, name: "University of Manitoba (@umanitoba.ca)" },
    { id: 10, name: "University of Toronto (@utoronto.ca)" },
    { id: 11, name: "Florida State University of Law (@law.fsu.edu)" },
    { id: 12, name: "Leiden Law School (@law.leidenuniv.nl)" },
    { id: 13, name: "Leiden University Libraries (@library.leidenuniv.nl)" },
    { id: 14, name: "Université Catholique de Lille (@univ-vatholille.fr)" },
    { id: 15, name: "Harvard Law School (@law.harvard.edu)" },
    { id: 16, name: "Harvard Faculty of Arts and Sciences (@fas.harvard.edu)" },
    {
      id: 17,
      name: "Northwestern Pritzker School of Law (@law.northwestern.edu)",
    },
    {
      id: 18,
      name: "Northwestern Kellogg School of Management (@kellogg.northwestern.edu)",
    },
  ];

  return (
    <div className="flex justify-center items-center">
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle>List of pre-approved institutional domains</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 overflow-auto">
          {institutions.map((institution) => (
            <Label>{institution.name} </Label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
