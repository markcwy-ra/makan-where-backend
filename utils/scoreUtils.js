const { useractivity, featuredactivity } = require("../db/models");

// Calculate and update activity score
calculateAndUpdateScore = async (
  targetId,
  targetType,
  makanlistId = null,
  restaurantId = null
) => {
  // Initialise activities
  let activities = [];

  // Initialise score
  let score = 0;

  // Get all user activities related to this target
  activities = await useractivity.findAll({
    where: {
      targetId: targetId,
      targetType: targetType,
    },
    order: [["createdAt", "DESC"]],
  });

  console.log(`Fetched Activities:`, activities);

  let seenTargets = new Set();

  // Add to score based on activity type
  for (let activity of activities) {
    // If we've already seen this target, skip this activity
    if (seenTargets.has(activity.targetId)) {
      continue;
    }

    // Mark this target as seen
    seenTargets.add(activity.targetId);

    switch (activity.activityType) {
      case "added":
      case "upvoted":
        score += 1;
        break;
      case "deleted":
      case "removed upvote":
        score -= 1;
        break;
      case "updated":
        score += 0.5;
        break;
      // Handle unexpected activity types
      default:
        console.log(`Unrecognised activity type: ${activity.activityType}`);
    }
  }

  // If target type is makanlistrestaurant, handle differently
  let updatedTargets = new Set();

  if (targetType === "makanlistrestaurant") {
    let makanlistKey = `${makanlistId}_makanlist`;
    let restaurantKey = `${restaurantId}_restaurant`;

    // Handle the makanlist score
    // Only update if it hasn't been updated yet
    if (!updatedTargets.has(makanlistKey)) {
      await calculateFeaturedActivityScore(
        makanlistId,
        "makanlist",
        score,
        activities.length
      );
      updatedTargets.add(makanlistKey);
    }

    // Handle the restaurant score
    // Only update if it hasn't been updated yet
    if (!updatedTargets.has(restaurantKey)) {
      await calculateFeaturedActivityScore(
        restaurantId,
        "restaurant",
        score,
        activities.length
      );
      updatedTargets.add(restaurantKey);
    }
  }

  // Handle the target score
  // Only update if it hasn't been updated yet
  let targetKey = `${targetId}_${targetType}`;
  if (!updatedTargets.has(targetKey)) {
    await calculateFeaturedActivityScore(
      targetId,
      targetType,
      score,
      activities.length
    );
    updatedTargets.add(targetKey);
  }
};

calculateFeaturedActivityScore = async (
  targetId,
  targetType,
  scoreToAdd,
  userActivityCountToAdd
) => {
  // Look for existing featured activity
  const featuredActivity = await featuredactivity.findOne({
    where: {
      targetId: targetId,
      targetType: targetType,
    },
  });
  console.log("Target id:", targetId);

  // If it exists, update it
  if (featuredActivity) {
    featuredActivity.score += scoreToAdd;
    featuredActivity.userActivityCount += userActivityCountToAdd;
    await featuredActivity.save();
    console.log(`Updated Featured Activity:`, featuredActivity);
  } else {
    // If it doesn't exist, create a new one
    const newFeaturedActivity = await featuredactivity.create({
      targetId: targetId,
      targetType: targetType,
      score: scoreToAdd,
      userActivityCount: userActivityCountToAdd,
    });
    console.log(`Created new Featured Activity:`, newFeaturedActivity);
  }
};

module.exports = { calculateAndUpdateScore };
