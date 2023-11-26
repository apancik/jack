const { ipcRenderer, shell } = require("electron")

// =====
// MODEL
// =====

// const colors = ["#0094F7", "#F7C806", "#AB81F3", "#83C737", "#F74F00"]

let model = {
	currentContext: {
		name: "Empty context",
		seconds: 0,
	},
	active: false,
	contexts: [
		{ "name": "Designer", "seconds": 1200, "color": "#0094F7" },
		{ "name": "Break", "seconds": 300, "color": "#83C737" },
		{ "name": "Programmer", "seconds": 1200, "color": "#AB81F3" },
		{ "name": "Break", "seconds": 300, "color": "#83C737" },
		{ "name": "Growth", "seconds": 1200, "color": "#F74F00" },
		{ "name": "Wrap-up", "seconds": 300, "color": "#83C737" }
	]
}

// =======
// METHODS
// =======
const showNotification = () => {
	let notification = new Notification("New Context", {
		body: `New context is ${model.currentContext.name} and you have ${model.currentContext.seconds} seconds in it`,
	})

	// Show window when notification is clicked
	notification.onclick = () => {
		ipcRenderer.send("show-window")
	}
}

const setTrayText = () => {
	ipcRenderer.send("context-updated", model)
}

const nextContext = () => {
	let current = model.contexts.shift()
	model.currentContext = { ...current }
	model.contexts.push(current)

	showNotification(model)
	setTrayText(model)

	updateUpcoming()
}

// ===================
// VIEW EVENT BINDINGS
// ===================

// Change model every second
setInterval(() => {
	if (!model.currentContext.seconds) nextContext()
	if (model.active) model.currentContext.seconds--

	updateView()
}, 1000)

document.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("js-current-context")
		.addEventListener("click", () => {
			model.active = !model.active

			updateView()
		})

	/*
	document
		.querySelector(".js-action-add-context")
		.addEventListener("click", () => {
			let name = document.querySelector(".js-name").value
			let seconds = document.querySelector(".js-seconds").value

			console.log(name, seconds)

			model.contexts.push({
				name: name,
				seconds: seconds,
			})

			updateView()
		})

	document
		.querySelector(".js-action-quit")
		.addEventListener("click", (event) => {
			console.log("THIS IS close")
			window.close()
		})*/
})

// ===========
// VIEW UPDATE
// ===========
const updateUpcoming = () => {
	const contextList = document.getElementById("js-contexts-list")
	contextList.innerHTML = ""

	model.contexts.forEach((context, ord) => {
		let template = `
    <div class="context-item">
        <div class="context-item-description">
          <div
            class="context-item-color"
            style="background-color: ${context.color};"
          ></div>
          <div class="ml-1">
            <div class="context-item-title">${context.name}</div>
            <div class="context-item-time">${context.seconds} seconds</div>
          </div>
        </div>
        <img src="assets/skip.png" />
    </div>`

		let el = document.createElement("div")
		el.innerHTML = template
		contextList.appendChild(el)

		el.addEventListener("click", () => {
			model.contexts.slice(ord)
			model.contexts = model.contexts
				.slice(ord, ord + 1)
				.concat(model.contexts.slice(ord + 1))
				.concat(model.contexts.slice(0, ord))
			nextContext()
		})
	})
}

const updateView = () => {
	const currentContext = document.getElementById("js-current-context")

	currentContext.innerHTML = `
  	<div
				class="context-panel ${model.active ? "active" : ""}"
				style="${
					model.active
						? "background-color: " + model.currentContext.color
						: ""
				};"
			>
        <div>
          <div class="context-panel-name">${model.currentContext.name}</div>
				  <div class="context-panel-time">${model.currentContext.seconds} seconds</div>
        </div>
        <div class="icon">
          <img src="${model.active ? "assets/pause.png" : "assets/play.png"}" />
        </div>
      </div>
      `
}
