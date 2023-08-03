import { prompt } from "inquirer";
const questions = [
    {
        type: "input",
        name: "test",
        message: "Enter the test input:",
    },
];
const start = () => prompt(questions).then((answers) => {
    console.log(answers);
});
export default start;
//# sourceMappingURL=cli.js.map