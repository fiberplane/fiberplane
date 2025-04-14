import {
  useAIGatewayLogDetail,
  useAIGatewayLogs,
  useListAIGateway,
  useTimeAgo,
} from "@/hooks";
import {
  type AIGatewayListResponse,
  type LogGetResponse,
  type LogListResponse,
  stringToJSONSchema,
} from "@/types";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { StatusCode } from "../StatusCode";
import { Button } from "../ui/button";
import { FpTabs, FpTabsContent, FpTabsList, FpTabsTrigger } from "../ui/tabs";
import RequestTimingVisualizer from "./Duration";
import { JSONViewer } from "./EventsView/JSONViewer";
// import { CaretRightIcon } from "@radix-ui/react-icons";

type Props = {
  namespace: string;
  instance: string;
};

export function AIGatewayList(props: Props) {
  const { namespace, instance } = props;
  const {
    data: aiGateways,
    error,
    isLoading,
  } = useListAIGateway(namespace, instance);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!aiGateways) {
    return <div>No AI gateways found</div>;
  }
  return (
    <div className="flex flex-col gap-2 p-4 pl-2 pr-5">
      <p className="text-gray-400 text-sm pl-5">
        {aiGateways.length} AI gateways found
      </p>
      <div className="text-gray-400 text-left text-sm flex flex-col gap-4">
        <ol className="flex flex-col gap-2">
          {aiGateways.map((gateway) => (
            <li key={gateway.id} className="mt-2">
              <AIGatewayItem
                namespace={namespace}
                instance={instance}
                details={gateway}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AIGatewayItem(props: Props & { details: AIGatewayListResponse }) {
  const { namespace, instance, details } = props;

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Button
        size="default"
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-3.5" />
        ) : (
          <ChevronRight className="w-3.5" />
        )}
        {details.id}
      </Button>
      {expanded && (
        <div className="mt-2 pl-5">
          <AIGatewayItemDetails
            namespace={namespace}
            instance={instance}
            gatewayId={details.id}
          />
        </div>
      )}
    </div>
  );
}

function AIGatewayItemDetails(props: Props & { gatewayId: string }) {
  const { namespace, instance, gatewayId } = props;

  const {
    data: logs,
    error,
    isLoading,
    isFetching,
  } = useAIGatewayLogs(namespace, instance, gatewayId, 1, 10);

  const durations = logs?.map((log) => log.duration) || [0];
  const maxDuration = Math.max(...durations);

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!logs) {
    return <div>No logs found</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-gray-400 text-left text-sm flex flex-col gap-4">
        <ol className="flex flex-col gap-2">
          {logs.map((log) => (
            <li key={log.id} className="mt-2">
              <AIGatewayLog {...props} log={log} maxDuration={maxDuration} />
            </li>
          ))}
        </ol>
        <p className="text-gray-400 text-sm">{logs.length} logs found</p>
      </div>
    </div>
  );
}

function AIGatewayLog(
  props: Props & {
    gatewayId: string;
    log: LogListResponse;
    maxDuration: number;
  },
) {
  const { log, gatewayId, namespace, instance, maxDuration } = props;

  const {
    data: logDetails,
    error,
    isLoading,
    isFetching,
  } = useAIGatewayLogDetail(namespace, instance, gatewayId, log.id);

  const timeStamp = useTimeAgo(log.created_at);
  const [expanded, setExpanded] = useState(false);
  console.log("logDetails", logDetails);
  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!logDetails) {
    return <div>No log details found</div>;
  }

  // if (expanded) {
  //   console.log('log', log);
  // }
  const statusCode = log.status_code;
  return (
    <div key={log.id} className="mt-2">
      <div
        className="grid grid-cols-[auto_auto_auto_auto_1fr_1fr] gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <div className="font-mono" title={log.created_at}>
          {timeStamp}
        </div>
        <div>
          {log.provider}/{log.model}
        </div>
        {/* <div>{log.model_type}</div> */}
        <RequestTimingVisualizer maxTotal={maxDuration} timings={log.timings} />
        <div className="text-gray-400 text-sm flex flex-col gap-1">
          <div className="flex">
            {log.tokens_in} <ArrowUp className="w-3" />
          </div>
          <div className="flex">
            {log.tokens_out} <ArrowDown className="w-3" />
          </div>
        </div>
        <div>
          {statusCode && <StatusCode status={statusCode} isFailure={false} />}
        </div>
      </div>
      {expanded && (
        <LogDetails {...logDetails} />
        // <JSONViewer
        //   data={logDetails}
        //   label="Log Details"
        //   className="mt-2"
        // />
      )}
      {/* <JSONViewer data={log} />
      <JSONViewer data={logDetails} /> */}
    </div>
  );
}

function LogDetails(props: LogGetResponse) {
  const [tab, setTab] = useState("request");

  const requestHead = useMemo(() => {
    const result = stringToJSONSchema.safeParse(props.request_head);
    if (result.success) {
      return result.data;
    }
    return props.request_head;
  }, [props.request_head]);
  const responseHead = useMemo(() => {
    const result = stringToJSONSchema.safeParse(props.response_head);
    if (result.success) {
      return result.data;
    }
    return props.response_head;
  }, [props.response_head]);

  return (
    <FpTabs value={tab} onValueChange={setTab}>
      <FpTabsList>
        <FpTabsTrigger value="request">Request</FpTabsTrigger>
        <FpTabsTrigger value="response">Response</FpTabsTrigger>
      </FpTabsList>
      <FpTabsContent value="request">
        <JSONViewer data={requestHead} label="Request" />
      </FpTabsContent>
      <FpTabsContent value="response">
        <JSONViewer data={responseHead} label="Response" />
      </FpTabsContent>
    </FpTabs>
  );
}
