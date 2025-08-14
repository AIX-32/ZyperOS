window.apps["calc"] = function(container, context) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type math expression (e.g. 2+2)";
  input.style.width = "100%";
  input.style.marginBottom = "10px";
  input.style.fontSize = "16px";
  input.style.padding = "5px";
  input.autocomplete = "off";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginBottom = "10px";
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.gap = "10px";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  clearBtn.style.flex = "1";
  clearBtn.style.background = "#222";
  clearBtn.style.color = "#eee";
  clearBtn.style.border = "1px solid #444";
  clearBtn.style.cursor = "pointer";
  clearBtn.style.fontFamily = "monospace";

  buttonsDiv.appendChild(clearBtn);

  const output = document.createElement("div");
  output.style.minHeight = "100px";
  output.style.background = "#111";
  output.style.color = "#fff";
  output.style.padding = "10px";
  output.style.fontFamily = "monospace";
  output.style.whiteSpace = "pre-wrap";
  output.style.overflowY = "auto";
  output.style.maxHeight = "150px";

  const historyDiv = document.createElement("div");
  historyDiv.style.marginTop = "10px";
  historyDiv.style.fontSize = "14px";
  historyDiv.style.color = "#ccc";
  historyDiv.style.fontFamily = "monospace";
  historyDiv.style.maxHeight = "150px";
  historyDiv.style.overflowY = "auto";
  historyDiv.style.borderTop = "1px solid #444";
  historyDiv.style.paddingTop = "5px";

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
