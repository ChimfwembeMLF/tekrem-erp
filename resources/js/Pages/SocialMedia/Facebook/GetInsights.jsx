import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function GetInsights() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Facebook Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Fetch and view analytics insights for your Facebook pages and posts.
        </p>
        <Button variant="default">Get Insights</Button>
      </CardContent>
    </Card>
  );
}
