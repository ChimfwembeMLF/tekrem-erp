import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function GetAnalytics() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>LinkedIn Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Fetch and view analytics for your LinkedIn company page and posts.
        </p>
        <Button variant="default">Get Analytics</Button>
      </CardContent>
    </Card>
  );
}
