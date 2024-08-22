import hook from "eslint-plugin-react-hooks"
import react from "react"
import parser from "@typescript-eslint/parser"

export default [
    {
        plugins: {
            react,
            hook
        },
        languageOptions: {
            parser: parser
        },
    }
]

