import React, {useState} from "react";
import {taskList} from "./taskList";
import s from "./tasks.module.scss";
import {HOST} from "../../../../shared/variables";
import {Task} from "../../../../shared/interfaces";

interface TasksProps {
    resetGraph: () => void,
    statObject: Task,
    setStatObject: (newObject: Task) => void,
    setErrorMessage: (value: string) => void
}

function Tasks({
    resetGraph,
    statObject,
    setStatObject,
    setErrorMessage
}: TasksProps) {

    const [startTime, setStartTime] = useState<number | null>(null);
    const [taskNumber, setTaskNumber] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [currQuestion, setCurrQuestion] = useState<string | null>("");
    const [complete, setComplete] = useState<boolean>(false);

    const postTaskToServer = async (time: number) => {

        const toPost = {...statObject, totalTime: time};

        await fetch(`${HOST}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(toPost)
        }).then(async (res) => {
            setText("")
            resetGraph();

            const result = await res.json();
            if (!result.ok) {
                setErrorMessage(result.message);
            }
        });
    };

    //reset the state to start finding information
    const startTasks = async () => {
        setTaskNumber(0);
        setStartTime(Date.now());
        setCurrQuestion(taskList[0].question)
        setStatObject({...taskList[0]})
    };

    const nextTask = async () => {
        if (startTime == null || taskNumber == null) {
            setErrorMessage("task number or start time is null")
            return;
        }

        //calculate the end time
        const totalTime = Date.now() - startTime;

        //don't await posting, just move on
        await postTaskToServer(totalTime);

        //set the start time for the next task
        setStartTime(Date.now());

        const newTaskNumber = taskNumber + 1;

        //reached the end of the task list, end the session
        if (newTaskNumber > taskList.length - 1) {
            setComplete(true)
            return;
        }

        //update the task to the new task number
        setTaskNumber(newTaskNumber);
        setStatObject({...taskList[newTaskNumber]})
        setCurrQuestion(taskList[newTaskNumber].question)
    };

    return (
        <div className={s.container}>
            {/*All tasks are complete*/}
            {complete ? <div>Tasks complete</div>
                :
                // working on a task
                <React.Fragment>
                    {
                        currQuestion == "" ?
                            <button onClick={startTasks}>Begin Tasks</button>
                            :
                            <React.Fragment>
                                <div>
                                    <p>{currQuestion}</p>
                                    <input
                                        type={"text"}
                                        placeholder={"answer"}
                                        onChange={(e) => {
                                            setStatObject({...statObject, providedAnswer: e.target.value})
                                            setText(e.target.value);
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

                </React.Fragment>
            }

        </div>
    );
}

export default Tasks;
