import React, { useEffect, useState } from "react";

const PRIMARY_KEYS = [
  ["AC", "C", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "(", ")"]
];

const SCIENTIFIC_KEYS = [
  ["sin", "cos", "tan", "^"],
  ["sqrt", "log", "ln", "!"],
  ["pi", "e", "EXP", "="]
];

const OPERATOR_KEYS = new Set(["+", "-", "*", "/", "^"]);

const formatDisplayValue = (value) => {
  if (value === "Error") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Number(value.toFixed(10)).toString();
  }

  return String(value);
};

const factorial = (value) => {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new Error("Factorial only supports whole numbers");
  }

  let result = 1;

  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }

  return result;
};

const replaceFactorials = (expression) => {
  let updatedExpression = expression;
  const factorialPattern = /(\d+(\.\d+)?|\([^()]+\))!/;

  while (factorialPattern.test(updatedExpression)) {
    updatedExpression = updatedExpression.replace(
      factorialPattern,
      (_, token) => `factorial(${token})`
    );
  }

  return updatedExpression;
};

const normalizeExpression = (expression) => {
  const sanitizedExpression = expression.replace(/\s+/g, "");

  return replaceFactorials(sanitizedExpression)
    .replace(/EXP/g, "*10**")
    .replace(/pi/g, "PI")
    .replace(/\be\b/g, "E")
    .replace(/\^/g, "**");
};

const evaluateExpression = (expression) => {
  if (!expression.trim()) {
    return "";
  }

  const normalizedExpression = normalizeExpression(expression);
  const allowedPattern = /^[\d+\-*/().,%\sA-Z_a-z*!]+$/;

  if (!allowedPattern.test(normalizedExpression)) {
    throw new Error("Unsupported expression");
  }

  const calculation = new Function(
    "sin",
    "cos",
    "tan",
    "sqrt",
    "log",
    "ln",
    "PI",
    "E",
    "factorial",
    `return ${normalizedExpression};`
  );

  const result = calculation(
    (value) => Math.sin((value * Math.PI) / 180),
    (value) => Math.cos((value * Math.PI) / 180),
    (value) => Math.tan((value * Math.PI) / 180),
    Math.sqrt,
    (value) => Math.log10(value),
    Math.log,
    Math.PI,
    Math.E,
    factorial
  );

  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  return formatDisplayValue(result);
};

function Calculator({ onSaveCalculation, theme, onToggleTheme }) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [isScientific, setIsScientific] = useState(true);
  const [status, setStatus] = useState(
    "Use your mouse or keyboard. Press Enter to calculate."
  );

  const appendValue = (value) => {
    setExpression((currentExpression) => {
      const nextExpression =
        currentExpression === "Error" ? "" : currentExpression;

      if (value === "pi") {
        return `${nextExpression}pi`;
      }

      if (value === "e") {
        return `${nextExpression}e`;
      }

      if (["sin", "cos", "tan", "sqrt", "log", "ln"].includes(value)) {
        return `${nextExpression}${value}(`;
      }

      if (value === "EXP") {
        return `${nextExpression}EXP`;
      }

      return `${nextExpression}${value}`;
    });
  };

  const handleAction = async (value) => {
    if (value === "AC") {
      setExpression("");
      setResult("0");
      setStatus("Calculator reset.");
      return;
    }

    if (value === "C") {
      setExpression((currentExpression) => currentExpression.slice(0, -1));
      setStatus("Last character removed.");
      return;
    }

    if (value === "=") {
      try {
        const nextResult = evaluateExpression(expression);
        setResult(nextResult || "0");
        setStatus("Calculation complete.");

        if (expression.trim() && nextResult !== "") {
          await onSaveCalculation({
            expression,
            result: nextResult,
            mode: isScientific ? "scientific" : "standard"
          });
        }
      } catch (error) {
        setResult("Error");
        setStatus(error.message || "Unable to calculate.");
      }
      return;
    }

    if (value === "%") {
      setExpression((currentExpression) => {
        const parsedValue = Number(currentExpression);

        if (!Number.isNaN(parsedValue)) {
          const percentValue = formatDisplayValue(parsedValue / 100);
          setResult(percentValue);
          return percentValue;
        }

        return `${currentExpression}%`;
      });
      setStatus("Percentage applied.");
      return;
    }

    appendValue(value);
    setStatus("Expression updated.");
  };

  useEffect(() => {
    const handleKeyboardInput = async (event) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
        return;
      }

      const { key } = event;

      if (/^[0-9.]$/.test(key)) {
        event.preventDefault();
        appendValue(key);
        return;
      }

      if (OPERATOR_KEYS.has(key)) {
        event.preventDefault();
        appendValue(key);
        return;
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        await handleAction("=");
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        await handleAction("C");
        return;
      }

      if (key === "Escape" || key.toLowerCase() === "c") {
        event.preventDefault();
        await handleAction("AC");
        return;
      }

      if (key === "(" || key === ")") {
        event.preventDefault();
        appendValue(key);
      }
    };

    window.addEventListener("keydown", handleKeyboardInput);
    return () => window.removeEventListener("keydown", handleKeyboardInput);
  }, [expression, isScientific]);

  return (
    <section className={`calculator-card ${theme}`}>
      <div className="calculator-header">
        <div>
          <div className="panel-label">Interactive Console</div>
          <h2>NeoCalc</h2>
        </div>

        <div className="header-actions">
          <button className="toggle-button" onClick={onToggleTheme} type="button">
            {theme === "dark" ? "Day Mode" : "Night Mode"}
          </button>
          <button
            className="toggle-button secondary"
            onClick={() => setIsScientific((current) => !current)}
            type="button"
          >
            {isScientific ? "Scientific On" : "Scientific Off"}
          </button>
        </div>
      </div>

      <div className="display-shell">
        <div className="expression-line">{expression || "0"}</div>
        <div className="result-line">{result}</div>
        <div className="status-line">{status}</div>
      </div>

      <div className="button-grid">
        {PRIMARY_KEYS.flat().map((keyValue) => (
          <button
            key={keyValue}
            type="button"
            className={`calc-button ${
              OPERATOR_KEYS.has(keyValue) || keyValue === "=" ? "accent" : ""
            } ${["AC", "C"].includes(keyValue) ? "warn" : ""}`}
            onClick={() => handleAction(keyValue)}
          >
            {keyValue}
          </button>
        ))}
      </div>

      {isScientific ? (
        <div className="scientific-panel">
          <div className="panel-label">Scientific Toolkit</div>
          <div className="button-grid scientific-grid">
            {SCIENTIFIC_KEYS.flat().map((keyValue) => (
              <button
                key={keyValue}
                type="button"
                className={`calc-button ${
                  ["=", "^"].includes(keyValue) ? "accent" : "subtle"
                }`}
                onClick={() => handleAction(keyValue)}
              >
                {keyValue}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Calculator;
