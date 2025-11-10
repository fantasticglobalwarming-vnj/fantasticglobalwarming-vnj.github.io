import { MQEngine } from "/src/mqengine.ts";

const wany = (window as any);

let mqengine = wany.mqengine = new MQEngine();

fetch("./quiz.xml").then(async (response) => {
    let r = await response.text();
    mqengine.load(r);
    mqengine.parse();
});