# 🔧 HANDYLAND Repair Management System

نظام ERP احترافي لإدارة محلات صيانة الهواتف المحمولة، مبني بتقنيات حديثة.

## 🚀 الميزات

- ✅ كشك رقمي للعملاء (Tablet-optimized)
- ✅ لوحة إدارة شاملة للموظفين
- ✅ نظام CRM متكامل
- ✅ تتبع حالة الإصلاح بـ QR Code
- ✅ برنامج ولاء للعملاء
- ✅ إصدار PDF تلقائي للإيصالات
- ✅ دعم 4 لغات (DE, EN, AR, TR)

## 🛠 التقنيات المستخدمة

- **Frontend**: Next.js 15, TypeScript, TailwindCSS v4
- **Backend**: Next.js Server Actions, NextAuth
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Monorepo**: Turborepo
- **UI Library**: Shadcn UI + Framer Motion

## ⚙️ التنصيب

```bash
# Clone the repository
git clone https://github.com/mustafamuhammed29/handyland-erp.git
cd handyland-erp

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development servers
npm run dev
```

## 📦 الهيكل

```
handyland-erp/
├── apps/
│   ├── kiosk/          # Customer-facing tablet app (port 3000)
│   └── admin/          # Staff dashboard (port 3001)
├── packages/
│   ├── database/       # Shared Prisma schema
│   ├── ui/             # Shared React components
│   ├── eslint-config/  # ESLint configs
│   └── typescript-config/ # TypeScript configs
```

## 🌐 Ports

- **Kiosk**: http://localhost:3000
- **Admin**: http://localhost:3001

## 📄 License

Private — © 2026 HANDYLAND
