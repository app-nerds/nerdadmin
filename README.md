# Nerd Admin

Nerd Admin is a small CSS and JavaScript framework for building admin web apps. The CSS is pure CSS3. The JavaScript is only required if you wish to make use of the components provided. All JavaScript components are written in pure JavaScript and Web Components.

*Note that there is an external dependency on [Feather Icons](https://feathericons.com) for adding icons to your application.*

## 🚀 Getting Started

To begin copy the minified files from the `dist` folder into your project. In the examples below we'll be making use of [Nerdwebjs](https://github.com/app-nerds/nerdwebjs), though it is not required. Let's build a simple one page application in Go and JavaScript.

To get started let's make a new folder and call it `ourapplication`. In that folder will live our Go and JavaScript application. We'll also need to initialize it.

```bash
$ mkdir -p ourapplication/app/static/css
$ mkdir -p ourapplication/app/static/js
$ mkdir -p ourapplication/app/static/views
$ mkdir -p ourapplication/app/static/libraries/nerdadmin
$ mkdir -p ourapplication/app/static/libraries/nerdwebjs
$ cd ourapplication
$ go mod init github.com/example/ourapplication
```

Now let's add some files. This includes our main Go code and the HTML and JavaScript necessary.

```bash
$ touch ./main.go
$ touch ./app/index.html
$ touch ./app/main.js
$ touch ./app/manifest.json
$ touch ./app/static/views/Home.js
```

Then next step is to copy our libraries. For this example we'll be using Nerd Admin and [NerdWebJS](https://github.com/app-nerds/nerdwebjs). Copy the contents of the `dist` folder for Nerd Admin into `app/libraries/nerdadmin`. Then copy the contents of the `dist` folder for NerdwebJS into `app/libraries/nerdwebjs`.

Now let's fill in some of the code. For **main.go** let's make the code start a server that can serve up our JavaScript application. We'll do this using the [Nerdweb](https://github.com/app-nerds/nerdweb) library.

```go
package main

import (
	"context"
	"embed"
	"net/http"
	"time"

	"github.com/app-nerds/nerdweb/v2"
	"github.com/sirupsen/logrus"
)

const (
	AppName string = "outapplication"
)

var (
	Version = "development"

	logger *logrus.Entry

	//go:embed app
	appFs embed.FS

	//go:embed app/index.html
	indexHTML []byte

	//go:embed app/main.js
	mainJS []byte

	//go:embed app/manifest.json
	manifestJSON []byte
)

func main() {
	var (
		err     error
	)

	/*
	 * Setup configuration and logging
	 */
	logger = logrus.New().WithFields(logrus.Fields{
		"who":     AppName,
		"version": Version,
	})

	logger.WithField("host", "localhost:8080").Info("starting server...")
	spaConfig := nerdweb.DefaultSPAConfig("localhost:8080", Version, appFs, indexHTML, mainJS, manifestJSON)

	spaConfig.Endpoints = nerdweb.Endpoints{}

	_, server := nerdweb.NewSPARouterAndServer(spaConfig)

	/*
	 * Start the server
	 */
	go func() {
		err := server.ListenAndServe()

		if err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("error starting server")
		}
	}()

	<-nerdweb.WaitForKill()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = server.Shutdown(ctx); err != nil {
		logger.WithError(err).Fatal("error shutting down server")
	}

	logger.Info("server stopped")
}
```

Now that we have the foundation for an API and serving our JavaScript application, let's create the HTML.

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Our Application</title>

  <link rel="stylesheet" href="/static/libraries/nerdadmin/nerdadmin.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
</head>

<body>
  <nav class="sidenav">
    <h1>Our Application</h1>

    <div class="profile">
      <p>Your name here</p>
    </div>

    <div class="menu-container">
      <ul>
        <li class="header">Group 1</li>
        <li><i data-feather="server"></i><a href="/">Manage Something</a></li>
        <li><i data-feather="plus-square"></i><a href="/edit-something/0">Edit Something</a></li>
      </ul>
    </div>
  </nav>

  <main id="app">
  </main>

  <footer>
    <p>&copy; 2022 My Company Here</p>
  </footer>

  <script type="module" src="/main.js"></script>
</body>

</html>
```

As you can see this houses the foundation for every page. It has our title, menu, and a space to inject views in an element named **app**. It also loads **main.js**, so let's take a look at that next.

```js
import nerdadmin from "./static/libraries/nerdadmin/nerdadmin.min.js";

import Home from "./static/views/Home.js";

import { application, fetch } from "./static/libraries/nerdwebjs/nerdwebjs.min.js";

const routes = [
  { path: "/", view: Home },
];

const app = application("#app", routes);

/*
 * afterRoute is executed after a route finishes loading the view
 */
app.afterRoute(() => {
  // Using Feather, an icon library. This loads icons
  feather.replace();
});

/*
 * Inject our services into the views. The will return an object
 * which will be merged with "params" in the view constructor.
 */
app.injectParams(() => {
  return {
    nerdalert: nerdadmin.nerdalert(),
    nerdconfirm: nerdadmin.nerdconfirm(),
    nerdshim: nerdadmin.nerdshim(),
  };
});

/* Go! */
app.go();
```

Now on to the final piece. Let's setup the view that will house our home page.

```js
import { BaseView } from "../libraries/nerdwebjs/nerdwebjs.js";

export default class Home extends BaseView {
  constructor(params) {
    super(params);
  }

  /*
   * Called to render your view
   */
  async render() {
    this.innerHTML = `
      <title>Home</title>

      <h2>Home Page</h2>
      <p>
        This is your home page. Do stuff, like display content,
        perform AJAX calls, etc...
      </p>
    `;
  }

  /*
   * Called after your view is rendered. Do stuff like load
   * async content and alter the DOM, attach events, etc...
   */
  async afterRender() {
    feather.replace();
  }
}

customElements.define("home-page", Home);
```

## Popup Menus

`popup-menu.js` provides the ability to define popup menus. These are useful for small utility menus on a page.

![Popup Menu Screenshot](./popup-menu-screenshot.png)

To use these popups include them on your page like so.

```html
<link rel="stylesheet" type="text/css" href="/static/js/libraries/nerdwebjs/popup-menu.css"/>
<script type="module" src="/static/js/libraries/nerdwebjs/popup-menu.js"></script>
```

Here is an example of their use in a view. 

```js
import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.js";
import { hidePopup } from "../js/libraries/nerdwebjs/popup-menu.js";

export default class Example extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    return `
      <title>Example</title>

      <button type="button" id="btnChangeView" class="rounded-button calendar-view-button"><i class="fas fa-bars"></i></button>
      <popup-menu id="changeView" trigger="#btnChangeView" class="calender-view-popup-menu">
        <popup-menu-item id="changeViewMonth" text="Month" icon="fas fa-calendar"></popup-menu-item>
        <popup-menu-item id="changeViewWeek" text="Week" icon="fas fa-calendar-week"></popup-menu-item>
        <popup-menu-item id="changeViewDay" text="Day" icon="fas fa-calendar-day"></popup-menu-item>
      </popup-menu>
    `;
  }

  async afterRender() {
		document
			.querySelector("#changeViewMonth")
			.addEventListener("click", () => {
        hidePopup("#changeView");
				alert("You clicked on Month!");
			});
		document
			.querySelector("#changeViewWeek")
			.addEventListener("click", () => {
        hidePopup("#changeView");
				alert("You clicked on Week!");
			});
		document
      .querySelector("#changeViewDay")
      .addEventListener("click", () => {
        hidePopup("#changeView");
				alert("You clicked on Day!");
      });
  }
}
```

### Styles

Popup menus have the following CSS classes.

* **popup-menu** - Class for the main div. This is the popup container.
* **popup-menu-item** - Class for an individual menu item


