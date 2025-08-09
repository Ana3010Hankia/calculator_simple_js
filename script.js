  const display = document.getElementById("calculator-display");
  const digitButtons = document.querySelectorAll(".digit-button");
  const operatorButtons = document.querySelectorAll(".operator-button");
  const clearButton = document.getElementById("clear");
  const backspaceButton = document.getElementById("backspace");
  const decimalButton = document.getElementById("decimal");
  const equalsButton = document.getElementById("equals");

  let displayValue = "0";
  let firstOperator = null;
  let operator = null;
  let pendingSecondOperator = false;
  let errorState = false;

  function updateDisplay() {
    display.textContent = displayValue;
    decimalButton.disabled = displayValue.includes(".");
  }

  function clearCalculator() {
    displayValue = "0";
    firstOperator = null;
    operator = null;
    pendingSecondOperator = false;
    errorState = false;
    updateDisplay();
    removeActiveOperatorHighlight();
  }

  function inputDigit(digit) {
    if (errorState) return;

    if (pendingSecondOperator) {
      displayValue = digit;
      pendingSecondOperator = false;
    } else {
      displayValue = displayValue === "0" ? digit : displayValue + digit;
    }
    updateDisplay();
    removeActiveOperatorHighlight(); 
  }

 function inputDecimal() {
    if (errorState) return;

    if (pendingSecondOperator) {
      displayValue = "0.";
      pendingSecondOperator = false;
      updateDisplay();
      return;

    } else if (!displayValue.includes(".")) {
      displayValue += ".";
      updateDisplay();
      return;
    }    
  }

  function performOperation(op, num1, num2) {
    switch (op) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      case "/":
        if (num2 === 0) {
          errorState = true;
          return "error";
        } else return num1 / num2;
      default:
        return num2;
    }
  }

  function handleOperator(nextOperator) {
    if (errorState) return;

    const inputValue = Number.parseFloat(displayValue);

    if (firstOperator === null) {
      firstOperator = displayValue;

    } else if (operator) {
      const result = performOperation(operator, Number.parseFloat(firstOperator), inputValue);

      if (result === "error") {
        displayValue = "undefined";
        updateDisplay();
        return;
      }
      
      const roundedResult = Number.parseFloat(result.toFixed(8)).toString();
      displayValue = roundedResult;
      firstOperator = roundedResult;
    }

    pendingSecondOperator = true;
    operator = nextOperator;
    updateDisplay();
    highlightActiveOperator(nextOperator);
  }

  function handleEquals() {
    if (errorState || firstOperator === null || operator === null) return;

    const inputValue = Number.parseFloat(displayValue);
    const result = performOperation(operator, Number.parseFloat(firstOperator), inputValue);

    if (result === "error") {
      displayValue = "undefined";
      updateDisplay();
      return;
    }

    const roundedResult = Number.parseFloat(result.toFixed(8)).toString();
    displayValue = roundedResult;
    firstOperator = null;
    operator = null;
    pendingSecondOperator = false;
    updateDisplay();
    removeActiveOperatorHighlight();
  }

  function backspace() {
    if (errorState || pendingSecondOperator) return;

    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith("-"))) {
      displayValue = "0";
    } else {
      displayValue = displayValue.slice(0, -1);
    }
    updateDisplay();
  }

  function highlightActiveOperator(activeOp) {
    removeActiveOperatorHighlight()
    operatorButtons.forEach((button) => {
      if (button.dataset.operator === activeOp) {
        button.classList.add("active")
      }
    })
  }

  function removeActiveOperatorHighlight() {
    operatorButtons.forEach((button) => {
      button.classList.remove("active");
    })
  }

  digitButtons.forEach((button) => {
    button.addEventListener("click", () => inputDigit(button.dataset.digit));
  })

  operatorButtons.forEach((button) => {
    button.addEventListener("click", () => handleOperator(button.dataset.operator));
  })

  clearButton.addEventListener("click", clearCalculator);
  backspaceButton.addEventListener("click", backspace);
  decimalButton.addEventListener("click", inputDecimal);
  equalsButton.addEventListener("click", handleEquals);

  // Keyboard support
  document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (/\d/.test(key)) {
      event.preventDefault();
      inputDigit(key);

    } else if (key === ".") {
      event.preventDefault();
      inputDecimal();

    } else if (["+", "-", "*", "/"].includes(key)) {
      event.preventDefault();
      handleOperator(key);

    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleEquals();

    } else if (key === "Backspace") {
      event.preventDefault();
      backspace();

    } else if (key === "Escape" || key === "c" || key === "C") {
      event.preventDefault();
      clearCalculator();
    }
  })
  updateDisplay();

