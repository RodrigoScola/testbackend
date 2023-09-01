import { MyStorage } from "./Storage";
import { User } from "./User";
import { MessageInfo, NewMessageInfo } from "./types";

export class MessageProcessor {
  public static AddUsernamesToMessages(
    messages: NewMessageInfo[]
  ): MessageInfo[] {
    return messages.map((message) => {
      return {
        ...message,
        user_name: User.userNameFromEmail(message.email),
      };
    });
  }
  public static async uploadMessages(
    messages: MessageInfo[],
    bucket: MyStorage
  ) {
    messages.forEach((message) => {
      bucket.upload(
        "messages/message_" + message.id + ".json",
        JSON.stringify(message)
      );
    });
  }
  public static async FetchMessagesFromURL(
    url: string
  ): Promise<MessageInfo[]> {
    try {
      const data = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (data.ok) {
        return await data.json();
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
