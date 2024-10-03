/* eslint-disable */
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { dmsScrape } from "dms-scrape";
import * as https from "https";
import { v4 as uuid } from "uuid";
initializeApp();
const TOKEN =
  "sPG4KE13zYqCaelVJCXHqOpB1jt+N49pmFgpukjxT6E/Wg5V/1+goJ+dHUiu8r0molbYThpO3CxXTvjJgAcHlsdsGOv8iAujjvZ80n7MBrPUAm1kBpMpsR5sxX4bWqg5sgL37TRl0hMOv0ho7PsQEQdB04t89/1O/w1cDnyilFU=";
const db = getFirestore();
// const newDate = new Date();
// const currentYear = newDate.getFullYear().toString();
// const currentDate =
//   String(newDate.getMonth() + 1).padStart(2, "0") +
//   String(newDate.getDate()).padStart(2, "0");
const collectionRef = db.collection(`news`);
const send2LINE = (eyed) => {
  const dataString = JSON.stringify({
    replyToken: req.body.events[0].replyToken,
    messages: [
      {
        type: "text",
        text: "Document ID " + eyed + " added",
      },
    ],
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  };

  const webhookOptions = {
    hostname: "api.line.me",
    path: "/v2/bot/message/reply",
    method: "POST",
    headers: headers,
    body: dataString,
  };
  const request = https.request(webhookOptions, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  request.on("error", (err) => {
    console.error(err);
  });

  request.write(dataString);
  request.end();
};
//
export const addlineurl = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const link = req.body.events[0].message.text;
    const data = await dmsScrape("link", link);
    data["id"] = uuid();
    await collectionRef.doc(data.id).set(data);
    // send2LINE(data.id);
    res.send("Document ID " + data.id + " added");
  }
);

// {data: {title: "fef"}}
export const addextdata = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const data = req.body.data;
    await collectionRef.doc(data.id).set(data);
    res.send("Document ID " + data.id + " added");
  }
);

// {url: https://ccc.com}
export const addexturl = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const url = req.body.url;
    const data = await dmsScrape("link", url);
        data["id"] = uuid();
    await collectionRef.doc(data.id).set(data);
    res.send("Document ID " + data.id + " added");
  }
);

//{url: https://, html: `efnfkwnfkwnk`}
export const addexthtml = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const html = req.body.html;
    const url = req.body.url;
    const originalDocSnap = await collectionRef.where("url", "==", url).get();
    let origDocSnapArr = [];
    if (originalDocSnap.empty) {
      console.log("No matching documents.");
      return;
    } else {
      originalDocSnap.forEach((doc) => {
        origDocSnapArr.push(doc.data());
      });
    }
    const data = await dmsScrape("html", url, html);
    await collectionRef.doc(origDocSnapArr[0].id).update(data);
    res.send("Document ID " + data.id + " added");
  }
);
