export interface Task {
    question: string,
    answer: string,
    providedAnswer: string | null
    totalTime: number
}

export const taskList: Task[] = [

    //The Great Barrier Reef is the world's largest coral reef system, composed of over 2900 individual reefs and 900 islands stretching for over 2300 kilometers.
    {
        question: "What is the approximate length of the Great Barrier Reef in kilometers?",
        answer: "2300",
        providedAnswer: null,
        totalTime: 0
    },

    /*
Classification:

Science -> Biology -> Physiology -> Cardiovascular System -> Heart Rate -> Hummingbird Heart Rate

Connections:

Science relates to Biology
Biology relates to Physiology
Physiology relates to Cardiovascular System
Cardiovascular System contains Heart Rate
Heart Rate has Hummingbird Heart Rate
     */

    //A hummingbird's heart can beat up to 1,200 times per minute.
    {
        question: "How many times can a hummingbird's heart beat in one minute?",
        answer: "1200",
        providedAnswer: null,
        totalTime: 0
    },

    //The platypus, a unique egg-laying mammal native to Australia, possesses a venomous spur on its hind legs.
    {
        question: "Which mammal has a venomous spur?",
        answer: "Platypus",
        providedAnswer: null,
        totalTime: 0
    },

    //snippet: The largest land mammal after the elephant is the white rhinoceros, a critically endangered species native to Africa.
    {
        question: "What is the second largest land mammal?",
        answer: "Rhinoceros",
        providedAnswer: null,
        totalTime: 0
    },

    //snippet: The Dunning-Kruger effect describes a cognitive bias wherein individuals with low ability at a task overestimate their competence.
    {
        question: "What cognitive bias involves overestimating one's abilities?",
        answer: "Dunning-Kruger",
        providedAnswer: null,
        totalTime: 0
    },
    //Quantum entanglement is a physical phenomenon where two particles become interconnected, regardless of distance, such that actions performed on one particle affect the other instantly.
    {
        question: "what is the phenomenon where particles are connected regardless of distance? ",
        answer: "Quantum entanglement",
        providedAnswer: null,
        totalTime: 0
    },
    //The Sapir-Whorf hypothesis suggests that the language we speak influences how we perceive and think about the world.
    {
        question: "Which hypothesis links language to perception?",
        answer: "Sapir-Whorf",
        providedAnswer: null,
        totalTime: 0
    },
    //The placebo effect is a phenomenon where a person experiences benefits from a fake treatment due to their belief in its efficacy.
    {
        question: "What is the term for benefits from a fake treatment due to belief?",
        answer: "Placebo effect",
        providedAnswer: null,
        totalTime: 0
    },
]