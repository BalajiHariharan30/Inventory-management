import User from '../modules/user/user.model';
import Product from '../modules/product/product.model';
import Category from '../modules/category/category.model';
import Brand from '../modules/brand/brand.model';
import Seller from '../modules/seller/seller.model';
import Sale from '../modules/sale/sale.model';
import Purchase from '../modules/purchase/purchase.model';

export const seedDatabase = async () => {
  try {
    // Check if the specific admin user already exists and products are populated
    const adminExists = await User.findOne({ email: 'admin@stockflow.in' });
    const productCount = await Product.countDocuments();
    
    if (adminExists && adminExists.city === 'Trichy' && productCount > 0) {
      console.log('✅ Admin account admin@stockflow.in (Trichy) and stock products already exist. Skipping seeding.');
      return;
    }

    console.log('🌱 Cleaning old data and seeding database with admin@stockflow.in & Indian inventory stock...');

    // Clear previous seed attempts/collections to prevent duplicate validation errors
    await User.deleteMany({ email: 'admin@stockflow.in' });
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Seller.deleteMany({});
    await Sale.deleteMany({});
    await Purchase.deleteMany({});

    // 1. Create Default Master User
    const adminUser = await User.create({
      name: 'Balaji Hariharan',
      email: 'admin@stockflow.in',
      password: 'admin123', // Automatically hashed by User model pre-save hook
      title: 'Warehouse Director',
      description: 'Managing director of Trichy Regional Warehouse stock logs.',
      avatar: '',
      role: 'USER',
      status: 'ACTIVE',
      address: 'Trichy, Tamil Nadu, India',
      phone: '+91 98765 43210',
      city: 'Trichy',
      country: 'India'
    });

    const userId = adminUser._id;
    console.log(`👤 Seeded User: ${adminUser.email} (Password: admin123)`);

    // 2. Create Categories
    const catDairy = await Category.create({ name: 'Dairy & Eggs', user: userId });
    const catGroceries = await Category.create({ name: 'Groceries & Staples', user: userId });
    const catSnacks = await Category.create({ name: 'Snacks & Beverages', user: userId });
    console.log('📦 Seeded Categories');

    // 3. Create Sellers (Using contactNo as required by the schema)
    const sellerAmul = await Seller.create({ name: 'Amul Cooperative India', email: 'sales@amul.coop', contactNo: '+9122267384', address: 'Anand, Gujarat', user: userId });
    const sellerTata = await Seller.create({ name: 'Tata Consumer Distributors', email: 'dist@tata.com', contactNo: '+9144283940', address: 'Mumbai, Maharashtra', user: userId });
    const sellerITC = await Seller.create({ name: 'ITC Wholesale Logistics', email: 'wholesale@itc.in', contactNo: '+9133228890', address: 'Kolkata, West Bengal', user: userId });
    console.log('🏢 Seeded Sellers');

    // 4. Create Brands
    const brandAmul = await Brand.create({ name: 'Amul', user: userId });
    const brandTata = await Brand.create({ name: 'Tata', user: userId });
    const brandITC = await Brand.create({ name: 'ITC Aashirvaad', user: userId });
    const brandParle = await Brand.create({ name: 'Parle Products', user: userId });
    console.log('🏷️ Seeded Brands');

    // 5. Create Indian Products (some low stock to trigger warnings)
    const prodAmulButter = await Product.create({
      name: 'Amul Salted Butter (500g)',
      price: 275,
      stock: 85,
      seller: sellerAmul._id,
      category: catDairy._id,
      brand: brandAmul._id,
      size: 'MEDIUM',
      description: 'Premium salted table butter from Anand dairy.',
      user: userId
    });

    const prodAmulMilk = await Product.create({
      name: 'Amul Taaza Toned Milk (1L)',
      price: 72,
      stock: 150,
      seller: sellerAmul._id,
      category: catDairy._id,
      brand: brandAmul._id,
      size: 'LARGE',
      description: 'Homogenized toned long-life milk.',
      user: userId
    });

    const prodTataSalt = await Product.create({
      name: 'Tata Iodized Salt (1kg)',
      price: 28,
      stock: 200,
      seller: sellerTata._id,
      category: catGroceries._id,
      brand: brandTata._id,
      size: 'MEDIUM',
      description: 'Desh ka Namak - vacuum evaporated iodized salt.',
      user: userId
    });

    const prodTataTea = await Product.create({
      name: 'Tata Tea Premium (1kg)',
      price: 420,
      stock: 45,
      seller: sellerTata._id,
      category: catGroceries._id,
      brand: brandTata._id,
      size: 'LARGE',
      description: 'Premium blend black tea leaves.',
      user: userId
    });

    const prodITCAtta = await Product.create({
      name: 'Aashirvaad Shudh Chakki Atta (10kg)',
      price: 460,
      stock: 120,
      seller: sellerITC._id,
      category: catGroceries._id,
      brand: brandITC._id,
      size: 'LARGE',
      description: '100% MP Shudh whole wheat chakki flour.',
      user: userId
    });

    const prodParleG = await Product.create({
      name: 'Parle-G Gold Gluco Biscuits (200g)',
      price: 15,
      stock: 300,
      seller: sellerITC._id,
      category: catSnacks._id,
      brand: brandParle._id,
      size: 'SMALL',
      description: 'The world\'s largest selling glucose biscuit.',
      user: userId
    });

    // LOW STOCK PRODUCTS
    const prodHaldiram = await Product.create({
      name: 'Haldiram Bhujia Sev (400g)',
      price: 110,
      stock: 9, // < 10, low stock warning!
      seller: sellerITC._id,
      category: catSnacks._id,
      brand: brandITC._id,
      size: 'MEDIUM',
      description: 'Crispy fried tepary bean and chickpea flour noodles.',
      user: userId
    });

    const prodTataTurmeric = await Product.create({
      name: 'Tata Sampann Turmeric Powder (200g)',
      price: 90,
      stock: 4, // < 10, low stock warning!
      seller: sellerTata._id,
      category: catGroceries._id,
      brand: brandTata._id,
      size: 'SMALL',
      description: 'Natural oil intact turmeric powder.',
      user: userId
    });

    console.log('🛍️ Seeded Indian Products (including low-stock warnings)');

    // 6. Create Sales Logs
    const daysAgo = (num: number) => {
      const d = new Date();
      d.setDate(d.getDate() - num);
      return d;
    };

    await Sale.create([
      {
        user: userId,
        product: prodAmulButter._id,
        productName: prodAmulButter.name,
        productPrice: prodAmulButter.price,
        quantity: 15,
        totalPrice: prodAmulButter.price * 15,
        buyerName: 'Ramesh Kumar',
        date: daysAgo(10)
      },
      {
        user: userId,
        product: prodTataSalt._id,
        productName: prodTataSalt.name,
        productPrice: prodTataSalt.price,
        quantity: 50,
        totalPrice: prodTataSalt.price * 50,
        buyerName: 'Suresh Sharma',
        date: daysAgo(7)
      },
      {
        user: userId,
        product: prodITCAtta._id,
        productName: prodITCAtta.name,
        productPrice: prodITCAtta.price,
        quantity: 8,
        totalPrice: prodITCAtta.price * 8,
        buyerName: 'Anjali Gupta',
        date: daysAgo(5)
      },
      {
        user: userId,
        product: prodParleG._id,
        productName: prodParleG.name,
        productPrice: prodParleG.price,
        quantity: 120,
        totalPrice: prodParleG.price * 120,
        buyerName: 'Priya Singh',
        date: daysAgo(2)
      },
      {
        user: userId,
        product: prodTataTea._id,
        productName: prodTataTea.name,
        productPrice: prodTataTea.price,
        quantity: 10,
        totalPrice: prodTataTea.price * 10,
        buyerName: 'Amit Mishra',
        date: daysAgo(1)
      }
    ]);
    console.log('📈 Seeded Sales Logs');

    // 7. Create Purchase Logs
    await Purchase.create([
      {
        user: userId,
        seller: sellerAmul._id,
        product: prodAmulButter._id,
        sellerName: sellerAmul.name,
        productName: prodAmulButter.name,
        quantity: 100,
        unitPrice: prodAmulButter.price,
        totalPrice: prodAmulButter.price * 100,
        paid: 27500,
        createdAt: daysAgo(15)
      },
      {
        user: userId,
        seller: sellerTata._id,
        product: prodTataSalt._id,
        sellerName: sellerTata.name,
        productName: prodTataSalt.name,
        quantity: 250,
        unitPrice: prodTataSalt.price,
        totalPrice: prodTataSalt.price * 250,
        paid: 7000,
        createdAt: daysAgo(12)
      },
      {
        user: userId,
        seller: sellerITC._id,
        product: prodITCAtta._id,
        sellerName: sellerITC.name,
        productName: prodITCAtta.name,
        quantity: 128,
        unitPrice: prodITCAtta.price,
        totalPrice: prodITCAtta.price * 128,
        paid: 50000, // Due: 8880
        createdAt: daysAgo(9)
      }
    ]);
    console.log('🗒️ Seeded Purchase Logs');
    console.log('🎉 Seeding successfully completed! App is pre-populated.');
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
  }
};
