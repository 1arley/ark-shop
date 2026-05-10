# ark-games-shop

A modern digital storefront for games, software licenses, and digital products built with Next.js 15, React 19, and TypeScript.

## Features

- **Digital Products**: Sell Steam keys, Office licenses, Windows licenses, gift cards, and subscriptions
- **Modern UI**: Clean, neutral design that works for both gaming and productivity software
- **Responsive**: Fully responsive design for desktop, tablet, and mobile
- **Fast Performance**: Optimized with Next.js 15 and static generation
- **Secure Checkout**: Modern payment flow with order confirmation
- **User Dashboard**: Order history and account management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

Clone the repository:

```bash
git clone https://github.com/yourusername/ark-games-shop.git
```

Navigate to the project directory:

```bash
cd ark-games-shop
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ark-games-shop/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── products/          # Product listing & details
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── login/             # Authentication
│   │   ├── register/          # User registration
│   │   ├── dashboard/         # User dashboard
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact form
│   │   └── categories/        # Categories browser
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                     # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

## Pages

- **Home** (`/`) - Landing page with featured products and categories
- **Products** (`/products`) - Browse all products with search and filters
- **Product Details** (`/products/[slug]`) - Individual product page
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - Secure checkout process
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Create new account
- **Dashboard** (`/dashboard`) - Order history and account details
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form
- **Categories** (`/categories`) - Browse by category

## Building for Production

Create an optimized production build:

```bash
npm run build
```

Preview production build:

```bash
npm run start
```

## Code Quality

Run ESLint:

```bash
npm run lint
```

## Features

### Products Support

- Steam keys
- Microsoft Office licenses
- Windows operating system licenses
- Gift cards (Steam, Discord, etc.)
- Game subscriptions
- Digital software licenses

### Product Metadata

- Title & description
- Pricing & discounts
- Stock status
- Platform information
- Regional activation info
- Customer ratings & reviews
- Delivery type (instant digital)

## Styling

The design follows a neutral, modern aesthetic that balances:
- Digital commerce professionalism
- Gentle gaming marketplace feel
- Clean contemporary web design

Color palette uses neutral backgrounds with violet sky, and emeral accents for a trustworthy, professional appearance.

## License

MIT License - feel free to use this template for your projects.