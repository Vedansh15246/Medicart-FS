import os

BASE_DIR = "src"

folders = [
    "api",
    "components/layout",
    "components/ui",
    "features/auth-prescription",
    "features/catalog-admin",
    "features/cart-orders",
    "features/checkout-billing",
    "features/admin-analytics",
    "routes",
    "store",
    "styles"
]

files = {
    "src/main.jsx": "",
    "src/App.jsx": "",
    "src/index.css": "",

    "src/api/client.js": "",

    "src/components/layout/Header.jsx": "",
    "src/components/layout/Footer.jsx": "",
    "src/components/layout/AdminSidebar.jsx": "",

    "src/components/ui/Loader.jsx": "",

    "src/routes/AppRoutes.jsx": "",
    "src/routes/ProtectedRoute.jsx": "",
    "src/routes/AdminRoute.jsx": "",

    "src/store/store.js": "",
    "src/store/rootReducer.js": "",

    "src/styles/vars.css": "",
    "src/styles/main.css": """@tailwind base;
@tailwind components;
@tailwind utilities;
""",

    "src/features/auth-prescription/index.jsx": "",
    "src/features/catalog-admin/index.jsx": "",
    "src/features/cart-orders/index.jsx": "",
    "src/features/checkout-billing/index.jsx": "",
    "src/features/admin-analytics/index.jsx": "",

    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2fbf5d",
      }
    },
  },
  plugins: [],
}
""",

    "postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""
}

def create_structure():
    print("📁 Creating folders...")
    for folder in folders:
        os.makedirs(os.path.join(BASE_DIR, folder), exist_ok=True)

    print("📄 Creating files...")
    for path, content in files.items():
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

    print("\n✅ MediCart frontend + Tailwind setup completed!")
    print("👉 Next run: npm install -D tailwindcss postcss autoprefixer")
    print("👉 Then: npx tailwindcss init -p (ONLY if config missing)")

if __name__ == "__main__":
    create_structure()
