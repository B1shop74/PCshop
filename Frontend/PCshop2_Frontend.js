const CART_KEY = "pcshop_cart"
 
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || []
    } catch {
        return []
    }
}
 
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
}
 
function toNumber(price) {
    if (typeof price === "number") return price
    const n = parseFloat(String(price).replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) ? n : 0
}
 
function formatPrice(value) {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" })
}
 
function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
}
 
function changeQty(id, delta) {
    const cart = loadCart()
    const item = cart.find(i => i.id === id)
    if (!item) return
 
    item.qty += delta
    saveCart(cart.filter(i => i.qty > 0))
    render()
}
 
function removeItem(id) {
    saveCart(loadCart().filter(i => i.id !== id))
    render()
}
 
function createCartItem(item) {
    const row = el("div", "cart-item")
 
    const img = el("img")
    img.src = item.image
    img.alt = item.name
 
    const info = el("div")
    info.appendChild(el("div", "cart-item-name", item.name))
    info.appendChild(el("div", "cart-item-price", formatPrice(toNumber(item.price))))
 
    const qty = el("div", "cart-qty")
    const minus = el("button", null, "−")
    minus.type = "button"
    minus.addEventListener("click", () => changeQty(item.id, -1))
    const plus = el("button", null, "+")
    plus.type = "button"
    plus.addEventListener("click", () => changeQty(item.id, 1))
    qty.appendChild(minus)
    qty.appendChild(el("span", null, String(item.qty)))
    qty.appendChild(plus)
 
    const lineTotal = el("div", "cart-line-total", formatPrice(toNumber(item.price) * item.qty))
 
    const remove = el("button", "cart-remove", "×")
    remove.type = "button"
    remove.title = "Remove"
    remove.addEventListener("click", () => removeItem(item.id))
 
    row.append(img, info, qty, lineTotal, remove)
    return row
}
 
function render() {
    const cart = loadCart()
    const list = document.getElementById("cart-list")
    const summary = document.getElementById("cart-summary")
 
    list.replaceChildren()
    document.getElementById("cart-note").textContent = ""
 
    if (cart.length === 0) {
        list.appendChild(el("p", "cart-empty", "Your cart is empty."))
        summary.hidden = true
        return
    }
 
    let total = 0
    for (const item of cart) {
        list.appendChild(createCartItem(item))
        total += toNumber(item.price) * item.qty
    }
 
    document.getElementById("cart-total").textContent = formatPrice(total)
    summary.hidden = false
}
 
document.getElementById("cart-clear").addEventListener("click", () => {
    saveCart([])
    render()
})
 
document.getElementById("cart-checkout").addEventListener("click", () => {
    document.getElementById("cart-note").textContent = "Checkout is not implemented yet."
})
 
render()
 
