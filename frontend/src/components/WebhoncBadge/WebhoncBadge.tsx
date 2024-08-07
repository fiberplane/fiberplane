import { Badge } from "../ui/badge";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@radix-ui/react-hover-card";
import { Button } from "../ui/button";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { cn } from "@/utils";
import { useWebhoncConnectionId } from "./queries";

export function WebhoncBadge() {

  const [isCopied, setIsCopied] = useState(false);

  const { data: url, isPending } = useWebhoncConnectionId();

  // const url = "https://webhonc.mies.workers.dev/h/606139dc4314b6120d932a38b447e37538205cb3c1ba82a44776b1bf2cecdb72";

  const handleCopy = () => {
    // copy to clipboard
    navigator.clipboard.writeText(url!);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <HoverCard>
      <HoverCardTrigger><Badge className="rounded-xl bg-green-950/60 hover:bg-green-900/60 text-green-400 flex items-center text-sm gap-2">
        <span className="text-xs">●</span>Proxy active
      </Badge></HoverCardTrigger>
      <HoverCardContent side="bottom" align="end" sideOffset={5} className="rounded-xl border bg-background z-10">
        <div className="rounded-xl bg-muted/40">
          <div className="grid gap-4 p-4">
            <div className="font-normal text-sm w-[400px] flex flex-col gap-2">
              <p className="text-wrap">
                <span className="font-semibold">Proxy URL:</span> any request received at this URL will be forwarded to the FPX and your API.</p>
              {isPending && url === undefined ?
                <div className="flex gap-2 items-center">
                  <div className="p-2 bg-background/5 border rounded overflow-scroll text-nowrap">Loading...</div>
                </div>
                :
                <div className="flex gap-2 items-center">
                  <div className="p-2 bg-background/5 border rounded overflow-scroll text-nowrap">{url}</div>
                  <Button className={cn(
                    "bg-muted",
                    { "bg-green-800 hover:bg-green-800": isCopied },
                    "text-white",
                    "transition-all animate-in"
                  )}
                    onClick={handleCopy}
                    variant="outline">
                    {isCopied ?
                      <CheckIcon className="w-4 h-4" /> :
                      <CopyIcon className="w-4 h-4" />
                    }
                  </Button>
                </div>}
            </div>
          </div></div>
      </HoverCardContent>
    </HoverCard>)

}
