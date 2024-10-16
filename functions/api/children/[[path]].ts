import { notFound, parseBucketPath } from "@/utils/bucket";
import { AccountMapping } from "../login";

export async function onRequestGet(context) {
  try {
    const [bucket, path] = parseBucketPath(context);
    const prefix = path && `${path}/`;
    if (!bucket || prefix.startsWith("_$flaredrive$/")) return notFound();

    const objList = await bucket.list({
      prefix,
      delimiter: "/",
      include: ["httpMetadata", "customMetadata"],
    });
    const objKeys = objList.objects
      .filter((obj) => !obj.key.endsWith("/_$folder$"))
      .map((obj) => {
        const { key, size, uploaded, httpMetadata, customMetadata } = obj;
        return { key, size, uploaded, httpMetadata, customMetadata };
      });

    let folders = objList.delimitedPrefixes;
    if (!path) {
      folders = folders.filter((folder) => folder !== "_$flaredrive$/");
    }

    folders.map((v) => ({
      path: v,
      qqID: AccountMapping[v.split("/")[0]],
    }));

    return new Response(
      JSON.stringify({ value: objKeys, folders, flag: true }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}
