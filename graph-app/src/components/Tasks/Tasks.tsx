import React, {useState} from "react";
import {taskList, Task} from "./taskList";
import s from './tasks.module.scss'
import {HOST} from '../../../../shared/variables'


function Tasks() {

    const [currentTask, setCurrentTask] = useState<Task>({
        totalTime: 0,
        providedAnswer: "",
        answer: "",
        question: ""
    });

    const [startTime, setStartTime] = useState<number | null>(null);
    const [taskNumber, setTaskNumber] = useState<number | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

    const postTaskToServer = async (time: number) => {

        let toSet = JSON.stringify({...currentTask, totalTime: time, providedAnswer: currentAnswer});
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
                                   }}
                            />
                        </div>
                        <button onClick={nextTask}>Submit</button>
                    </React.Fragment>
            }
        </div>
    )
}

export default Tasks;