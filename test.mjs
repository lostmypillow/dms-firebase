import axios from "axios";

const links = [
    "https://www.cna.com.tw/news/afe/202410170312.aspx",
    "https://mashdigi.com/intel-joins-hands-with-oems-such-as-asus-and-acer-to-announce-the-launch-of-the-core-ultra-200s-desktop-processor-code-named-arrow-lake/",
    "https://www.eprice.com.tw/mobile/talk/4523/5812964/1/",
    "https://www.eprice.com.tw/mobile/talk/102/5812965/1/",
    "https://www.eprice.com.tw/mobile/talk/4523/5812963/1/",
    "https://www.chinatimes.com/realtimenews/20241018001848-260410?chdtv",
    "https://www.chinatimes.com/realtimenews/20241018001812-260410?chdtv",
"https://ec.ltn.com.tw/article/breakingnews/4834328",
"https://www.cool3c.com/article/226987",
"https://www.ettoday.net/news/20241018/2837334.htm",
"https://technews.tw/2024/10/18/6g-speed/",
"https://3c.ltn.com.tw/news/59840",
"https://www.xfastest.com/thread-293363-1-1.html",
"https://www.xfastest.com/thread-293362-1-1.html"
  
];

for (const url of links) {
  await axios.post("http://127.0.0.1:5001/compassprdms/asia-east1/addlineurl", {
    events: [
      {
        message: {
          text: url,
        },
      },
    ],
  });
  setTimeout(function() {
    console.log("waiting 3 seconds...");
  }, 3000);
}
