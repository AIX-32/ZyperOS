window.apps["clock"] = function(container, context) {
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.background = "#111";
    container.style.height = "100%";
  
    const clock = document.createElement("div");
    clock.style.width = "200px";
    clock.style.height = "200px";
    clock.style.border = "2px solid #888";
    clock.style.borderRadius = "50%";
    clock.style.position = "relative";
    clock.style.background = "#222";
    container.appendChild(clock);
  
    function makeHand(width, height, color, zIndex) {
      const hand = document.createElement("div");
      hand.style.width = `${width}px`;
      hand.style.height = `${height}px`;
      hand.style.background = color;
      hand.style.position = "absolute";
      hand.style.top = `${100 - height}px`;
      hand.style.left = `${100 - width / 2}px`;
      hand.style.transformOrigin = `center ${height}px`;
      hand.style.zIndex = zIndex;
      hand.style.borderRadius = "2px";
      return hand;
    }
  
    const hourHand = makeHand(4, 50, "#fff", 3);
    const minHand = makeHand(2, 70, "#aaa", 2);
    const secHand = makeHand(1, 90, "#666", 1);
  
    clock.appendChild(hourHand);
    clock.appendChild(minHand);
    clock.appendChild(secHand);
  
    // Center dot
    const centerDot = document.createElement("div");
    centerDot.style.width = "8px";
    centerDot.style.height = "8px";
    centerDot.style.background = "#fff";
    centerDot.style.borderRadius = "50%";
    centerDot.style.position = "absolute";
    centerDot.style.top = "calc(50% - 4px)";
    centerDot.style.left = "calc(50% - 4px)";
    centerDot.style.zIndex = 4;
    clock.appendChild(centerDot);
  
    function updateClock() {
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      hourHand.style.transform = `rotate(${(h + m / 60) * 30}deg)`;
      minHand.style.transform = `rotate(${(m + s / 60) * 6}deg)`;
      secHand.style.transform = `rotate(${s * 6}deg)`;
    }
  
    updateClock();
    const interval = setInterval(updateClock, 1000);
    context.onClose = () => clearInterval(interval);
  };
  
  window.apps.clock.windowSize = { width: "300px", height: "300px" };
  