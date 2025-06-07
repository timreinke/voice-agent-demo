import { hc } from "hono/client";
import type { AppType } from "../../../server";

export const worker = hc<AppType>(window.location.origin);
