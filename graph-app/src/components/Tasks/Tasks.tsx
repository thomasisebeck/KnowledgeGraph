import React, {useState} from "react";
import {taskList, Task} from "./taskList";
import s from './tasks.module.scss'
import {HOST} from '../../../../shared/variables'


interface TasksProps {
    resetGraph: () => void,
    expandedNodesPerClick: number[],
    precisionsPerClick: number[],
    recallPerClick: number[],
}

function Tasks({resetGraph, expandedNodesPerClick, recallPerClick, precisionsPerClick}: TasksProps) {

    const [currentTask, setCurrentTask] = useState<Task>({
        totalTime: 0,
        providedAnswer: "",
        answer: "",
        question: "",
        expandedNodesPerClick: []
    });

    const [startTime, setStartTime] = useState<number | null>(null);
    const [taskNumber, setTaskNumber] = useState<number | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
    const [text, setText] = useState("")

    const postTaskToServer = async (time: number) => {

        let toSet = JSON.stringify({
            ...currentTask,
            totalTime: time,
            providedAnswer: currentAnswer,
            expandedNodesPerClick: expandedNodesPerClick,
        });

        console.log("Posting to server....")
        console.log(toSet);

        await fetch(`${HOST}/tasks`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
            },
            body: toSet,
        }).then(res => {
            const result = res.json()
            console.log(result)
            resetGraph();
        })

    }

    const startTasks = async () => {
        setTaskNumber(0)
        setStartTime(Date.now())
        setCurrentTask(taskList[0])
        console.log("SET")
    }

    const nextTask = async () => {

        console.log("start")
        console.log(startTime)

        if (startTime != null) {
            //calculate the end time
            const totalTime = Date.now() - startTime;
            console.log("TOTAL: " + totalTime)

            //don't await posting, just move on
            await postTaskToServer(totalTime);
        } else {
            console.error("start time is null")
        }

        setStartTime(Date.now())
        console.log("NEW START")
        console.log(startTime)

        if (taskNumber != null) {
            setTaskNumber((taskNumber) => {
                if (taskNumber != null) {
                    setCurrentTask(taskList[++taskNumber])
                    setText("")
                    return taskNumber + 1;
                }
                return 0;
            })
        } else
            console.error("task number is null")
    }

    return (
        <div className={s.container}>
            {
                currentTask.question == "" ?
                    <button onClick={startTasks}>Begin Tasks</button>
                    :
                    <React.Fragment>
                        <div>
                            <p>{currentTask.question}</p>
                            <input type={"text"} placeholder={"answer"}
                                   onChange={(e) => {
                                       setCurrentTask({...currentTask, providedAnswer: e.target.value})
                                       setCurrentAnswer(e.target.value)
                                       setText(e.target.value)
                                   }}
                                   value={text}
                            />
                        </div>
                        {
                            text == "" ?
                                <button disabled>Submit</button>
                                :

                                <button onClick={nextTask}>Submit</button>
                        }
                            </React.Fragment>
                        }
                    </div>
                )
            }

export default Tasks;