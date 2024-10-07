/* eslint-disable */
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { dmsScrape } from "dms-scrape";
import { send2LINE } from "./send2Line.mjs";
import { getUTCDate } from "./getUTCDate.mjs";
import { v4 as uuid } from "uuid";
initializeApp();
const db = getFirestore();
const getColRef = () => db.collection(`${getUTCDate()}`);
const getDocRef = (id) => getColRef().doc(id);
const getCountFromCategory = async (category) => {
  const q = getColRef().where("category", "==", category);
  const snapshot = await q.count().get();
  return snapshot.data().count + 1;
};
const getTargetID = async (category, priority) => {
  const snapshot = await getColRef()
    .where("category", "==", category)
    .where("priority", "==", priority)
    .get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  } else {
    let eyed
    snapshot.forEach(doc => {
      if (doc.id !== undefined) {
        eyed = doc.id
      };
     
    }) 
    return eyed
    // return snapshot[0].id;
  }
};
export const addlineurl = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const data = await dmsScrape("link", req.body.events[0].message.text);
    console.log(data)
    data["id"] = uuid();
    data["priority"] = data.category ? await getCountFromCategory(data.category) : 0
    await getDocRef(data.id).set(data);
    // send2LINE(data.id, req.body.events[0].replyToken);
    res.send("Document ID " + data.id + " added");
  }
);

//{url: https://, html: `efnfkwnfkwnk`, id: 123}
export const addexthtml = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const data = await dmsScrape("html", req.body.url, req.body.html);

    const updateData = {
      ...data,
      error: FieldValue.delete(),
      html: FieldValue.delete(),
      priority: await getCountFromCategory(data.category),
    };
    console.log("updated data:")
console.log(updateData)
    await getDocRef(req.body.id).update(updateData);

    res.send("Document ID " + req.body.id + " modified");
  }
);

//{id: eff}
export const update = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    await getDocRef(req.body.id).update(req.body);
  }
);
// {"sourceID": , "sourceCategory": , "sourcePriority": , "targetPriority": }
export const priority = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    // console.log(req.body)
    // console.log(
      
    // );
    await getDocRef(
    await getTargetID(req.body.sourceCategory, req.body.targetPriority)
    ).update({
      priority: req.body.sourcePriority,
    });
    await getDocRef(req.body.sourceID).update({
      priority: req.body.targetPriority,
    });
  }
);
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
