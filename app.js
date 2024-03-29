const { app, BrowserWindow, ipcMain, Tray } = require("electron")
const path = require("path")

const assetsDirectory = path.join(__dirname, "assets")

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on("ready", () => {
	createTray()
	createWindow()
})

// Quit the app when the window is closed
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
})

const createTray = () => {
	tray = new Tray(path.join(assetsDirectory, "hatTemplate.png"))
	tray.on("right-click", toggleWindow)
	tray.on("double-click", toggleWindow)
	tray.on("click", function (event) {
		toggleWindow()

		// Show devtools when command clicked
		if (window.isVisible() && process.defaultApp && event.metaKey) {
			window.openDevTools({ mode: "detach" })
		}

		// Close the app when alt clicked
		if (event.altKey) {
			app.quit()
		}
	})
}

const getWindowPosition = () => {
	const windowBounds = window.getBounds()
	const trayBounds = tray.getBounds()

	// Center window horizontally below the tray icon
	const x = Math.round(
		trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
	)

	// Position window 4 pixels vertically below the tray icon
	const y = Math.round(trayBounds.y + trayBounds.height + 4)

	return { x: x, y: y }
}

const createWindow = () => {
	window = new BrowserWindow({
		width: 300, // Window width
		height: 600, // Window height
		show: false,
		frame: false,
		fullscreenable: false,
		resizable: false,
		transparent: true,
		webPreferences: {
			// Prevents renderer process code from not running when window is hidden
			backgroundThrottling: false,
			preload: path.join(app.getAppPath(), "window.js"),
		},
	})

	window.loadURL(`file://${path.join(__dirname, "window.html")}`)

	// Hide the window when it loses focus
	window.on("blur", () => {
		if (!window.webContents.isDevToolsOpened()) {
			window.hide()
		}
	})
}

const toggleWindow = () => {
	if (window.isVisible()) {
		window.hide()
	} else {
		showWindow()
	}
}

const showWindow = () => {
	const position = getWindowPosition()
	window.setPosition(position.x, position.y, false)
	window.show()
	window.focus()
}

// ======================
// MESSAGES FROM THE VIEW
// ======================

ipcMain.on("show-window", () => {
	showWindow()
})

ipcMain.on("context-updated", (event, model) => {
	// TRAY TEXT
	tray.setTitle(" " + model.currentContext.name)

	// TRAY TOOLTOP
	tray.setToolTip(model.currentContext.seconds + " seconds")

	// TRAY ICON
	//tray.setImage(path.join(assetsDirectory, 'icon.png'))
})
