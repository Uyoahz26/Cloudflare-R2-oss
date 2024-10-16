import { get_auth_status } from "@/utils/auth";

export const AccountMapping = {
  admin: "2496091142",
  uyoahz: "2496091142",
  tina: "1478367130",
  zhaoyuxuan: "1812028206",
  zhaotengye: "3072969190",
  zhangruili: "3099215275",
};

export async function onRequestPost(context) {
  const resqBody = await context.request.json();
  console.log("resqBody: ", resqBody);
  let loginChar = "";
  const LoginFail = new Response(
    JSON.stringify({
      flag: false,
      message: "账号或密码错误！！",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  try {
    loginChar = decodeURIComponent(atob(resqBody.userLoginChar));
  } catch {
    return LoginFail;
  }
  if (!get_auth_status(loginChar, true)) {
    return LoginFail;
  }

  const accountKey = loginChar.slice(0, loginChar.indexOf(":")).toLowerCase();
  const QQID = AccountMapping[accountKey];
  context.env = {
    "admin:admin": "*",
  };
  return new Response(
    JSON.stringify({
      flag: true,
      userInfo: {
        QQ: QQID,
        UUID: resqBody.userLoginChar,
        allowFolder: context.env[loginChar].split(","),
      },
      message: "登录成功",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
