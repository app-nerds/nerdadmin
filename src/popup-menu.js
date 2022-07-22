/*
 * Copyright © 2022 App Nerds LLC
 */

export class PopupMenu extends HTMLElement {
  constructor() {
    super();
    this._trigger = null;
    this._el = null;
  }

  connectedCallback() {
    this._trigger = this.getAttribute("trigger");

    if (!this._trigger) {
      throw new Error(
        "You must provide a query selector for the element used to trigger this popup."
      );
    }

    this.style.visibility = "hidden";

    document
      .querySelector(this._trigger)
      .addEventListener("click", this.toggle.bind(this));
  }

  disconnectedCallback() {
    let el = document.querySelector(this._trigger);

    if (el) {
      el.removeEventListener("click", this.toggle.bind(this));
    }
  }

  toggle(e) {
    if (e) {
      e.preventDefault();
    }

    let triggerRect = document
      .querySelector(this._trigger)
      .getBoundingClientRect();
    let thisRect = this.getBoundingClientRect();
    let buffer = 3;

    if (thisRect.right > window.innerWidth) {
      this.style.left =
        "" +
        (triggerRect.x + (window.innerWidth - thisRect.right) - buffer) +
        "px";
    } else {
      this.style.left = "" + triggerRect.x + "px";
    }

    this.style.top =
      "" + (triggerRect.y + triggerRect.height + buffer) + "px";

    if (this.style.visibility === "hidden") {
      this.style.visibility = "visible";
    } else {
      this.style.visibility = "hidden";
    }
  }
}

export class PopupMenuItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    let text = this.getAttribute("text");
    let icon = this.getAttribute("icon");

    let html = `<div class="popup-menu-item">`;

    if (icon) {
      html += `<i class="${icon}"></i> `;
    }

    html += `${text}</div>`;
    this.innerHTML = html;
  }
}

export const showPopup = (el) => {
  document.querySelector(el).style.visibility = "visible";
};

export const hidePopup = (el) => {
  document.querySelector(el).style.visibility = "hidden";
};

customElements.define("popup-menu", PopupMenu);
customElements.define("popup-menu-item", PopupMenuItem);


