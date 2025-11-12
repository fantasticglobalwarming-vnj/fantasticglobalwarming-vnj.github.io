import { MQEngine, Messages, QPairs } from "../../src/mqengine.ts";

const wany = (window as any);

const quizBox = document.getElementById("QuizBox");

let mqengine = wany.mqengine = new MQEngine();
let slides : DocumentFragment[] = wany.slides = [];

fetch("./quiz.xml").then(async (response) => {
    let r = await response.text();
    mqengine.load(r);
    mqengine.parse();

    for(const i of mqengine) {
        const nBoxFrag = new DocumentFragment();
        const nBox = document.createElement("div");

        if(i instanceof Messages) { // Is Message?
            // Create the needed elements
            let title = document.createElement("h2");
            let message = document.createElement("p");

            // Style

            // Put the required content
            title.textContent = i.title;
            message.innerHTML = i.message; // Rich text

            // Append it
            nBox.appendChild(title);
            nBox.appendChild(message);
        }
        else if(i instanceof QPairs) {
            nBox.classList.add("quiz"); // Make it a quiz

            // Make the question
            let question = document.createElement("p");
            question.innerHTML = i.question; // Rich text
            nBox.appendChild(question);

            // Make the answers
        }

        // Put it all together
        nBoxFrag.appendChild(nBox);
        slides.push(nBoxFrag);
    }
});