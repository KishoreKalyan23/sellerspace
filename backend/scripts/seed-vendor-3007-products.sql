-- Seeds at least 20 categories and 60 products for VendorId = 3007 (Pandian Stores).
-- Safe to re-run: skips any category that already exists by name, and any
-- (VendorId, Name) product pair that already exists.
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

DECLARE @VendorId INT = 3007;

IF NOT EXISTS (SELECT 1 FROM Vendors WHERE VendorId = @VendorId)
BEGIN
    RAISERROR('Vendor %d does not exist.', 16, 1, @VendorId);
    RETURN;
END

-- 1) Categories -------------------------------------------------------------

DECLARE @CategoryNames TABLE (Name NVARCHAR(100));
INSERT INTO @CategoryNames (Name) VALUES
    (N'Electronics'), (N'Clothing'), (N'Home & Kitchen'), (N'Mobile Phones'),
    (N'Laptops'), (N'Footwear'), (N'Beauty & Personal Care'), (N'Groceries'),
    (N'Sports & Fitness'), (N'Toys & Games'), (N'Books & Stationery'),
    (N'Furniture'), (N'Automotive Accessories'), (N'Pet Supplies'),
    (N'Health & Wellness'), (N'Jewelry & Watches'), (N'Bags & Luggage'),
    (N'Musical Instruments'), (N'Garden & Outdoor'), (N'Office Supplies');

INSERT INTO Categories (Name)
SELECT n.Name
FROM @CategoryNames n
WHERE NOT EXISTS (SELECT 1 FROM Categories existing WHERE existing.Name = n.Name);

-- 2) Products (3 per category = 60) -----------------------------------------

DECLARE @Products TABLE (
    CategoryName NVARCHAR(100),
    Name NVARCHAR(200),
    Description NVARCHAR(1000),
    Price DECIMAL(10,2),
    TaxPercent DECIMAL(5,2),
    Stock INT
);

INSERT INTO @Products (CategoryName, Name, Description, Price, TaxPercent, Stock) VALUES
    (N'Electronics', N'Wireless Earbuds', N'Bluetooth 5.3 earbuds with charging case.', 1499.00, 18.00, 40),
    (N'Electronics', N'Smartwatch Fitness Band', N'Heart-rate and sleep tracking smartwatch.', 2199.00, 18.00, 25),
    (N'Electronics', N'Portable Power Bank 10000mAh', N'Fast-charging dual-USB power bank.', 899.00, 18.00, 60),

    (N'Clothing', N'Cotton Crew-Neck T-Shirt', N'Everyday cotton t-shirt, regular fit.', 399.00, 5.00, 100),
    (N'Clothing', N'Slim Fit Denim Jeans', N'Stretchable slim-fit denim jeans.', 1299.00, 5.00, 50),
    (N'Clothing', N'Zippered Hoodie', N'Fleece-lined zip-up hoodie.', 999.00, 5.00, 35),

    (N'Home & Kitchen', N'Non-Stick Frying Pan', N'26cm non-stick frying pan with induction base.', 699.00, 12.00, 30),
    (N'Home & Kitchen', N'Stainless Steel Water Bottle', N'1L insulated stainless steel bottle.', 499.00, 12.00, 45),
    (N'Home & Kitchen', N'LED Table Lamp', N'Adjustable brightness LED desk lamp.', 799.00, 12.00, 20),

    (N'Mobile Phones', N'5G Smartphone 128GB', N'6.5" display, 5000mAh battery, 128GB storage.', 15999.00, 18.00, 15),
    (N'Mobile Phones', N'Tempered Glass Screen Protector', N'9H hardness anti-scratch screen guard.', 199.00, 18.00, 200),
    (N'Mobile Phones', N'Shockproof Phone Case', N'Dual-layer shockproof protective case.', 349.00, 18.00, 90),

    (N'Laptops', N'14-inch Ultrabook 8GB/512GB', N'Lightweight ultrabook with SSD storage.', 42999.00, 18.00, 8),
    (N'Laptops', N'Wireless Mouse', N'Ergonomic wireless mouse with USB receiver.', 599.00, 18.00, 70),
    (N'Laptops', N'Laptop Cooling Pad', N'Dual-fan adjustable laptop cooling stand.', 899.00, 18.00, 25),

    (N'Footwear', N'Running Shoes', N'Breathable mesh running shoes with cushioned sole.', 1799.00, 5.00, 40),
    (N'Footwear', N'Leather Formal Shoes', N'Genuine leather lace-up formal shoes.', 2299.00, 5.00, 20),
    (N'Footwear', N'Flip Flops', N'Lightweight comfort flip flops.', 299.00, 5.00, 80),

    (N'Beauty & Personal Care', N'Herbal Face Wash', N'Neem and tulsi based face wash, 100ml.', 199.00, 12.00, 100),
    (N'Beauty & Personal Care', N'Hair Serum', N'Anti-frizz smoothing hair serum, 50ml.', 349.00, 12.00, 60),
    (N'Beauty & Personal Care', N'Electric Trimmer', N'Cordless rechargeable beard trimmer.', 899.00, 12.00, 30),

    (N'Groceries', N'Basmati Rice 5kg', N'Premium long-grain basmati rice.', 549.00, 0.00, 50),
    (N'Groceries', N'Cold-Pressed Sunflower Oil 1L', N'Refined cold-pressed cooking oil.', 189.00, 0.00, 70),
    (N'Groceries', N'Assorted Dry Fruits 500g', N'Mixed almonds, cashews, and raisins.', 449.00, 0.00, 40),

    (N'Sports & Fitness', N'Yoga Mat', N'6mm anti-slip yoga and exercise mat.', 599.00, 12.00, 55),
    (N'Sports & Fitness', N'Adjustable Dumbbell Set', N'5-20kg adjustable dumbbell pair.', 2499.00, 12.00, 15),
    (N'Sports & Fitness', N'Skipping Rope', N'Speed skipping rope with ball-bearing handles.', 249.00, 12.00, 90),

    (N'Toys & Games', N'Building Blocks Set', N'250-piece creative building blocks.', 799.00, 12.00, 35),
    (N'Toys & Games', N'Remote Control Car', N'Rechargeable RC car, 1:18 scale.', 1299.00, 12.00, 25),
    (N'Toys & Games', N'Board Game - Family Pack', N'Classic family board game for 2-6 players.', 649.00, 12.00, 30),

    (N'Books & Stationery', N'Notebook Pack of 5', N'Ruled A4 notebooks, 200 pages each.', 249.00, 0.00, 100),
    (N'Books & Stationery', N'Gel Pen Set', N'Pack of 10 smooth-writing gel pens.', 149.00, 0.00, 120),
    (N'Books & Stationery', N'Desk Organizer', N'Multi-compartment wooden desk organizer.', 399.00, 12.00, 40),

    (N'Furniture', N'Foldable Study Table', N'Compact foldable study/laptop table.', 1599.00, 12.00, 20),
    (N'Furniture', N'Bookshelf 4-Tier', N'Engineered wood 4-tier bookshelf.', 2799.00, 12.00, 12),
    (N'Furniture', N'Bean Bag Cover', N'XXL bean bag cover, filling not included.', 999.00, 12.00, 25),

    (N'Automotive Accessories', N'Car Phone Mount', N'360-degree rotating dashboard phone mount.', 349.00, 18.00, 60),
    (N'Automotive Accessories', N'Microfiber Car Wash Cloth Set', N'Pack of 6 lint-free microfiber cloths.', 299.00, 18.00, 70),
    (N'Automotive Accessories', N'Tyre Inflator', N'Portable digital tyre pressure inflator.', 1899.00, 18.00, 18),

    (N'Pet Supplies', N'Dog Chew Toy', N'Durable rubber chew toy for medium dogs.', 249.00, 12.00, 50),
    (N'Pet Supplies', N'Cat Litter Box', N'Enclosed odor-control cat litter box.', 999.00, 12.00, 22),
    (N'Pet Supplies', N'Pet Grooming Brush', N'De-shedding grooming brush for dogs and cats.', 349.00, 12.00, 45),

    (N'Health & Wellness', N'Digital Blood Pressure Monitor', N'Automatic upper-arm BP monitor.', 1599.00, 12.00, 20),
    (N'Health & Wellness', N'Multivitamin Tablets (60 count)', N'Daily multivitamin and mineral supplement.', 499.00, 12.00, 60),
    (N'Health & Wellness', N'Digital Weighing Scale', N'Compact digital bathroom weighing scale.', 799.00, 12.00, 30),

    (N'Jewelry & Watches', N'Analog Wrist Watch', N'Stainless steel strap analog watch.', 1299.00, 18.00, 35),
    (N'Jewelry & Watches', N'Gold-Plated Earrings', N'Traditional gold-plated stud earrings.', 899.00, 18.00, 40),
    (N'Jewelry & Watches', N'Men''s Bracelet', N'Stainless steel chain-link bracelet.', 599.00, 18.00, 50),

    (N'Bags & Luggage', N'Laptop Backpack', N'Water-resistant 15.6" laptop backpack.', 1199.00, 18.00, 45),
    (N'Bags & Luggage', N'Trolley Suitcase 24-inch', N'Hardshell trolley suitcase with spinner wheels.', 3499.00, 18.00, 10),
    (N'Bags & Luggage', N'Travel Pouch Set', N'Set of 3 packing organizer pouches.', 449.00, 18.00, 55),

    (N'Musical Instruments', N'Acoustic Guitar', N'Full-size steel-string acoustic guitar.', 5499.00, 18.00, 8),
    (N'Musical Instruments', N'Digital Keyboard 61-Key', N'Portable digital keyboard with 100 tones.', 6999.00, 18.00, 6),
    (N'Musical Instruments', N'Harmonica', N'10-hole diatonic harmonica in C.', 599.00, 18.00, 25),

    (N'Garden & Outdoor', N'Garden Tool Set', N'5-piece hand gardening tool set.', 649.00, 12.00, 30),
    (N'Garden & Outdoor', N'Ceramic Plant Pot', N'Decorative ceramic pot with drainage hole.', 349.00, 12.00, 50),
    (N'Garden & Outdoor', N'Solar Garden Lights (Pack of 4)', N'Waterproof solar-powered pathway lights.', 899.00, 12.00, 35),

    (N'Office Supplies', N'Ergonomic Office Chair', N'Mesh-back ergonomic office chair with lumbar support.', 5999.00, 18.00, 10),
    (N'Office Supplies', N'Wireless Keyboard & Mouse Combo', N'2.4GHz wireless keyboard and mouse set.', 1299.00, 18.00, 35),
    (N'Office Supplies', N'Desk Whiteboard', N'A3-size magnetic desk whiteboard with marker.', 549.00, 18.00, 28);

-- 3) Insert products, joining to (possibly newly created) categories --------

INSERT INTO Products (VendorId, CategoryId, Name, Description, Price, TaxPercent, Stock, IsActive, CreatedAt)
SELECT @VendorId, c.CategoryId, p.Name, p.Description, p.Price, p.TaxPercent, p.Stock, 1, SYSUTCDATETIME()
FROM @Products p
JOIN Categories c ON c.Name = p.CategoryName
WHERE NOT EXISTS (
    SELECT 1 FROM Products existing
    WHERE existing.VendorId = @VendorId AND existing.Name = p.Name
);

SELECT c.Name AS Category, COUNT(*) AS ProductCount
FROM Products p
JOIN Categories c ON c.CategoryId = p.CategoryId
WHERE p.VendorId = @VendorId
GROUP BY c.Name
ORDER BY c.Name;

SELECT COUNT(DISTINCT p.CategoryId) AS TotalCategories, COUNT(*) AS TotalProducts
FROM Products p
WHERE p.VendorId = @VendorId;
