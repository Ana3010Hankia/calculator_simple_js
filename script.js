document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("calculator-display")
  const digitButtons = document.querySelectorAll(".digit-button")
  const operatorButtons = document.querySelectorAll(".operator-button")
  const clearButton = document.getElementById("clear")
  const backspaceButton = document.getElementById("backspace")
  const decimalButton = document.getElementById("decimal")
  const equalsButton = document.getElementById("equals")

  let displayValue = "0"
  let firstOperand = null
  let operator = null
  let waitingForSecondOperand = false
  let errorState = false

  function updateDisplay() {
    display.textContent = displayValue
    // Disable decimal button if displayValue already contains a decimal
    decimalButton.disabled = displayValue.includes(".")
  }

  function clearCalculator() {
    displayValue = "0"
    firstOperand = null
    operator = null
    waitingForSecondOperand = false
    errorState = false
    updateDisplay()
    removeActiveOperatorHighlight()
  }

  function inputDigit(digit) {
    if (errorState) return
    if (waitingForSecondOperand) {
      displayValue = digit
      waitingForSecondOperand = false
    } else {
      displayValue = displayValue === "0" ? digit : displayValue + digit
    }
    updateDisplay()
    removeActiveOperatorHighlight() // Remove highlight when new digit is typed
  }

  function inputDecimal() {
    if (errorState) return
    if (waitingForSecondOperand) {
      displayValue = "0."
      waitingForSecondOperand = false
      updateDisplay()
      return
    }
    if (!displayValue.includes(".")) {
      displayValue += "."
      updateDisplay()
    }
  }

  function performOperation(op, num1, num2) {
    switch (op) {
      case "+":
        return num1 + num2
      case "-":
        return num1 - num2
      case "*":
        return num1 * num2
      case "/":
        if (num2 === 0) {
          errorState = true
          return "error"
        }
        return num1 / num2
      default:
        return num2
    }
  }

  function handleOperator(nextOperator) {
    if (errorState) return

    const inputValue = Number.parseFloat(displayValue)

    if (firstOperand === null) {
      firstOperand = displayValue
    } else if (operator) {
      const result = performOperation(operator, Number.parseFloat(firstOperand), inputValue)
      if (result === "error") {
        displayValue = "Error"
        updateDisplay()
        return
      }
      // Round result to avoid long decimals
      const roundedResult = Number.parseFloat(result.toFixed(8)).toString()
      displayValue = roundedResult
      firstOperand = roundedResult
    }

    waitingForSecondOperand = true
    operator = nextOperator
    updateDisplay()
    highlightActiveOperator(nextOperator)
  }

  function handleEquals() {
    if (errorState) return
    if (firstOperand === null || operator === null) {
      return // Do nothing if not enough operands/operator
    }

    const inputValue = Number.parseFloat(displayValue)
    const result = performOperation(operator, Number.parseFloat(firstOperand), inputValue)

    if (result === "error") {
      displayValue = "Error"
      updateDisplay()
      return
    }

    const roundedResult = Number.parseFloat(result.toFixed(8)).toString()
    displayValue = roundedResult
    firstOperand = null
    operator = null
    waitingForSecondOperand = false
    updateDisplay()
    removeActiveOperatorHighlight()
  }

  function backspace() {
    if (errorState) return
    if (waitingForSecondOperand) return // Don't backspace if waiting for new number

    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith("-"))) {
      displayValue = "0"
    } else {
      displayValue = displayValue.slice(0, -1)
    }
    updateDisplay()
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
      button.classList.remove("active")
    })
  }

  // Event Listeners for buttons
  digitButtons.forEach((button) => {
    button.addEventListener("click", () => inputDigit(button.dataset.digit))
  })

  operatorButtons.forEach((button) => {
    button.addEventListener("click", () => handleOperator(button.dataset.operator))
  })

  clearButton.addEventListener("click", clearCalculator)
  backspaceButton.addEventListener("click", backspace)
  decimalButton.addEventListener("click", inputDecimal)
  equalsButton.addEventListener("click", handleEquals)

  // Keyboard support
  document.addEventListener("keydown", (event) => {
    const { key } = event

    if (/\d/.test(key)) {
      // Digits 0-9
      event.preventDefault()
      inputDigit(key)
    } else if (key === ".") {
      // Decimal point
      event.preventDefault()
      inputDecimal()
    } else if (["+", "-", "*", "/"].includes(key)) {
      // Operators
      event.preventDefault()
      handleOperator(key)
    } else if (key === "Enter" || key === "=") {
      // Equals
      event.preventDefault()
      handleEquals()
    } else if (key === "Backspace") {
      // Backspace
      event.preventDefault()
      backspace()
    } else if (key === "Escape" || key === "c" || key === "C") {
      // Clear
      event.preventDefault()
      clearCalculator()
    }
  })

  // Initial display update
  updateDisplay()
})
