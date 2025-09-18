import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function ImportLead() {
  const [leadUrl, setLeadUrl] = useState("");

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Import LinkedIn Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Import a lead from LinkedIn by providing the lead form URL or ID.
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Lead form URL or ID"
            value={leadUrl}
            onChange={e => setLeadUrl(e.target.value)}
          />
          <Button variant="default">Import Lead</Button>
        </div>
      </CardContent>
    </Card>
  );
}
