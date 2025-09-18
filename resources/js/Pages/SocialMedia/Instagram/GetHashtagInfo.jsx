import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function GetHashtagInfo() {
  const [hashtag, setHashtag] = useState("");

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Get Instagram Hashtag Info</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter a hashtag to fetch analytics and usage info from Instagram.
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter hashtag (without #)"
            value={hashtag}
            onChange={e => setHashtag(e.target.value)}
          />
          <Button variant="default">Get Info</Button>
        </div>
      </CardContent>
    </Card>
  );
}
