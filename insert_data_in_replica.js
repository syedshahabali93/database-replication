const { MongoClient } = require('mongodb');

// MongoDB connection URL (use environment variable for Docker)
const url = "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0";
const dbName = 'testDB';  // Change to your DB name
const client = new MongoClient(url, { readPreference: "secondary" });

async function insertData() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const blogsCollection = db.collection('blogs');
        const commentsCollection = db.collection('comments');

        // Generate Users (10 users)
        const users = [];
        for (let i = 0; i < 10; i++) {
            users.push({
                username: `user${i + 1}`,
                email: `user${i + 1}@example.com`,
                createdAt: new Date(),
            });
        }
        await usersCollection.insertMany(users);
        console.log(`${users.length} users inserted.`);

        // Generate Blogs (100 blogs, each referencing a user)
        const userIds = await usersCollection.find({}).toArray();  // Get all user IDs
        console.log(JSON.stringify(userIds));
        
        const blogs = [];
        for (let i = 0; i < 100; i++) {
            const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
            blogs.push({
                title: `Blog Title ${i + 1}`,
                content: `This is the content of blog post ${i + 1}`,
                createdAt: new Date(),
                user_id: randomUser._id,
            });
        }
        await blogsCollection.insertMany(blogs);
        console.log(`${blogs.length} blogs inserted.`);

        // Generate Comments (100,000 comments, each referencing a blog and user)
        const blogIds = await blogsCollection.find({}).toArray();  // Get all blog IDs
        console.log(JSON.stringify(blogIds));
        
        const comments = [];
        for (let i = 0; i < 100000; i++) {
            const randomBlog = blogIds[Math.floor(Math.random() * blogIds.length)];
            const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
            comments.push({
                content: `This is comment number ${i + 1} on blog ${randomBlog.title}`,
                createdAt: new Date(),
                blog_id: randomBlog._id,
                user_id: randomUser._id,
            });
        }
        await commentsCollection.insertMany(comments);
        console.log(`${comments.length} comments inserted successfully!`);

    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await client.close();
    }
}

insertData().catch(console.error);
