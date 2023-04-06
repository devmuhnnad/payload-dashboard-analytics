import { Endpoint } from "payload/config";
import handler from "./handler";
import { ApiProvider } from "../../providers";

const getGlobalAggregateData = (provider: ApiProvider): Endpoint => {
  return {
    path: "/analytics/globalAggregateData",
    method: "post",
    handler: handler(provider),
  };
};

export default getGlobalAggregateData;
