from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
import secrets

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PRODUCTS = [
    {
        "id": 1, "category": "gpu",
        "name": "GeForce RTX 4070 12GB",
        "description": "12 GB GDDR6X, DLSS 3",
        "price": 599.99,
        "image": "https://kccshop.vn/media/product/250-11917-vga-asus-dual-geforce-rtx-4070-evo-12gb-gddr6x--dual-rtx4070-12g-evo-_1_main.jpeg",
        "sales": 120
    },
    {
        "id": 2, "category": "gpu",
        "name": "Radeon RX 7800 XT 16GB",
        "description": "16 GB GDDR6, RDNA 3",
        "price": 499.99,
        "image": "https://content2.rozetka.com.ua/goods/images/big/328763858.jpg",
        "sales": 95
    },
    {
        "id": 3, "category": "cpu",
        "name": "Ryzen 7 7800X3D",
        "description": "8 cores, 3D V-Cache, AM5",
        "price": 399.00,
        "image": "https://i.ebayimg.com/images/g/tOsAAeSwlnto7pKE/s-l1200.jpg",
        "sales": 150
    },
    {
        "id": 4, "category": "cpu",
        "name": "Core i5-14600K",
        "description": "14 cores, LGA1700",
        "price": 319.00,
        "image": "https://kkomputer.com/10553-thickbox_default/processor-intel-core-i5-14600k-53-ghz-1420t-lga-1700.jpg",
        "sales": 80
    },
    {
        "id": 5, "category": "ram",
        "name": "Kingston Fury 32GB DDR5",
        "description": "2x16 GB, 6000 MHz",
        "price": 109.90,
        "image": "https://item-shopping.c.yimg.jp/i/n/etrend-y_1272161",
        "sales": 110
    },
    {
        "id": 6, "category": "ssd",
        "name": "Samsung 990 Pro 1TB",
        "description": "NVMe PCIe 4.0, 7450 MB/s",
        "price": 119.00,
        "image": "https://prod.scorptec.com.au/35/1039/105825/303848_large.jpg",
        "sales": 140
    },
    {
        "id": 7, "category": "motherboards",
        "name": "ASUS TUF B650-PLUS",
        "description": "AM5, DDR5, ATX",
        "price": 189.00,
        "image": "https://media.ldlc.com/r1600/ld/products/00/05/98/60/LD0005986038.jpg",
        "sales": 70
    },
    {
        "id": 8, "category": "coolers",
        "name": "Noctua NH-D15",
        "description": "Dual-tower air cooler",
        "price": 109.95,
        "image": "https://cdn.mwave.com.au/images/400/AB55040.jpg",
        "sales": 60
    },
    {
        "id": 9, "category": "power-supplies",
        "name": "Corsair RM850x",
        "description": "850 W, 80+ Gold, modular",
        "price": 139.99,
        "image": "https://static.msystems.gr/photos/big_photos/49206.jpg",
        "sales": 90
    },
    {
        "id": 10, "category": "cases",
        "name": "Lian Li Lancool 216",
        "description": "Mid tower, mesh front",
        "price": 99.00,
        "image": "https://cdn.shopify.com/s/files/1/0562/7713/9620/files/2e0132fb3dd61f704ba3754b909a06e3.webp?v=1737119592",
        "sales": 55
    },
    {
        "id": 11, "category": "ready-made-pcs",
        "name": "Gaming PC Ryzen 5 / RTX 4060",
        "description": "16 GB RAM, 1 TB SSD",
        "price": 1099.00,
        "image": "https://ecommerce.datablitz.com.ph/cdn/shop/files/Alpha-Vesta-White-Gaming-PC.jpg?v=1753405755",
        "sales": 40
    },
    {
        "id": 12, "category": "ready-made-pcs",
        "name": "Office PC Core i3 / 16GB",
        "description": "512 GB SSD, Wi-Fi",
        "price": 549.00,
        "image": "https://media.cdn.kaufland.de/product-images/1024x1024/41d94428e9c5f9ef41f57215b50e4069.jpg",
        "sales": 35
    }
]



@app.get("/api/product/popular")
def popular(limit: int = 12):
    return sorted(PRODUCTS, key=lambda p: p["sales"], reverse=True)[:limit]


@app.get("/api/product/search")
def search(q: str = "", category: list[str] = Query(default=[])):
    q = q.strip().lower()
    return [
        p for p in PRODUCTS
        if (not category or p["category"] in category)
        and (not q or q in p["name"].lower() or q in p["description"].lower())
    ]


# ==================== AUTH ====================

USERS = {
    "admin": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    "user": "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446",
}

SESSIONS = {}

SESSION_COOKIE = "pcshop_session"
SESSION_MAX_AGE = 7 * 24 * 3600


class LoginBody(BaseModel):
    username: str
    password: str


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_session_user(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    return SESSIONS.get(token)


@app.post("/api/login")
def login(body: LoginBody):
    username = body.username.strip().lower()
    stored = USERS.get(username)

    if stored is None or stored != hash_password(body.password):
        return JSONResponse(
            {"error": "Invalid username or password"},
            status_code=401,
        )

    token = secrets.token_urlsafe(32)
    SESSIONS[token] = username

    response = JSONResponse({"username": username})
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
    )
    return response


@app.post("/api/logout")
def logout(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        SESSIONS.pop(token, None)

    response = JSONResponse({"ok": True})
    response.delete_cookie(SESSION_COOKIE)
    return response


@app.get("/api/me")
def me(request: Request):
    username = get_session_user(request)
    if not username:
        return JSONResponse({"error": "Not logged in"}, status_code=401)
    return {"username": username}
