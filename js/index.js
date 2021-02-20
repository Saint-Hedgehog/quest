'use strict';

const REG_FORM_ID = 'rec281800224';

const ENTER_STEP = 'enter';
const INTRO_STEP = 'intro';
const RESULT_STEP = 'result';

const prevBtn = document.querySelector('.prev-link');
const nextBtn = document.querySelector('.next-link');
const modalCorrect = document.querySelector('.modal-correctly');
const modalWrong = document.querySelector('.modal-wrong');
const modalComment = document.querySelector('.comment');
const section = document.querySelector('.quiz');
const header = document.querySelector('.header');
const image = document.querySelector('.image');
const description = document.querySelector('.description');
const fields = document.querySelector('.fields');

const questions = {
    [ENTER_STEP]: {
        header: 'Один на улице и дома: как избежать неприятностей',
        description: 'Выберите героя',
        className: 'quiz-alone',
        questionClassName: 'quiz-alone__choice',
        questionMarkup: `
                <fieldset>
                    <input class="visually-hidden quiz-alone__input" type="radio" name="person" id="child"/>
                    <label for="child" class="quiz-alone__label"><span class="quiz-alone__child-link">ребёнок</span></label>
                </fieldset>
                <!--  -->
                <fieldset>
                    <input class="visually-hidden quiz-alone__input" type="radio" name="person" id="parent"/>
                    <label for="parent" class="quiz-alone__label"><span class="quiz-alone__parent-link">родитель</span></label>
                </fieldset>
        `
    },
    parent: {
        [INTRO_STEP]: {
            className: 'person person-parent',
            img: 'img/parent-intro.png',
            description: 'Самостоятельный путь ребенка от школы до дома — настоящее испытание для родителей и детей. Крайне важно, чтобы ничего не угрожало школьнику, но опасности могут поджидать на дорогах, в общении с посторонними и даже дома. Проверьте, как хорошо вы подготовили ребенка к опасностям в городе.'
        },
        question: {
            className: 'person person-parent person-question',
        },
        [RESULT_STEP]: {
            className: 'person person-parent person-congratulations',
            img: 'img/result.png',
            getResultHeader: (N) => `Вы прошли необходимый инструктаж для подготовки ребёнка к преодолению опасностей в городе и дома! За время прохождения теста вы допустили ${N} ошибок.`,
            getResultDescription: () => 'Говорить с ребёнком о мерах осторожности, правилах поведения в опасных ситуациях и учесть все детали сложно, поэтому запишитесь на наш вебинар: эксперты подробно расскажут о безопасном передвижении по городу, правилах общения с незнакомыми и решении бытовых проблем.',
        },
        questions: []
    },
    child: {
        [INTRO_STEP]: {
            className: 'person person-child',
            img: 'img/child-intro.png',
            description: 'Самостоятельно преодолеть путь от школы до дома не так просто, как кажется на первый взгляд. Тебя могут поджидать опасности на дорогах, в общении с незнакомцами и даже дома. Пройди наш квест, чтобы узнать, как ты справишься с опасными ситуациями в реальной жизни!'
        },
        question: {
            className: 'person person-child person-question',
        },
        [RESULT_STEP]: {
            className: 'person person-child person-congratulations',
            img: 'img/result.png',
            getResultHeader: () => 'Поздравляем с прохождением испытания! Ты сам преодолел путь из школы до дома и дождался родителей.',
            getResultDescription: (N) => `За это время ты потратил ${N} жизней в нашем квесте. Неплохой результат, но можно подготовиться ещё лучше! Чтобы избежать всех опасностей в реальном мире, запишитесь на наш вебинар для родителей: эксперты подробно расскажут о безопасном передвижении по городу, правилах общения с незнакомыми и решении бытовых проблем.`,
        },
        questions: []
    }
};

const loadQuestions = () => {
    const p1 = fetch('./child-questions.json').then(r => r.json()).then((json) => {
        questions.child.questions = json;
    });
    const p2 = fetch('./parent-questions.json').then(r => r.json()).then((json) => {
        questions.parent.questions = json;
    });
    return Promise.all([p1, p2]);
}

const questStatus = {
    role: null,
    currentQuestion: null,
    mistakes: 0,
}

const getQuestionElement = (i, label) => {
    const fieldset = document.createElement('fieldset');
    fieldset.innerHTML = `
        <input type="radio" class="input visually-hidden" name="question" id="option${i}"/>
        <label for="option${i}" class="label"></label>
`;
    fieldset.querySelector('label').textContent = label;
    return fieldset;
}

const changeMarkup = () => {
    const {mistakes, role, currentQuestion} = questStatus;
    let content = {
        className: '',
        header: '',
        image: '',
        description: '',
    }
    switch (currentQuestion) {
        case ENTER_STEP:
            content = questions[ENTER_STEP];
            fields.classList.add(content.questionClassName);
            fields.removeAttribute('hidden');
            fields.innerHTML = content.questionMarkup;
            prevBtn.setAttribute('hidden', 'true');
            break;
        case INTRO_STEP:
            content = questions[role][INTRO_STEP];
            fields.classList.remove(questions[ENTER_STEP].questionClassName);
            fields.setAttribute('hidden', 'true');
            prevBtn.removeAttribute('hidden');
            fields.innerHTML = '';
            break;
        case RESULT_STEP:
            content = questions[role][RESULT_STEP];
            content.header = content.getResultHeader(mistakes);
            content.description = content.getResultDescription(mistakes);
            prevBtn.setAttribute('hidden', 'true');
            fields.setAttribute('hidden', 'true');
            fields.innerHTML = '';
            nextBtn.insertAdjacentHTML('afterend', '<a href="#rec281800224" class="next-link">записаться</a>');
            nextBtn.style.display = 'none';
            break;
        default:
            content = questions[role].questions[currentQuestion]
            content.className = questions[role].question.className;
            const fr = document.createDocumentFragment()
            content.values.forEach((label, i) => {
                fr.append(getQuestionElement(i, label));
            });
            fields.innerHTML = '';
            fields.append(fr);
            fields.removeAttribute('hidden');
    }
    section.className = `quiz ${content.className}`;
    if (content.header) {
        header.textContent = content.header;
        header.removeAttribute('hidden');
    } else {
        header.setAttribute('hidden', 'true');
    }

    if (content.img) {
        image.setAttribute('src', content.img);
        image.removeAttribute('hidden');
    } else {
        image.setAttribute('hidden', 'true');
    }

    if (content.description) {
        description.textContent = content.description;
        description.removeAttribute('hidden');
    } else {
        description.setAttribute('hidden', 'true');
    }

    const inputs = fields.querySelectorAll('input');
    if (inputs.length > 0) {
        nextBtn.setAttribute('disabled', 'true');
    } else {
        nextBtn.removeAttribute('disabled');
    }
    inputs.forEach((input) => {
        const listener = () => {
            nextBtn.removeAttribute('disabled');
            input.removeEventListener('click', listener);
        }
        input.addEventListener('click', listener);
    });
};

const checkAnswer = () => {
    const {role, currentQuestion} = questStatus;
    switch (currentQuestion) {
        case ENTER_STEP:
            questStatus.role = Array.from(document.querySelectorAll('[name=person]')).reduce((value, input) => {
                return input.checked ? input.id : value;
            }, '');
            return true;
        case null:
        case INTRO_STEP:
            return true;
        default:
            const answer = Array.from(document.querySelectorAll('[name=question]')).reduce((value, input, index) => {
                return input.checked ? index : value;
            }, 0);
            return answer === questions[role].questions[currentQuestion].answer;
    }
};

const showModal = (modalEl) => {
    if (modalEl.classList.contains('visually-hidden')) {
        modalEl.classList.remove('visually-hidden');
    }
};

const hideModal = (modalEl) => {
    if (!modalEl.classList.contains('visually-hidden')) {
        modalEl.classList.add('visually-hidden');
    }
};

const setNextStep = () => {
    const isCorrect = checkAnswer();
    const {currentQuestion, role} = questStatus;
    switch (currentQuestion) {
        case ENTER_STEP:
            questStatus.currentQuestion = INTRO_STEP;
            break;
        case INTRO_STEP:
            questStatus.currentQuestion = 0;
            break;
        case RESULT_STEP:
            window.location.hash = REG_FORM_ID;
            return;
        case null:
            questStatus.currentQuestion = ENTER_STEP;
            break;
        default:
            if (isCorrect) {
                if (currentQuestion < questions[role].questions.length - 1) {
                    showModal(isCorrect ? modalCorrect : modalWrong);
                    setTimeout(() => hideModal(modalCorrect), 2000);
                }
            } else {
                showModal(modalWrong);
                modalComment.textContent = questions[role].questions[currentQuestion].comment;
            }
            if (!isCorrect && currentQuestion === 0) {
                questStatus.currentQuestion = INTRO_STEP;
            } else if (currentQuestion === questions[role].questions.length - 1) {
                questStatus.currentQuestion = RESULT_STEP;
            } else {
                isCorrect ? questStatus.currentQuestion++ : questStatus.currentQuestion--;
            }
            if (!isCorrect) {
                questStatus.mistakes++;
            }
    }
    changeMarkup();
};

const setPrevStep = () => {
    const {currentQuestion, role} = questStatus;
    switch (currentQuestion) {
        case INTRO_STEP:
            questStatus.currentQuestion = ENTER_STEP;
            break;
        default:
            if (currentQuestion === 0) {
                questStatus.currentQuestion = INTRO_STEP;
            } else {
                questStatus.currentQuestion--;
            }
    }
    changeMarkup();
}

nextBtn.addEventListener('click', () => setNextStep());

prevBtn.addEventListener('click', () => setPrevStep());

document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        hideModal(modalCorrect);
        hideModal(modalWrong);
    }
});

document.querySelector('.modal-wrong__btn').addEventListener('click', () => {
    hideModal(modalWrong);
});

window.addEventListener('load', () => {
    loadQuestions()
        .then(() => {
            setNextStep();
        });
})