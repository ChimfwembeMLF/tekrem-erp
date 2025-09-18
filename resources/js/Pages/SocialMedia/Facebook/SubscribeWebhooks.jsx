import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function SubscribeWebhooks() {
  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Subscribe Facebook Webhooks</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Subscribe to Facebook page webhooks to receive real-time updates for leads, posts, and messages.
        </p>
        <Button variant="default">Subscribe</Button>
      </CardContent>
    </Card>
  );
}
