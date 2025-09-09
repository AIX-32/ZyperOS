window.apps["calc"] = function(container, context) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type math expression (e.g. 2+2)";
  input.className = "app-input app-margin-bottom app-font-large";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "app-margin-bottom";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  clearBtn.className = "app-button";

  buttonsDiv.appendChild(clearBtn);

  const output = document.createElement("div");
  output.className = "app-output";

  const historyDiv = document.createElement("div");
  historyDiv.className = "app-history";

  container.appendChild(input);
  container.appendChild(buttonsDiv);
  container.appendChild(output);
  container.appendChild(historyDiv);

  let history = [];

  function updateHistory() {
    historyDiv.innerHTML = "";
    history.slice().reverse().forEach((item, idx) => {
      const line = document.createElement("div");
      line.textContent = `${item.expr} = ${item.result}`;
      line.style.cursor = "pointer";
      line.style.padding = "2px 0";
      line.title = "Click to reuse";
      line.onclick = () => {
        input.value = item.expr;
        input.focus();
      };
      historyDiv.appendChild(line);
    });
  }

  function calculateExpression(expr) {
    if (!/^[0-9+\-*/(). %^]+$/.test(expr)) {
      throw new Error("Expression contains invalid characters");
    }
    expr = expr.replace(/\^/g, "**");
    return Function(`"use strict"; return (${expr})`)();
  }

  function runCalculation() {
    let expr = input.value.trim();
    if (!expr) return;

    output.textContent = "Calculating...";
    input.disabled = true;

    setTimeout(() => {
      try {
        const result = calculateExpression(expr);
        output.textContent = `Result: ${result}`;
        history.push({expr, result});
        updateHistory();
      } catch (err) {
        output.textContent = "Invalid expression.";
      } finally {
        input.disabled = false;
        input.focus();
      }
    }, 100); 
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCalculation();
    }
  });

  clearBtn.onclick = () => {
    input.value = "";
    output.textContent = "";
    input.focus();
  };
};
window.apps.calc.windowSize = { width: "400px", height: "300px" };