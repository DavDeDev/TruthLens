"use client";

import { useTranscriptionHistory } from "@/app/history";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAsyncCallback } from "react-async-hook";

import { AlertCircle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";



// Add interface for political orientation
interface PoliticalOrientation {
  score: number;
  explanation: string;
}

function useMutation() {
  // Add state setter function parameter
  return useAsyncCallback(
    async (
      url: string,
      includeTimestamps: boolean,
      filterOutMusic: boolean,
      setPoliticalOrientation: (orientation: PoliticalOrientation | null) => void
    ) => {
      const response = await fetch(
        `/${url}&timestamps=${includeTimestamps}&filterOutMusic=${filterOutMusic}`
      );
      const id = response.headers.get("id");
      const title = response.headers.get("title");
      const imgUrl = response.headers.get("img-url");
      const politicalOrientation = response.headers.get('orientation');
      const explanation = response.headers.get('explanation');

      if (politicalOrientation && explanation) {
        setPoliticalOrientation({
          score: parseInt(politicalOrientation),
          explanation,
        });
      }
      
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
  const [politicalOrientation, setPoliticalOrientation] = useState<PoliticalOrientation | null>(null);
  

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    await mutation.execute(url, includeTimestamps, filterOutMusic, setPoliticalOrientation)
  }

  const getOrientationLabel = (score: number) => {
    if (score < 20) return "Far Left"
    if (score < 40) return "Left"
    if (score < 60) return "Center"
    if (score < 80) return "Right"
    return "Far Right"
  }

  const getOrientationColor = (score: number) => {
    if (score < 20) return "bg-red-500"
    if (score < 40) return "bg-orange-500"
    if (score < 60) return "bg-yellow-500"
    if (score < 80) return "bg-green-500"
    return "bg-blue-500"
  }

  const getOrientationTextColor = (score: number) => {
    if (score < 20) return "text-red-600"
    if (score < 40) return "text-orange-600"
    if (score < 60) return "text-yellow-600"
    if (score < 80) return "text-green-600"
    return "text-blue-600"
  }

  const getProgressWidth = (score: number) => {
    return `w-[${score}%]`
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
      <header className='absolute top-0 right-0 p-3 lg:hidden z-50'>
        <HistoryDialog />
      </header>
      <aside className='z-[0] flex-col hidden lg:flex w-[250px] bg-muted/15 pt-16 gap-2 h-full fixed bottom-0'>
        <ScrollArea>

          <div className='flex flex-col gap-2 flex-1 m-2 mt-0 bg-muted rounded-lg p-4'>
            <h2 className='font-medium tracking-tight'>Recents</h2>
            <div className='flex flex-col gap-1'>
              <History />
            </div>
          </div>
        </ScrollArea>
      </aside>
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

            {mutation.result&&mutation && (
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
                  {politicalOrientation && (
                    <TabsContent value="analysis" className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fact Check</AlertTitle>
                      <AlertDescription>
                        Analysis of factual claims will appear here after processing.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Political Orientation Analysis</h3>
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Political Bias</h3>
          <span className={getOrientationTextColor(politicalOrientation.score)}>
            {getOrientationLabel(politicalOrientation.score)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-gray-200">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getOrientationColor(politicalOrientation.score)}`} 
              style={{ width: `${politicalOrientation.score}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Far Left</span>
            <span>Center</span>
            <span>Far Right</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm leading-relaxed">
          {politicalOrientation.explanation}
        </p>
      </div>
    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Bias Analysis</AlertTitle>
                      <AlertDescription>
                        Analysis of potential biases will appear here after processing.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
              )}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
function TranscriptDialog({
  transcript,
  onClose,
}: {
  transcript: string | undefined;
  onClose: () => void;
}) {
  const prev = useRef(transcript);
  useEffect(() => {
    if (transcript) prev.current = transcript;
  });
  return (
    <Dialog open={Boolean(transcript)} onOpenChange={(n) => !n && onClose()}>
      <DialogContent className='max-h-[80dvh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Transcript</DialogTitle>
        </DialogHeader>
        <div className='whitespace-pre-wrap font-mono text-sm overflow-y-auto flex-1'>
          {transcript ?? prev.current}
        </div>
        <div className='flex justify-end mt-4 gap-2'>
          <Button
            variant='outline'
            onClick={async () => {
              if (!transcript) return;
              await navigator.clipboard.writeText(transcript);
              toast({
                title: "Copied to clipboard",
                description: "Go feed that thing to your LLM.",
              });
            }}
            className='gap-2'
          >
            <Copy className='h-4 w-4' />
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function HistoryDialog() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>History</Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='overflow-y-auto max-h-[80dvh] gap-2 flex flex-col origin-top-right'
      >
        <History />
      </PopoverContent>
    </Popover>
  );
}
function History() {
  const history = useTranscriptionHistory();
  return (
    <AnimatePresence>
      {history.videos.length === 0
        ? null
        : history.videos
          .slice()
          .reverse()
          .map((video) => {
            if (!video.imgUrl) return null;
            if (!video.title) return null;
            if (!video.id) return null;
            return <HistoryItem {...video} key={video.id} />;
          })}
    </AnimatePresence>
  );
}
function HistoryItem({
  id,
  title,
  imgUrl,
}: {
  id: string;
  title: string;
  imgUrl: string;
}) {
  const mutation = useMutation();
  return (
    <>
      <motion.div
        onClick={() =>
          mutation.execute(`https://www.youtube.com/watch?v=${id}`, true, true)
        }
        className={clsx(
          "p-2 rounded-lg bg-muted flex flex-col gap-3 cursor-pointer border-slate-400 shadow-sm",
          mutation.loading && "opacity-50"
        )}
        layoutId={id}
      >
        <Image
          width={1200}
          height={700}
          style={{
            width: "100%",
            aspectRatio: 1200 / 700,
          }}
          src={imgUrl}
          className='rounded-md overflow-clip'
          alt={title}
          unoptimized
        />
        <div className='text-sm font-medium text-ellipsis line-clamp-2'>
          {title}
        </div>
      </motion.div>
      <TranscriptDialog
        transcript={mutation.result}
        onClose={() => {
          mutation.reset();
        }}
      />
    </>
  );
}