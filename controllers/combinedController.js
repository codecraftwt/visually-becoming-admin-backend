// const firebase = require("../services/firebaseService");

// exports.getCombinedData = async (req, res, next) => {
//   try {
//     // Get all categories
//     const categories = await firebase.getAll("categories");
    
//     // Get all affirmations
//     const affirmations = await firebase.getAll("admin_dailyAffirmations");
    
//     // Group affirmations by categoryId
//     const affirmationsByCategory = {};
//     affirmations.forEach(affirmation => {
//       if (!affirmationsByCategory[affirmation.categoryId]) {
//         affirmationsByCategory[affirmation.categoryId] = [];
//       }
//       affirmationsByCategory[affirmation.categoryId].push(affirmation);
//     });
    
//     // Combine categories with their affirmations
//     const combinedData = categories.map(category => ({
//       ...category,
//       Affirmations: affirmationsByCategory[category.id] || []
//     }));
    
//     res.json(combinedData);
//   } catch (error) {
//     next(error);
//   }
// };


const { db } = require("../config/firebase");

exports.getCombinedData = async (req, res, next) => {
  try {
    // Get all published categories
    const categoriesSnapshot = await db.collection('admin_categories')
      .where('published', '==', true)
      .get();
    
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all published affirmations
    const affirmationsSnapshot = await db.collection('admin_dailyAffirmations')
      .where('published', '==', true)
      .get();
    
    const affirmations = affirmationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Combine data
    const combinedData = categories.map(category => ({
      ...category,
      Affirmations: affirmations.filter(affirmation => 
        affirmation.categoryId === category.id
      )
    }));

    res.json(combinedData);
  } catch (error) {
    next(error);
  }
};