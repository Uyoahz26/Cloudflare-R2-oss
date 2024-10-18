import { onRequestGet as BucketGet } from "./api/buckets";
import { onRequestGet as childrenGet } from "./api/children/[[path]]";
import { onRequestPost as LoginPost } from "./api/login";
import {
  onRequestDelete,
  onRequestPut,
  onRequestPost as WriteItemPost,
} from "./api/write/items/[[path]]";
import { onRequest } from "./api/write/s3/[[path]]";
import { onRequestGet as RawGet } from "./raw/[[path]]";

addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const reqMethod = request.method;
  if (url.pathname.startsWith("/api/children")) {
    event.respondWith(onRequest(request));
    return;
  }
  const noResult = new Response("Not Found", { status: 404 });
  if (reqMethod === "GET") {
    if (url.pathname.startsWith("/api/write/s3")) {
      event.respondWith(childrenGet(request));
    } else if (url.pathname.startsWith("/api/buckets")) {
      event.respondWith(BucketGet(request));
    } else if (url.pathname.startsWith("/raw")) {
      event.respondWith(RawGet(request));
    } else {
      event.respondWith(noResult);
    }
  } else if (reqMethod === "POST") {
    if (url.pathname.startsWith("/api/login")) {
      event.respondWith(LoginPost(request));
    } else if (url.pathname.startsWith("/api/write/items")) {
      event.respondWith(WriteItemPost(request));
    } else {
      event.respondWith(noResult);
    }
  } else if (reqMethod === "PUT") {
    event.respondWith(onRequestPut(request));
  } else if (reqMethod === "DELETE") {
    event.respondWith(onRequestDelete(request));
  } else {
    event.respondWith(noResult);
  }
});
