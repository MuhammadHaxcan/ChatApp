const mongoose = require('mongoose');
const Category = require('./models/CategoryModel'); // Make sure the path is correct

// Connect to MongoDB
const connectDB = async () => {
    try {
      // Use the connection string from the environment variables
      const connectionString = 'mongodb://localhost:27017/newChatApp';
  
      // Connect to MongoDB
      await mongoose.connect(connectionString, {});
  
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
      process.exit(1); // Exit the process with failure
    }
  };

// Function to add a new category
const addCategory = async (categoryName, description) => {
    try {
        // Check if the category already exists
        const existingCategory = await Category.findOne({ name: categoryName });
        if (existingCategory) {
            console.log(`Category "${categoryName}" already exists.`);
            return;
        }

        // Create a new category
        const category = new Category({
            name: categoryName,
            description: description || '',
        });
        await category.save();
        console.log(`Category "${categoryName}" added successfully.`);
    } catch (err) {
        console.error('Error adding category:', err);
    } finally {
        mongoose.connection.close(); // Close the MongoDB connection
    }
};

// Main function to execute
const run = async () => {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Please provide a category name and optionally a description.');
        process.exit(1);
    }

    const categoryName = args[0];
    const description = args[1] || '';

    // Connect to the database
    await connectDB();

    // Add the category
    await addCategory(categoryName, description);
};

// Run the script
run();
