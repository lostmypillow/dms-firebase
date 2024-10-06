/* eslint-disable */
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { dmsScrape } from "dms-scrape";
import * as https from "https";
import { v4 as uuid } from "uuid";
initializeApp();
const TOKEN =
  "sPG4KE13zYqCaelVJCXHqOpB1jt+N49pmFgpukjxT6E/Wg5V/1+goJ+dHUiu8r0molbYThpO3CxXTvjJgAcHlsdsGOv8iAujjvZ80n7MBrPUAm1kBpMpsR5sxX4bWqg5sgL37TRl0hMOv0ho7PsQEQdB04t89/1O/w1cDnyilFU=";
const db = getFirestore();
const getUTCDate = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // YYYY-MM-DD format
};

const getColRef = () => db.collection(`${getUTCDate()}`);
const getDocRef = (id) => getColRef().doc(id);
const getCountFromCategory = async (category) => {
  const q = getColRef().where("category", "==", category);
  const snapshot = await q.count().get();
  return snapshot.data().count + 1;
};
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
    const data = await dmsScrape("link", req.body.events[0].message.text);
    data["id"] = uuid();
    console.log(data);
    data["priority"] = await getCountFromCategory(data.category);
    await getDocRef(data.id).set(data);
    // send2LINE(data.id);
    res.send("Document ID " + data.id + " added");
  }
);

//{url: https://, html: `efnfkwnfkwnk`, id: 123}
export const addexthtml = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const data = await dmsScrape("html", req.body.url, req.body.html);

    // Combine data for a single update
    const updateData = {
      ...data,  // Spread the scraped data
      error: FieldValue.delete(),
      html: FieldValue.delete(),
      priority: await getCountFromCategory(data.category),
    };
    
    // Perform a single update call
    await getDocRef(req.body.id).update(updateData);
    

    res.send("Document ID " + req.body.id + " modified");
  }
);

//{id: eff}
export const update = onRequest(
  async (req, res) => {
    await getDocRef(req.body.id).update(updateData)
  }
)
// {data: {title: "fef"}}
// export const addextdata = onRequest(
//   { cors: true, region: "asia-east1" },
//   async (req, res) => {
//     const data = req.body.data;
//     data["id"] = uuid();
//     await getDocRef(data.id).set(data);
//     res.send("Document ID " + data.id + " added");
//   }
// );

// {url: https://ccc.com}
// export const addexturl = onRequest(
//   { cors: true, region: "asia-east1" },
//   async (req, res) => {
//     const data = await dmsScrape("link", req.body.url);
//     data["id"] = uuid();
//     await getDocRef(data.id).set(data);
//     res.send("Document ID " + data.id + " added");
//   }
// );
