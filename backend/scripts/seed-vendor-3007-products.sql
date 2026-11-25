-- Seeds at least 20 categories and 60 products for VendorId = 3007 (Pandian Stores).
-- Safe to re-run: skips any category that already exists by name, and any
-- (VendorId, Name) product pair that already exists.
-- Run with: psql "<connection string>" -f seed-vendor-3007-products.sql

\set ON_ERROR_STOP on

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Vendors" WHERE "VendorId" = 3007) THEN
        RAISE EXCEPTION 'Vendor % does not exist.', 3007;
    END IF;
END
$$;

-- 1) Categories -------------------------------------------------------------

INSERT INTO "Categories" ("Name")
SELECT n.name
FROM (VALUES
    ('Electronics'), ('Clothing'), ('Home & Kitchen'), ('Mobile Phones'),
    ('Laptops'), ('Footwear'), ('Beauty & Personal Care'), ('Groceries'),
    ('Sports & Fitness'), ('Toys & Games'), ('Books & Stationery'),
    ('Furniture'), ('Automotive Accessories'), ('Pet Supplies'),
    ('Health & Wellness'), ('Jewelry & Watches'), ('Bags & Luggage'),
    ('Musical Instruments'), ('Garden & Outdoor'), ('Office Supplies')
) AS n(name)
WHERE NOT EXISTS (SELECT 1 FROM "Categories" existing WHERE existing."Name" = n.name);

-- 2) Products (3 per category = 60), joined to (possibly newly created) categories

INSERT INTO "Products" ("VendorId", "CategoryId", "Name", "Description", "Price", "TaxPercent", "Stock", "IsActive", "CreatedAt")
SELECT 3007, c."CategoryId", p.name, p.description, p.price, p.tax_percent, p.stock, TRUE, now()
FROM (VALUES
    ('Electronics', 'Wireless Earbuds', 'Bluetooth 5.3 earbuds with charging case.', 1499.00, 18.00, 40),
    ('Electronics', 'Smartwatch Fitness Band', 'Heart-rate and sleep tracking smartwatch.', 2199.00, 18.00, 25),
    ('Electronics', 'Portable Power Bank 10000mAh', 'Fast-charging dual-USB power bank.', 899.00, 18.00, 60),

    ('Clothing', 'Cotton Crew-Neck T-Shirt', 'Everyday cotton t-shirt, regular fit.', 399.00, 5.00, 100),
    ('Clothing', 'Slim Fit Denim Jeans', 'Stretchable slim-fit denim jeans.', 1299.00, 5.00, 50),
    ('Clothing', 'Zippered Hoodie', 'Fleece-lined zip-up hoodie.', 999.00, 5.00, 35),

    ('Home & Kitchen', 'Non-Stick Frying Pan', '26cm non-stick frying pan with induction base.', 699.00, 12.00, 30),
    ('Home & Kitchen', 'Stainless Steel Water Bottle', '1L insulated stainless steel bottle.', 499.00, 12.00, 45),
    ('Home & Kitchen', 'LED Table Lamp', 'Adjustable brightness LED desk lamp.', 799.00, 12.00, 20),

    ('Mobile Phones', '5G Smartphone 128GB', '6.5" display, 5000mAh battery, 128GB storage.', 15999.00, 18.00, 15),
    ('Mobile Phones', 'Tempered Glass Screen Protector', '9H hardness anti-scratch screen guard.', 199.00, 18.00, 200),
    ('Mobile Phones', 'Shockproof Phone Case', 'Dual-layer shockproof protective case.', 349.00, 18.00, 90),

    ('Laptops', '14-inch Ultrabook 8GB/512GB', 'Lightweight ultrabook with SSD storage.', 42999.00, 18.00, 8),
    ('Laptops', 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver.', 599.00, 18.00, 70),
    ('Laptops', 'Laptop Cooling Pad', 'Dual-fan adjustable laptop cooling stand.', 899.00, 18.00, 25),

    ('Footwear', 'Running Shoes', 'Breathable mesh running shoes with cushioned sole.', 1799.00, 5.00, 40),
    ('Footwear', 'Leather Formal Shoes', 'Genuine leather lace-up formal shoes.', 2299.00, 5.00, 20),
    ('Footwear', 'Flip Flops', 'Lightweight comfort flip flops.', 299.00, 5.00, 80),

    ('Beauty & Personal Care', 'Herbal Face Wash', 'Neem and tulsi based face wash, 100ml.', 199.00, 12.00, 100),
    ('Beauty & Personal Care', 'Hair Serum', 'Anti-frizz smoothing hair serum, 50ml.', 349.00, 12.00, 60),
    ('Beauty & Personal Care', 'Electric Trimmer', 'Cordless rechargeable beard trimmer.', 899.00, 12.00, 30),

    ('Groceries', 'Basmati Rice 5kg', 'Premium long-grain basmati rice.', 549.00, 0.00, 50),
    ('Groceries', 'Cold-Pressed Sunflower Oil 1L', 'Refined cold-pressed cooking oil.', 189.00, 0.00, 70),
    ('Groceries', 'Assorted Dry Fruits 500g', 'Mixed almonds, cashews, and raisins.', 449.00, 0.00, 40),

    ('Sports & Fitness', 'Yoga Mat', '6mm anti-slip yoga and exercise mat.', 599.00, 12.00, 55),
    ('Sports & Fitness', 'Adjustable Dumbbell Set', '5-20kg adjustable dumbbell pair.', 2499.00, 12.00, 15),
    ('Sports & Fitness', 'Skipping Rope', 'Speed skipping rope with ball-bearing handles.', 249.00, 12.00, 90),

    ('Toys & Games', 'Building Blocks Set', '250-piece creative building blocks.', 799.00, 12.00, 35),
    ('Toys & Games', 'Remote Control Car', 'Rechargeable RC car, 1:18 scale.', 1299.00, 12.00, 25),
    ('Toys & Games', 'Board Game - Family Pack', 'Classic family board game for 2-6 players.', 649.00, 12.00, 30),

    ('Books & Stationery', 'Notebook Pack of 5', 'Ruled A4 notebooks, 200 pages each.', 249.00, 0.00, 100),
    ('Books & Stationery', 'Gel Pen Set', 'Pack of 10 smooth-writing gel pens.', 149.00, 0.00, 120),
    ('Books & Stationery', 'Desk Organizer', 'Multi-compartment wooden desk organizer.', 399.00, 12.00, 40),

    ('Furniture', 'Foldable Study Table', 'Compact foldable study/laptop table.', 1599.00, 12.00, 20),
    ('Furniture', 'Bookshelf 4-Tier', 'Engineered wood 4-tier bookshelf.', 2799.00, 12.00, 12),
    ('Furniture', 'Bean Bag Cover', 'XXL bean bag cover, filling not included.', 999.00, 12.00, 25),

    ('Automotive Accessories', 'Car Phone Mount', '360-degree rotating dashboard phone mount.', 349.00, 18.00, 60),
    ('Automotive Accessories', 'Microfiber Car Wash Cloth Set', 'Pack of 6 lint-free microfiber cloths.', 299.00, 18.00, 70),
    ('Automotive Accessories', 'Tyre Inflator', 'Portable digital tyre pressure inflator.', 1899.00, 18.00, 18),

    ('Pet Supplies', 'Dog Chew Toy', 'Durable rubber chew toy for medium dogs.', 249.00, 12.00, 50),
    ('Pet Supplies', 'Cat Litter Box', 'Enclosed odor-control cat litter box.', 999.00, 12.00, 22),
    ('Pet Supplies', 'Pet Grooming Brush', 'De-shedding grooming brush for dogs and cats.', 349.00, 12.00, 45),

    ('Health & Wellness', 'Digital Blood Pressure Monitor', 'Automatic upper-arm BP monitor.', 1599.00, 12.00, 20),
    ('Health & Wellness', 'Multivitamin Tablets (60 count)', 'Daily multivitamin and mineral supplement.', 499.00, 12.00, 60),
    ('Health & Wellness', 'Digital Weighing Scale', 'Compact digital bathroom weighing scale.', 799.00, 12.00, 30),

    ('Jewelry & Watches', 'Analog Wrist Watch', 'Stainless steel strap analog watch.', 1299.00, 18.00, 35),
    ('Jewelry & Watches', 'Gold-Plated Earrings', 'Traditional gold-plated stud earrings.', 899.00, 18.00, 40),
    ('Jewelry & Watches', 'Men''s Bracelet', 'Stainless steel chain-link bracelet.', 599.00, 18.00, 50),

    ('Bags & Luggage', 'Laptop Backpack', 'Water-resistant 15.6" laptop backpack.', 1199.00, 18.00, 45),
    ('Bags & Luggage', 'Trolley Suitcase 24-inch', 'Hardshell trolley suitcase with spinner wheels.', 3499.00, 18.00, 10),
    ('Bags & Luggage', 'Travel Pouch Set', 'Set of 3 packing organizer pouches.', 449.00, 18.00, 55),

    ('Musical Instruments', 'Acoustic Guitar', 'Full-size steel-string acoustic guitar.', 5499.00, 18.00, 8),
    ('Musical Instruments', 'Digital Keyboard 61-Key', 'Portable digital keyboard with 100 tones.', 6999.00, 18.00, 6),
    ('Musical Instruments', 'Harmonica', '10-hole diatonic harmonica in C.', 599.00, 18.00, 25),

    ('Garden & Outdoor', 'Garden Tool Set', '5-piece hand gardening tool set.', 649.00, 12.00, 30),
    ('Garden & Outdoor', 'Ceramic Plant Pot', 'Decorative ceramic pot with drainage hole.', 349.00, 12.00, 50),
    ('Garden & Outdoor', 'Solar Garden Lights (Pack of 4)', 'Waterproof solar-powered pathway lights.', 899.00, 12.00, 35),

    ('Office Supplies', 'Ergonomic Office Chair', 'Mesh-back ergonomic office chair with lumbar support.', 5999.00, 18.00, 10),
    ('Office Supplies', 'Wireless Keyboard & Mouse Combo', '2.4GHz wireless keyboard and mouse set.', 1299.00, 18.00, 35),
    ('Office Supplies', 'Desk Whiteboard', 'A3-size magnetic desk whiteboard with marker.', 549.00, 18.00, 28)
) AS p(category_name, name, description, price, tax_percent, stock)
JOIN "Categories" c ON c."Name" = p.category_name
WHERE NOT EXISTS (
    SELECT 1 FROM "Products" existing
    WHERE existing."VendorId" = 3007 AND existing."Name" = p.name
);

COMMIT;

SELECT c."Name" AS "Category", COUNT(*) AS "ProductCount"
FROM "Products" p
JOIN "Categories" c ON c."CategoryId" = p."CategoryId"
WHERE p."VendorId" = 3007
GROUP BY c."Name"
ORDER BY c."Name";

SELECT COUNT(DISTINCT p."CategoryId") AS "TotalCategories", COUNT(*) AS "TotalProducts"
FROM "Products" p
WHERE p."VendorId" = 3007;
