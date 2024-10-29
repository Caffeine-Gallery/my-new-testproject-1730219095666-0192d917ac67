import { backend } from 'declarations/backend';

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.keypad button');
const clearButton = document.getElementById('clear');

let currentInput = '';
let operator = '';
let firstOperand = null;

buttons.forEach(button => {
    button.addEventListener('click', () => handleButtonClick(button.textContent));
});

clearButton.addEventListener('click', clearCalculator);

async function handleButtonClick(value) {
    if (value >= '0' && value <= '9' || value === '.') {
        currentInput += value;
        updateDisplay();
    } else if (['+', '-', '*', '/'].includes(value)) {
        if (firstOperand === null) {
            firstOperand = parseFloat(currentInput);
            operator = value;
            currentInput = '';
        } else {
            await performCalculation();
            operator = value;
        }
    } else if (value === '=') {
        await performCalculation();
    }
}

async function performCalculation() {
    if (firstOperand !== null && currentInput !== '') {
        const secondOperand = parseFloat(currentInput);
        let result;

        try {
            switch (operator) {
                case '+':
                    result = await backend.add(firstOperand, secondOperand);
                    break;
                case '-':
                    result = await backend.subtract(firstOperand, secondOperand);
                    break;
                case '*':
                    result = await backend.multiply(firstOperand, secondOperand);
                    break;
                case '/':
                    result = await backend.divide(firstOperand, secondOperand);
                    break;
            }

            currentInput = result.toString();
            updateDisplay();
            firstOperand = result;
            operator = '';
        } catch (error) {
            currentInput = 'Error';
            updateDisplay();
        }
    }
}

function updateDisplay() {
    display.value = currentInput;
}

function clearCalculator() {
    currentInput = '';
    operator = '';
    firstOperand = null;
    updateDisplay();
}

// Add loading spinner
const calculatorDiv = document.querySelector('.calculator');
const spinner = document.createElement('div');
spinner.className = 'spinner-border text-primary d-none';
spinner.setAttribute('role', 'status');
calculatorDiv.appendChild(spinner);

// Show spinner before each backend call
async function withSpinner(fn) {
    spinner.classList.remove('d-none');
    try {
        await fn();
    } finally {
        spinner.classList.add('d-none');
    }
}

// Wrap performCalculation with spinner
const originalPerformCalculation = performCalculation;
performCalculation = () => withSpinner(originalPerformCalculation);
