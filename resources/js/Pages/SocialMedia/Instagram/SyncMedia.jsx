import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function SyncMedia() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Sync Instagram Media</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Sync all media from your connected Instagram accounts. This will fetch the latest photos and videos.
        </p>
        <Button variant="default">Sync Media</Button>
      </CardContent>
    </Card>
  );
}
