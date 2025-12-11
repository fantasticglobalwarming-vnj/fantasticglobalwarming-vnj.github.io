import { MQEngine, Messages, QPairs } from "../../src/mqengine.ts";

const wany = (window as any);

const quizBox = wany.quizBox = document.getElementById("QuizBox");

let mqengine = wany.mqengine = new MQEngine();
let qaMap = wany.qaMap = new Map<Number, boolean>();
let qaCounter : Number = 0;

const qaMapIndexAttr = "qamap-index";
const qaSelAnswIndex = "qa-answindex";

function createQuestion(qpair : QPairs) : HTMLDivElement {
    const d = document.createElement("div");

    d.setAttribute(qaMapIndexAttr, `${qaCounter}`);

    let question = document.createElement("h2");
    question.innerHTML = qpair.question;



    let choices : HTMLButtonElement[] = [];
    for(const choice of qpair.answers) {
        const btn = document.createElement("button");
        btn.textContent = choice;

        { // Install click handler
            btn.onclick = function() {
                const div = d;
                const index = Number.parseInt(d.getAttribute(qaMapIndexAttr) ?? "0");

                const status = qpair.answerMap[choice];

                qaMap.set(index, status);
            }
        }

        choices.push(btn as HTMLButtonElement);
    }


    d.appendChild(question);
    for(const choice of choices) {
        d.appendChild(choice);
    }

    return d;
}

function createMessage(msg : Messages) : HTMLDivElement {
    const d = document.createElement("div");

    const title = document.createElement("h2");
    const msgp = document.createElement("p");

    title.textContent = msg.title;
    msgp.innerHTML = msg.message;

    d.appendChild(title);
    d.appendChild(msgp);

    return d;
}

function createQuiz(mqe : MQEngine) {
    for(const [_i, p] of mqe) {
        let child;

        if(p instanceof Messages) {
            child = createMessage(p);
        }
        else if(p instanceof QPairs) {
            child = createQuestion(p);
            qaMap.set(qaCounter, false);
            qaCounter += (1 as Number);
        }

        quizBox?.appendChild(child as Node);
    }
}

function loadQuiz(quizxml : string) {
    fetch(quizxml).then(async (response) => {
        let r = await response.text();
        mqengine.load(r);
        mqengine.parse();

        createQuiz(mqengine);
    });
}

loadQuiz("./quizes/quiz.xml");
