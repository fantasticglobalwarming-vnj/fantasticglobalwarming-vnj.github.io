export interface QPairs {
    question : string;
    answers : string[];
    correctAnswers : string[];
};

export class MQEngine {
    #parser : DOMParser;
    
    #configDOM : Document | undefined;
    #questionaires : QPairs[];

    constructor() {
        this.#parser = new DOMParser();
        this.#configDOM = undefined;
        this.#questionaires = [];
    }

    load(source : string) {
        let dom = this.#parser.parseFromString(source, "application/xml");
        if(dom.querySelector("parsererror")) throw new TypeError("Not a valid MQEngine configuration!");

        this.#configDOM = dom;
    }

    parse() {
        let questions : HTMLCollectionOf<Element> | undefined = this.#configDOM?.getElementsByTagName("question");

        if(questions) {
            for(const question of questions) {
                let qprompt = question.getAttribute("question") ?? "";

                let Answers : string[] = [];
                { // Fetch all answers
                    let eAnswers = question.getElementsByTagName("answer");

                    if(eAnswers.length < 1) throw new TypeError("No answers were provided!!!");

                    for(const answer of eAnswers) {
                        Answers.push(answer.textContent);
                    }
                }

                let cAnswers : string[] = [];
                { // Fetch correct answers
                    let eAnswers = question.getElementsByTagName("correct-answer");
                    
                    if(eAnswers.length < 1) throw new TypeError("No correct answers were provided!!!");

                    for(const answer of eAnswers) {
                        cAnswers.push(answer.textContent);
                    }
                }

                let qpair : QPairs = {
                    question: qprompt,
                    answers: Answers,
                    correctAnswers: cAnswers
                };
                this.#questionaires.push(qpair);
            }
        }
    }

    [Symbol.iterator]() : Iterable<QPairs> | null {
        // TODO: Implmenet the iterable protocol
        return null;
    }
}