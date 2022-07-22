/*
 * Copyright © 2022 App Nerds LLC
 */

import { nerdshim } from "./nerdshim.js";

export function nerdconfirm(baseOptions = {
  width: "25%",
  height: "25%",
  callback: undefined,
}) {
  const shimBuilder = nerdshim({ closeOnClick: true });
  let shim;

  function show(type, message, options) {
    options = { ...baseOptions, ...options };

    const container = document.createElement("div");
    container.classList.add("nerdconfirm-container");
    container.style.setProperty("width", options.width);
    container.style.setProperty("height", options.height);
    container.style.setProperty("top", `calc(50% - ${options.height})`);
    container.style.setProperty("left", `calc(50% - (${options.width}/2))`);

    shim = shimBuilder.new({ callback: () => { close(container, options.callback, false); } });

    setContent(container, message);
    addButtons(container, type, options.callback);

    shim.show();
    document.body.appendChild(container);
  }

  function setContent(container, message) {
    container.innerHTML += `<p>${message}</p>`;
  }

  function addButtons(container, type, callback) {
    let buttons = [];

    switch (type) {
      case "yesno":
        const noB = document.createElement("button");
        noB.innerText = "No";
        noB.classList.add("cancel-button");
        noB.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          shim.hide(false);
          close(container, callback, false)
        });

        const yesB = document.createElement("button");
        yesB.innerText = "Yes";
        yesB.classList.add("action-button");
        yesB.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          shim.hide(false);
          close(container, callback, true);
        });

        buttons.push(noB);
        buttons.push(yesB);
        break;

      default:
        const b = document.createElement("button");
        b.innerText = "Close";
        b.classList.add("action-button");
        b.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          shim.hide(false);
          close(container, callback);
        });

        buttons.push(b);
        break;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    buttons.forEach((button) => { buttonContainer.appendChild(button); });
    container.appendChild(buttonContainer);
  }

  function close(container, callback, callbackValue) {
    container.remove();
    if (typeof callback === "function") {
      callback(callbackValue);
    }
  }

  return {
    confirm(message, options) {
      show("confirm", message, options);
    },

    yesNo(message, callback, options) {
      options = { ...{ callback: callback }, ...options };
      show("yesno", message, options);
    },
  };
}

