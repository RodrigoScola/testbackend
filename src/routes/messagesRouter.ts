import { Router } from "express";
import { MessageProcessor } from "../MessageProcessor";
import { S3Storage } from "../Storage";
import {
  BASE_MESSAGE_URL,
  MessagesDirectoryNames,
  StorageNames,
} from "../constants";

export const messagesRouter = Router();

messagesRouter.get("/startprocess", async (req, res) => {
  try {
    const fetchedMessages = await MessageProcessor.FetchMessagesFromURL(
      BASE_MESSAGE_URL
    );

    const bucket = new S3Storage(StorageNames.BACKEND_MESSAGES_BUCKET_NAME);

    // check if the messages are already in the bucket
    const totalMessages = await bucket.ListFiles(
      `/${MessagesDirectoryNames.BASE_MESSAGES_DIRECTORY}`
    );

    if (
      typeof totalMessages.Contents != "undefined" &&
      totalMessages?.Contents?.length <= 0
    ) {
      let promises: any[] = [];

      fetchedMessages.forEach((item) => {
        if (item.postId) {
          if (item) {
            promises.push(
              bucket.upload(
                JSON.stringify(item),
                `${MessagesDirectoryNames.BASE_MESSAGES_DIRECTORY}/message_` +
                  item.id +
                  ".json"
              )
            );
          }
        }
      });
      promises.push(
        bucket.upload(JSON.stringify(fetchedMessages), "base_messages.json")
      );
      await Promise.all(promises);
    }

    res.json({
      treatments: MessageProcessor.AddUsernamesToMessages(fetchedMessages),
    });
  } catch (e) {
    return res.json({
      error: "Could not add messages.",
    });
  }
});

messagesRouter.get("/groupedmessages", async (req, res) => {
  const bucket = new S3Storage(StorageNames.BACKEND_MESSAGES_BUCKET_NAME);

  const m = await bucket.getAll(
    MessagesDirectoryNames.BASE_MESSAGES_GROUPED_BY
  );

  // they will be in a csv format, in order to make excel files
  res.json({
    m,
  });
});
messagesRouter.get("/with_usernames", async (req, res) => {
  const bucket = new S3Storage(StorageNames.BACKEND_MESSAGES_BUCKET_NAME);

  const m = await bucket.getAll(
    MessagesDirectoryNames.BASE_MESSAGES_WITH_USERNAME
  );

  // they will be in a csv format, in order to make excel files
  res.json({
    m,
  });
});

messagesRouter.get("/messages/", async (req, res) => {
  const bucket = new S3Storage(StorageNames.BACKEND_MESSAGES_BUCKET_NAME);

  const m = await bucket.getAll<string[]>(
    MessagesDirectoryNames.BASE_MESSAGES_DIRECTORY
  );

  const jsonmessages = m?.map((s) => {
    if (s.length <= 0) {
      return {};
    }
    return JSON.parse(s);
  });
  res.json({
    jsonmessages,
  });
});
