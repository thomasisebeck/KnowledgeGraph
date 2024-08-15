import React, {SetStateAction} from "react";
import {UpdateType} from "./AddStackDialogue/DialogueUtils";
import {Direction, RequestBodyConnection} from "../../../shared/interfaces"
import {BASE_CATEGORY_INDEX} from "../../../shared/variables"

export const updateCategoryUtil = (index: number, setBaseCategory: ((value: SetStateAction<RequestBodyConnection>) => void),
                                   baseCategory: any, value: string | Direction, updateType: UpdateType,
                                   setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,
                                   categories: RequestBodyConnection[]
) => {

    console.log("index")
    console.log(index)

    if (index == BASE_CATEGORY_INDEX) { //update base category
        if (!setBaseCategory)
            throw "check assigment, base category is not found!"

        console.log("UPDATING BASE")
        switch (updateType) {
            case UpdateType.CONNECTION_DIRECTION:
                setBaseCategory({...baseCategory, direction: value as Direction})
                break;
            case UpdateType.CONNECTION_NAME:
                setBaseCategory({...baseCategory, connectionName: value as string})
                break;
            case UpdateType.NODE_NAME:
                setBaseCategory({...baseCategory, nodeName: value as string});
                break;
        }

        return;
    }

    console.log("UPDATING OTHER")
    switch (updateType) {
        case UpdateType.CONNECTION_DIRECTION:
            setCategories(categories.map(((e, ind) => {
                if (ind == index)
                    return {...e, direction: value as Direction}
                return e;
            })));
            break;
        case UpdateType.CONNECTION_NAME:
            setCategories(categories.map(((e, ind) => {
                if (ind == index)
                    return {...e, connectionName: value as string}
                return e;
            })));

            break;
        case UpdateType.NODE_NAME:
            setCategories(categories.map(((e, ind) => {
                if (ind == index)
                    return {...e, nodeName: value as string}
                return e;
            })));

            break;
    }
}
