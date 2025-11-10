import { MQEngine } from "../../src/mqengine.ts";

const wany = (window as any);

const quizBox = document.getElementById("QuizBox");

let mqengine = wany.mqengine = new MQEngine();

fetch("./quiz.xml").then(async (response) => {
    let r = await response.text();
    mqengine.load(r);
    mqengine.parse();

    for(const i of mqengine) {
        const nBoxFrag = new DocumentFragment();
        const nBox = nBoxFrag.;
    }
});