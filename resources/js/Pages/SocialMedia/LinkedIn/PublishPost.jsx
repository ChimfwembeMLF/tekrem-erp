import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function PublishPost() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Publish LinkedIn Post</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Publish a drafted post to your connected LinkedIn company page.
        </p>
        <Button variant="default">Publish Post</Button>
      </CardContent>
    </Card>
  );
}
