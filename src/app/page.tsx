"use client";

import { useTranscriptionHistory } from "@/app/history";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import { AlertCircle, Copy, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useAsyncCallback } from "react-async-hook";

function useMutation() {
  return useAsyncCallback(
    async (
      url: string,
      includeTimestamps: boolean,
      filterOutMusic: boolean
    ) => {
      const response = await fetch(
        `/${url}&timestamps=${includeTimestamps}&filterOutMusic=${filterOutMusic}`
      );
      const id = response.headers.get("id");
      const title = response.headers.get("title");
      const imgUrl = response.headers.get("img-url");
      if (id && title && imgUrl) {
        const s = useTranscriptionHistory.getState();

        s.actions.addVideo({
          id: decodeURIComponent(atob(id)),
          title: decodeURIComponent(atob(title)),
          imgUrl: decodeURIComponent(atob(imgUrl)),
        });
      } else if (response.ok) {
        toast({
          title: "Transcript created, but...",
          description: "We couldn't save it to your history.",
        });
      }
      return response.text();
    },
    {
      onError(e, options) {
        toast({
          title: "Error",
          description: e.message || "Is that a valid YouTube URL?",
          variant: "destructive",
        });
      },
    }
  );
}

export default function FactChecker() {
  const [url, setUrl] = useState("")
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [filterOutMusic, setFilterOutMusic] = useState(true)
  const mutation = useMutation()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    await mutation.execute(url, includeTimestamps, filterOutMusic)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">TruthLens</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">YouTube Video Analysis</CardTitle>
            <CardDescription>
              Transcribe and analyze any YouTube video for factual accuracy and potential bias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">Video URL</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        youtube.com/
                      </span>
                      <Input
                        id="url"
                        placeholder="watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={mutation.loading}
                        required
                        autoFocus
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={mutation.loading}>
                    {mutation.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Video"
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timestamps"
                    checked={includeTimestamps}
                    onCheckedChange={(checked) => setIncludeTimestamps(checked as boolean)}
                  />
                  <Label htmlFor="timestamps">Include timestamps</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filterOutMusic"
                    checked={filterOutMusic}
                    onCheckedChange={(checked) => setFilterOutMusic(checked as boolean)}
                  />
                  <Label htmlFor="filterOutMusic">Filter out music (recommended)</Label>
                </div>
              </div>
              </form>

              {mutation.result && (
                <div className="space-y-4 mt-6">
                  <Tabs defaultValue="transcript" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="transcript">Transcript</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="transcript" className="space-y-4">
                      <div className="whitespace-pre-wrap font-mono text-sm max-h-60 overflow-y-auto border p-4 rounded-md">
                        {mutation.result}
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mutation.result)
                          toast({
                            title: "Copied to clipboard",
                            description: "The transcript has been copied to your clipboard.",
                          })
                        }}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Transcript
                      </Button>
                    </TabsContent>
                    <TabsContent value="analysis" className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fact Check</AlertTitle>
                        <AlertDescription>
                          Analysis of factual claims will appear here after processing.
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Bias Analysis</AlertTitle>
                        <AlertDescription>
                          Analysis of potential biases will appear here after processing.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
