import * as https from "https";
const TOKEN =
  "sPG4KE13zYqCaelVJCXHqOpB1jt+N49pmFgpukjxT6E/Wg5V/1+goJ+dHUiu8r0molbYThpO3CxXTvjJgAcHlsdsGOv8iAujjvZ80n7MBrPUAm1kBpMpsR5sxX4bWqg5sgL37TRl0hMOv0ho7PsQEQdB04t89/1O/w1cDnyilFU=";
export const send2LINE = (eyed, replyToken) => {
    const dataString = JSON.stringify({
      replyToken: replyToken,
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