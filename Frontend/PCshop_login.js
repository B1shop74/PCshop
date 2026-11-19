function authEl(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
}

async function authRequest(path, options = {}) {
    const response = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
    }
    return data
}

let authCurrentUser = null
let authModal = null

function updateAuthButton() {
    const button = document.querySelector(".login-button")
    if (!button) return

    if (authCurrentUser) {
        button.textContent = `${authCurrentUser} \u00b7 log out`
        button.title = "Click to log out"
    } else {
        button.textContent = "Log in"
        button.title = ""
    }
}

function buildLoginModal() {
    const overlay = authEl("div", "login-overlay")

    const modal = authEl("div", "login-modal")
    modal.setAttribute("role", "dialog")
    modal.setAttribute("aria-label", "Log in")

    const closeBtn = authEl("button", "login-close", "\u00d7")
    closeBtn.type = "button"
    closeBtn.setAttribute("aria-label", "Close")

    const title = authEl("h2", null, "Log in")

    const form = authEl("form")

    const userLabel = authEl("label", null, "Username")
    const userInput = authEl("input")
    userInput.name = "username"
    userInput.autocomplete = "username"
    userInput.required = true
    userLabel.appendChild(userInput)

    const passLabel = authEl("label", null, "Password")
    const passInput = authEl("input")
    passInput.type = "password"
    passInput.name = "password"
    passInput.autocomplete = "current-password"
    passInput.required = true
    passLabel.appendChild(passInput)

    const error = authEl("p", "login-error")
    error.hidden = true

    const submit = authEl("button", "btn btn-primary", "Log in")
    submit.type = "submit"

    form.append(userLabel, passLabel, error, submit)
    modal.append(closeBtn, title, form)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    function open() {
        overlay.classList.add("open")
        error.hidden = true
        form.reset()
        document.body.style.overflow = "hidden"
        setTimeout(() => userInput.focus(), 50)
    }

    function close() {
        overlay.classList.remove("open")
        document.body.style.overflow = ""
    }

    closeBtn.addEventListener("click", close)

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close()
    })

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("open")) {
            close()
        }
    })

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        error.hidden = true
        submit.disabled = true

        try {
            const data = await authRequest("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username: userInput.value,
                    password: passInput.value,
                }),
            })
            authCurrentUser = data.username
            updateAuthButton()
            close()
        } catch (err) {
            error.textContent = err.message
            error.hidden = false
        } finally {
            submit.disabled = false
        }
    })

    return { open, close }
}

async function handleAuthButtonClick() {
    if (!authCurrentUser) {
        authModal.open()
        return
    }

    try {
        await authRequest("/api/logout", { method: "POST" })
    } catch (err) {
        console.error(err)
    }
    authCurrentUser = null
    updateAuthButton()
}

async function initAuth() {
    authModal = buildLoginModal()

    const button = document.querySelector(".login-button")
    if (button) {
        button.addEventListener("click", handleAuthButtonClick)
    }

    try {
        const data = await authRequest("/api/me")
        authCurrentUser = data.username
    } catch {
        authCurrentUser = null
    }
    updateAuthButton()
}

initAuth()
