import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function SyncLeads() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Sync Facebook Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Sync all leads from your connected Facebook pages. This will fetch the latest leads and update your CRM.
        </p>
        <Button variant="default">Sync Leads</Button>
      </CardContent>
    </Card>
  );
}
