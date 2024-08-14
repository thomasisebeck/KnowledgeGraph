import React from "react";
import {UpdateType} from "./AddStackDialogue/DialogueUtils";
import {Direction, Neo4jNode, Category, RequestBodyConnection} from "../../../shared/interfaces"

export const updateCategoryUtil = (index: number, setBaseCategory: (value: React.SetStateAction<RequestBodyConnection>) => void,
                            baseCategory: any, value: string | Direction, updateType: UpdateType,
                            setCategories: React.Dispatch<React.SetStateAction<RequestBodyConnection[]>>,
                            categories: RequestBodyConnection[]
) => {

    const BASE_CATEGORY_INDEX = -1;

    if (index == BASE_CATEGORY_INDEX) { //update base category
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
