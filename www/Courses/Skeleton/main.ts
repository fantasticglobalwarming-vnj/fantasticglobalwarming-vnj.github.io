import { MQEngine, Messages, QPairs } from "../../src/mqengine.ts";

const wany = (window as any);

const quizBox = wany.quizBox = document.getElementById("QuizBox");

let mqengine = wany.mqengine = new MQEngine();
let slides : DocumentFragment[] = wany.slides = [];
let currentSlide : number = 0;

const SLPOS_ATTR = "slide-pos";


function createQuestion(nBox : HTMLDivElement, i : QPairs, nextBtn : HTMLButtonElement) {
    nBox.classList.add("quiz"); // Make it a quiz

    // Make the question
    let question = document.createElement("p");
    question.innerHTML = i.question; // Rich text
    nBox.appendChild(question);

    // Make the answers
    for(const choices of i.answers) {
        // Create the choice
        let btn = document.createElement("button");
        btn.textContent = choices;

        // Now to do the onclick
        {
            function Yipee() {
                nBox.appendChild(nextBtn);
            }

            function Boo() {
                window.alert("loser");
            }

            if(i.answerMap[choices]) { btn.onclick = Yipee; }
            else { btn.onclick = Boo; }
        }


        // Append the choice
        nBox.appendChild(btn);
    }
}

function createQuiz(mqe : MQEngine) {
    for(const [index, i] of mqe) {
        const nBoxFrag = new DocumentFragment();
        const nBox = document.createElement("div");

        nBox.setAttribute(SLPOS_ATTR, index);

        const nextBtn = document.createElement("button");
        { // Do the next button
            nextBtn.onclick = () => {
                currentSlide += 1;
                changeSlide(slides, currentSlide);
            }
            nextBtn.textContent = "Next →";
        }

        if(i instanceof Messages) { // Is Message?
            // Create the needed elements
            let title = document.createElement("h2");
            let message = document.createElement("p");

            // Style
            { /* None */ }

            // Put the required content
            title.textContent = i.title;
            message.innerHTML = i.message; // Rich text

            // Append it
            nBox.appendChild(title);
            nBox.appendChild(message);
            nBox.appendChild(nextBtn);
        }
        else if(i instanceof QPairs) {
            createQuestion(nBox, i, nextBtn);
        }

        // Put it all together
        nBoxFrag.appendChild(nBox);
        slides.push(nBoxFrag);
    }
}


function changeSlide(slds : DocumentFragment[], cslds : number) {
    if((quizBox?.innerHTML?.length ?? 0) > 0) { // Append it back!
        const e = quizBox?.querySelector("div");
        let pos : number = Number(e?.getAttribute(SLPOS_ATTR));
        slides[pos].appendChild(e as Node);
    }

    let frags : DocumentFragment = new DocumentFragment();
    {
        if(cslds >= slides.length) { // Error message
            const frag = new DocumentFragment();

            const p = document.createElement("p");
            p.textContent = "Too far! (Internal Error)";
            frag.appendChild(p);
            
            frags = frag;
        }
        else { // Normal!
            frags = slds[cslds];
        }
    }

    quizBox?.appendChild(frags);
}
wany.chSlide = changeSlide;

function loadQuiz(quizxml : string) {
    fetch(quizxml).then(async (response) => {
        slides.splice(0, slides.length);

        let r = await response.text();
        mqengine.load(r);
        mqengine.parse();

        createQuiz(mqengine);

        changeSlide(slides, currentSlide);
    });
}

loadQuiz("./quizes/quiz2.xml");
