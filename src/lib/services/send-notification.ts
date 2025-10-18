import { scSend } from "serverchan-sdk";

export const sendNotification = async (title: string, desp: string) => {
  const sendkey = "SCT296379T1nEubWuyuFJ7YyWKZWAtbtbq";
  await scSend(sendkey, title, desp, { tags: "服务器报警|报告" });
};
