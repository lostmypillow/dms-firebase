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
    let eyed;
    snapshot.forEach((doc) => {
      if (doc.id !== undefined) {
        eyed = doc.id;
      }
    });
    return eyed;
  }
};

const addData2Firestore = async (data) => {
  data["id"] = uuid();
  data["priority"] = data.category
    ? await getCountFromCategory(data.category)
    : 0;
  await getDocRef(data.id).set(data);
};
export const addlineurl = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    await addData2Firestore(
      await dmsScrape("link", req.body.events[0].message.text)
    );
    // send2LINE(data.id, req.body.events[0].replyToken);
    res.send("Document added");
  }
);

export const manualadd = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    await addData2Firestore(req.body);
    res.send("Document added");
  }
);
//{url: https://, html: `efnfkwnfkwnk`, id: 123}
export const addhtml = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    const data = await dmsScrape("html", req.body.url, req.body.html);

    const updateData = {
      ...data,
      error: FieldValue.delete(),
      html: FieldValue.delete(),
      priority: await getCountFromCategory(data.category),
    };
    console.log("updated data:");
    console.log(updateData);
    await getDocRef(req.body.id).update(updateData);

    res.send("Document ID " + req.body.id + " modified");
  }
);

//{id: eff}
export const update = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    if (req.query.edit == "data") {
      let originalData = req.body;
      const originalCategory = (await getDocRef(req.query.id).get()).data()
        .category;
      console.log("original category:" + originalCategory);
      const originalPriority = (await getDocRef(req.query.id).get()).data()
        .priority;
      console.log("original priority:" + originalPriority);

      if (originalCategory != req.body.category) {
        originalData["priority"] = await getCountFromCategory(
          req.body.category
        );
        const snapshot = await getColRef()
          .where("category", "==", originalCategory)
          .where("priority", ">", originalPriority)
          .get();
        if (snapshot.empty) {
          console.log("No matching documents.");
        } else {
          let arr = [];
          snapshot.forEach((doc) => {
            arr.push(doc.data());
          });
          for (const doc of arr) {
            await getDocRef(doc.id).update({
              priority: FieldValue.increment(-1),
            });
          }
        }
      }
      await getDocRef(req.query.id).update(originalData);
    } else if (req.query.edit == "priority") {
      await getDocRef(
        await getTargetID(req.body.sourceCategory, req.body.targetPriority)
      ).update({
        priority: req.body.sourcePriority,
      });
      await getDocRef(req.body.sourceID).update({
        priority: req.body.targetPriority,
      });
    } else if (req.query.edit == "select") {
      await getDocRef(req.query.id).update({
        selected_content: "",
      });
    } else if (req.query.edit == "unselect") {
      await getDocRef(req.query.id).update({
        selected_content: FieldValue.delete(),
      });
    }

    res.send("Document ID " + req.query.id + " modified " + req.query.edit);
  }
);

export const deleteDoc = onRequest(
  { cors: true, region: "asia-east1" },
  async (req, res) => {
    await getDocRef(req.query.id).delete();
    res.send("Document ID " + req.query.id + " deleted");
  }
);
// {"sourceID": , "sourceCategory": , "sourcePriority": , "targetPriority": }
// export const priority = onRequest(
//   { cors: true, region: "asia-east1" },
//   async (req, res) => {

//     res.send("Document ID " + req.body.sourceID + " modified");
//   }
// );
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
