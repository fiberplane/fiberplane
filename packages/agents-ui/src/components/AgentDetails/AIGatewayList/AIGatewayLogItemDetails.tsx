import { type LogGetResponse, stringToJSONSchema } from "@/types";
import { useMemo, useState } from "react";
import {
  FpTabs,
  FpTabsContent,
  FpTabsList,
  FpTabsTrigger,
} from "../../ui/tabs";
import { JSONViewer } from "../EventsView/JSONViewer";

export function AIGatewayLogItemDetails(props: LogGetResponse) {
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
      <FpTabsContent value="request" className="p-2">
        <JSONViewer data={requestHead} label="Request" className="border-0" />
      </FpTabsContent>
      <FpTabsContent value="response" className="p-2">
        <JSONViewer data={responseHead} label="Response" className="border-0" />
      </FpTabsContent>
    </FpTabs>
  );
}
