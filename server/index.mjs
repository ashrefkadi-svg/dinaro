import {resolve} from "node:path";
import {startLocalApi} from "./api.mjs";

const dbPath=resolve(process.env.DINARO_LOCAL_DB??".local-data/dinaro.sqlite");
const port=Number(process.env.DINARO_API_PORT??8787);
if(!Number.isSafeInteger(port)||port<1||port>65535)throw new Error("Invalid DINARO_API_PORT");
const api=await startLocalApi({dbPath,port});
console.log("DINARO local-only API listening on http://127.0.0.1:"+api.port);
console.log("Manual local records only. Do not expose this API publicly or use production financial data.");
