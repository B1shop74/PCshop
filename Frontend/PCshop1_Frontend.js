const API_BASE = "http://127.0.0.1:8000"
const CART_KEY = "pcshop_cart"

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="190">' +
    '<rect width="100%" height="100%" fill="#f0f1f2"/>' +
    '<text x="50%" y="50%" fill="#9aa0a6" font-family="Arial" font-size="14" ' +
    'text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
)

let currentQuery = ""
let currentCategories = []

async function getProductsByPopular() {
    const response = await fetch(`${API_BASE}/api/product/popular`)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
}

async function getProductsBySearch() {
    const params = new URLSearchParams()

    if (currentQuery) {
        params.set("q", currentQuery)
    }
    for (const category of currentCategories) {
        params.append("category", category)
    }

    const response = await fetch(`${API_BASE}/api/product/search?${params}`)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
}

function resolveImageUrl(path) {
    if (!path) return PLACEHOLDER_IMG
    if (/^(https?:|data:)/.test(path)) return path
    return API_BASE + (path.startsWith("/") ? "" : "/") + path
}

function formatPrice(price) {
    if (typeof price === "number") {
        return price.toLocaleString("en-US", { style: "currency", currency: "USD" })
    }
    return price
}

function addToCart(product) {
    let cart = []
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
        cart = []
    }

    const id = product.id ?? product.name
    const existing = cart.find(item => item.id === id)

    if (existing) {
        existing.qty += 1
    } else {
        cart.push({
            id,
            name: product.name,
            price: product.price,
            image: resolveImageUrl(product.image),
            qty: 1,
        })
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

function createProductCard(product) {
    const divMain = document.getElementById("products")

    const divCard = document.createElement("div")
    divCard.classList.add("product-card")

    const imgProduct = document.createElement("img")
    imgProduct.classList.add("product-image")
    imgProduct.src = resolveImageUrl(product.image)
    imgProduct.alt = product.name || "product image"
    imgProduct.onerror = () => {
        imgProduct.onerror = null
        imgProduct.src = PLACEHOLDER_IMG
    }

    const divInfo = document.createElement("div")
    divInfo.classList.add("product-info")

    const h3Name = document.createElement("h3")
    h3Name.classList.add("product-name")
    h3Name.textContent = product.name

    const pDescription = document.createElement("p")
    pDescription.classList.add("product-description")
    pDescription.textContent = product.description

    const divBottom = document.createElement("div")
    divBottom.classList.add("product-bottom")

    const spanPrice = document.createElement("span")
    spanPrice.classList.add("product-price")
    spanPrice.textContent = formatPrice(product.price)

    const buttonBuy = document.createElement("button")
    buttonBuy.classList.add("product-buy")
    buttonBuy.textContent = "Buy now"
    buttonBuy.addEventListener("click", () => {
        addToCart(product)
        buttonBuy.textContent = "Added \u2713"
        setTimeout(() => { buttonBuy.textContent = "Buy now" }, 1000)
    })

    divMain.appendChild(divCard)
    divCard.appendChild(imgProduct)
    divCard.appendChild(divInfo)
    divInfo.appendChild(h3Name)
    divInfo.appendChild(pDescription)
    divInfo.appendChild(divBottom)
    divBottom.appendChild(spanPrice)
    divBottom.appendChild(buttonBuy)

    return divCard
}

function showMessage(text) {
    const p = document.createElement("p")
    p.textContent = text
    p.style.gridColumn = "1 / -1"
    p.style.color = "var(--muted)"
    document.getElementById("products").appendChild(p)
}

function renderProducts(products, filtered) {
    const grid = document.getElementById("products")
    grid.replaceChildren()

    if (products.length === 0) {
        showMessage(filtered
            ? "Nothing found. Try a different search or fewer filters."
            : "No products yet.")
        return
    }

    for (const product of products) {
        createProductCard(product)
    }
}

async function loadProducts(filtered = false) {
    try {
        const products = filtered
            ? await getProductsBySearch()
            : await getProductsByPopular()

        renderProducts(products, filtered)
    } catch (err) {
        console.error(err)
        document.getElementById("products").replaceChildren()
        showMessage("Could not load products. Is the backend running?")
    }
}

function initSearchForm() {
    const form = document.getElementById("search")
    const input = form.querySelector("input")

    form.addEventListener("submit", (event) => {
        event.preventDefault()
        currentQuery = input.value.trim()
        loadProducts(true)
    })
}

function initFilterForm() {
    const form = document.querySelector(".filters form")

    form.addEventListener("submit", (event) => {
        event.preventDefault()
        currentCategories = [...form.querySelectorAll('input[name="category"]:checked')]
            .map(checkbox => checkbox.value)
        loadProducts(true)
    })
}

function main() {
    initSearchForm()
    initFilterForm()
    loadProducts(false)
}

main()
