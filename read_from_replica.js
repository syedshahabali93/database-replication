const { MongoClient } = require("mongodb");

const url =
  "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0";
const client = new MongoClient(url, { readPreference: "secondary" });

async function offloadReads() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Replica Set");

    const db = client.db("testDB");
    const collection = db.collection("blogs");

    // const collections = await db.listCollections().toArray();
    // console.log(collections);

    // for (const collection of collections) {
    //   await db.collection(collection.name).drop();
    //   console.log(`Dropped collection: ${collection.name}`);
    // }

    // Simulate read operation
    const start = Date.now();

    // Aggregation pipeline
    const pipeline = [
        // Lookup comments for each blog
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'blog_id',
                as: 'blog_comments',
            },
        },
        // Flatten the comments array to increase intermediate document count
        {
            $unwind: '$blog_comments',
        },
        // Add a default conversion for invalid strings
        {
            $addFields: {
                numericSubstring: {
                    $convert: {
                        input: { $substr: ['$blog_comments.content', 0, 2] },
                        to: 'int',
                        onError: 0, // Default value for invalid conversions
                        onNull: 0,  // Default value for null inputs
                    },
                },
            },
        },
        // Group by blog ID to calculate total comments and random stats
        {
            $group: {
                _id: '$_id',
                totalComments: { $sum: 1 },
                randomStat: { $avg: '$numericSubstring' },
                blogTitle: { $first: '$title' },
            },
        },
        // Sort by total comments without an index
        {
            $sort: { totalComments: -1 },
        },
        // Add more processing to increase memory usage
        {
            $project: {
                blogTitle: 1,
                totalComments: 1,
                randomStat: 1,
                extraProcessing: { $concat: ['Title: ', '$blogTitle'] },
            },
        },
        // Limit results
        {
            $limit: 10,
        },
    ];


    console.log('Running aggregation...');

    // Running the aggregation with explain() to see how MongoDB executes it
    const explainResult = await collection.aggregate(pipeline).toArray();

    // const result = await collection.find({}).toArray();

    const end = Date.now();
    // console.log("Query executed successfully:", result.length);
    // console.log('Explain result:', JSON.stringify(explainResult, null, 2));
    console.log("Time taken:", end - start, "ms");

    // console.log("Read data:", result);
  } catch (error) {
    console.error("Error during read operation:", error);
  } finally {
    await client.close();
  }
}

offloadReads().catch(console.error);
