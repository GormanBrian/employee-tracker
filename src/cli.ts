import inquirer from 'inquirer';
import type { QuestionCollection, Answers } from 'inquirer';

const { prompt } = inquirer;

const questions: QuestionCollection = [];

const start = () =>
  prompt(questions).then((answers: Answers) => {
    console.log(answers);
  });

export default start;
