import "https://deno.land/x/dotenv@v2.0.0/load.ts";

//import {createSerializeFetch} from "https://raw.githubusercontent.com/ayame113/ay_deno_utils/v1.0.1/scripts/serialized_fetch/mod.js";

function wordLengthCount(rome) {
  return (rome.match(
    /[AaIiUuEeOo]|n(?=[^aiueoāīūēō])|n(?=\-)|n$|m(?=\-)|m$|(.)\1/g,
  ) ?? [])
    .length +
    (rome.match(/[ĀāĪīŪūĒēŌō]/g) ?? []).length * 2;
}

const res = await (await fetch(
  `http://api-tokyochallenge.odpt.org/api/v4/odpt:Railway?acl%3AconsumerKey=${
    Deno.env.get("odpt_tokyochallenge_token")
  }`,
)).json();

const kanjiToFurigana = res.reduce((res, l) => (
  l["odpt:stationOrder"].forEach((s) =>
    s["odpt:stationTitle"]["ja-Hrkt"] &&
    (res[s["odpt:stationTitle"].ja] = s["odpt:stationTitle"]["ja-Hrkt"])
  ), res
), {});

const railways = res.map((l) => ({
  railway: l["odpt:railwayTitle"].ja,
  stations: l["odpt:stationOrder"].map((s) => s["odpt:stationTitle"].ja),
  stationsEn: l["odpt:stationOrder"].map((s) =>
    s["odpt:stationTitle"]["ja-Hrkt"] ||
    kanjiToFurigana[s["odpt:stationTitle"].ja] || s["odpt:stationTitle"].en
  ),
  stationNameLengthList: l["odpt:stationOrder"].map((s) =>
    (s["odpt:stationTitle"]["ja-Hrkt"] ||
      kanjiToFurigana[s["odpt:stationTitle"].ja])?.match?.(/[^ゃゅょ]/g).length ||
    wordLengthCount(s["odpt:stationTitle"].en)
  ),
})).filter((l) => l.stations.length);

for (const { stationsEn, stations, stationNameLengthList } of railways) {
  let count = 0;
  const ruisekiwa = new Map();
  for (const [i, stationNameLength] of stationNameLengthList.entries()) {
    count += stationNameLength;
    ruisekiwa.set(count, i);
  }
  for (const [sum, i] of ruisekiwa) {
    if (
      ruisekiwa.has(sum + 5) && ruisekiwa.has(sum + 5 + 7) &&
      ruisekiwa.has(sum + 5 + 7 + 5)
    ) {
      const res = [];
      for (let ii = i + 1; ii < ruisekiwa.get(sum + 5 + 7 + 5) + 1; ii++) {
        res.push([stations[ii], stationsEn[ii], stationNameLengthList[ii]]);
      }
      console.log(res);
    }
  }
}
