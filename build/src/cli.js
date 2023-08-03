import inquirer from 'inquirer';
const { prompt } = inquirer;
const questions = [];
const start = () => prompt(questions).then((answers) => {
    console.log(answers);
});
export default start;
//# sourceMappingURL=cli.js.map