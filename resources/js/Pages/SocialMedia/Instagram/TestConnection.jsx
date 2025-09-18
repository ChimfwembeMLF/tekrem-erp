import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function TestConnection() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Test Instagram Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Test the connection to your Instagram integration and verify credentials.
        </p>
        <Button variant="default">Test Connection</Button>
      </CardContent>
    </Card>
  );
}
