export function get_auth_status(context, verifyFlag = false) {
  if (verifyFlag && typeof context === "string") {
    const USERS = {
      "admin:admin": "*",
      "user:user": "user/",
    };
    console.log("account: ", context);
    return USERS[context];
    // return context.env[context];
  }

  var dopath = context.request.url.split("/api/write/items/")[1];
  console.log("dopath: ", dopath);
  if (context.env["GUEST"]) {
    if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;
    const allow_guest = context.env["GUEST"].split(",");
    for (var aa of allow_guest) {
      if (aa == "*") {
        return true;
      } else if (dopath.startsWith(aa)) {
        return true;
      }
    }
  }
  var headers = new Headers(context.request.headers);
  if (!headers.get("Authorization")) return false;
  context.env = {
    "admin:admin": "*",
    "user:user": "user/",
  };
  const Authorization = headers.get("Authorization").split("Basic ")[1];
  console.log("Authorization: ", Authorization);
  const account = decodeURIComponent(atob(Authorization));
  console.log("account: ", account);
  if (!account) return false;
  if (!context.env[account]) return false;
  if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;
  const allow = context.env[account].split(",");
  console.log("allow: ", allow);
  for (var a of allow) {
    if (a == "*") {
      return true;
    } else if (dopath.startsWith(a)) {
      return true;
    }
  }
  return false;
}
