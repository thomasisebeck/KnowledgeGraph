import {
    Direction,
    RequestBodyConnection,
} from "../../../../shared/interfaces";
import {
   BASE_CATEGORY_INDEX
} from "../../../../shared/variables"
import React from "react";

const getNewCategory = (dir: Direction) => {
    switch (dir) {
        case Direction.NEUTRAL:
            return Direction.TOWARDS;
        case Direction.TOWARDS:
            return Direction.AWAY;
        default:
            return Direction.NEUTRAL;
    }
};

export const toggleCategory = (
    index: number,
    categories: RequestBodyConnection[],
    setCategories: React.Dispatch<
        React.SetStateAction<RequestBodyConnection[]>
    >,
    baseCategory: RequestBodyConnection,
    setBaseCategory: React.Dispatch<React.SetStateAction<RequestBodyConnection>>,
) => {

    console.log("toggling... (CategoryUtils.ts)");

    if (index == BASE_CATEGORY_INDEX) {
        baseCategory.direction = getNewCategory(baseCategory.direction);
        setBaseCategory({...baseCategory})
        return ;
    }

    categories[index].direction = getNewCategory(categories[index].direction);
    setCategories([...categories]);
};
