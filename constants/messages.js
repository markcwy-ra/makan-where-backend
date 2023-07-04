module.exports = {
  //------------ AUTH MESSAGES ------------//
  // Success messages
  TOKEN_REFRESHED_SUCCESS: "Token refreshed successfully",
  INITIATE_PASSWORD_RESET_SUCCESS:
    "Password reset initiated. Check your email for instructions.",
  SIGNOUT_SUCCESS: "User signed out successfully",
  // Error messages
  MISSING_FIELDS: "Missing email, password or username",
  INVALID_CREDENTIALS: "Invalid credentials",
  REFRESH_TOKEN_SAVE_ERROR: "Error saving refresh token",
  SIGNIN_ERROR: "Error logging in",
  NO_REFRESH_TOKEN: "No refresh token provided",
  REFRESH_ERROR: "Error refreshing token",
  REFRESH_TOKEN_EXPIRED: "Refresh token expired",
  TOKEN_REQUIRED: "A token is required for authentication",
  INVALID_TOKEN: "Invalid token",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  PASSWORD_RESET_ERROR: "Error resetting password",
  INVALID_EXPIRED_TOKEN: "Invalid or expired reset token",
  INITIATE_PASSWORD_RESET_ERROR: "Error initiating password reset",
  SIGNOUT_ERROR: "Error signing out user",

  //------------ USER MESSAGES ------------//
  WRONG_PASSWORD: "Current password entered is wrong!",

  //------------ FOLLOWS MESSAGES ------------//
  FOLLOW_SUCCESS: "Successfully followed user",
  UNFOLLOW_SUCCESS: "Successfully unfollowed user",

  //------------ SEARCH MESSAGES ------------//
  USER_RETRIEVED_SUCCESS: "User data retrieved.",
  RESTAURANT_RETRIEVED_SUCCESS: "Successfully retrieved restaurant details",
  RESTAURANT_SEARCH_SUCCESS: "Successfully retrieved search results",
  RESTAURANT_SEARCH_ERROR: "Error retrieving places",

  //------------ ALREADY EXISTS MESSAGES ------------//
  USER_EXISTS: "User already exists",
  RESTAURANT_EXISTS: "Restaurant already exists",
  MAKANLIST_EXISTS: "Makanlist already exists",
  MAKANLIST_TITLE_EXISTS: "Makanlist with this title already exists",
  REVIEW_EXISTS: "Review already exists",
  USER_REVIEW_EXISTS: "User has already left a review for this restaurant",
  MAKANLIST_RESTAURANT_ALREADY_ADDED: "Restaurant already added to makanlist",

  //------------ NOT FOUND MESSAGES ------------//
  // User not found messages
  USER_NOT_FOUND: "User not found",
  USERS_NOT_FOUND: "No users found",
  // Follows not found messages
  FOLLOWER_NOT_FOUND: "Follower not found",
  USER_OR_FOLLOWER_NOT_FOUND: "User or follower not found",
  // Restaurant not found messages
  RESTAURANT_NOT_FOUND: "Restaurant not found",
  USER_OR_RESTAURANT_NOT_FOUND: "User or restaurant not found",
  // Review not found messages
  REVIEW_NOT_FOUND: "Review not found",
  REVIEWS_NOT_FOUND: "Reviews not found",
  USER_OR_REVIEW_NOT_FOUND: "User or review not found",
  // Makanlist not found messages
  MAKANLIST_NOT_FOUND: "Makanlist not found",
  MAKANLISTS_NOT_FOUND: "No makanlists found",
  USER_OR_MAKANLIST_NOT_FOUND: "User or makanlist not found",
  RESTAURANT_MAKANLISTS_NOT_FOUND: "No makanlists found for this restaurant",
  // User activities not found messages
  USER_ACTIVITIES_NOT_FOUND: "No user activities found",

  //------------ NO LONGER EXISTS MESSAGES ------------//
  REVIEW_ACTIVITY_NO_LONGER_EXISTS:
    "This activity refers to a review that no longer exists",
  MAKANLIST_RESTAURANT_ACTIVITY_NO_LONGER_EXISTS:
    "This activity refers to a makanlist restaurant that no longer exists",
  MAKANLIST_ACTIVITY_NO_LONGER_EXISTS:
    "This activity refers to a makanlist that no longer exists",
  RESTAURANT_ACTIVITY_NO_LONGER_EXISTS:
    "This activity refers to a restaurant that no longer exists",
  USER_ACTIVITY_NO_LONGER_EXISTS:
    "This activity refers to a user that no longer exists",

  GET_RESTAURANTS_IN_VIEWPORT_ERROR:
    "An error occurred while fetching restaurants in viewport",

  //------------ SUCCESS MESSAGES ------------//
  // User success messages
  USER_REGISTERED_SUCCESS: "User registered successfully",
  USER_AUTHENTICATED: "User authenticated successfully",
  USER_DELETED_SUCCESS: "User deleted successfully",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  // Restaurant success messages
  RESTAURANT_UPVOTE_REMOVED_SUCCESS: "Successfully removed restaurant upvote",
  RESTAURANT_UPVOTE_SUCCESS: "Successfully upvoted restaurant",
  // Review success messages
  REVIEW_DELETED_SUCCESS: "Review deleted successfully",
  REVIEW_UPVOTED_SUCCESS: "Successfully upvoted review",
  REVIEW_UPVOTE_REMOVED_SUCCESS: "Successfully removed review upvote",
  // Makanlist success messages
  MAKANLIST_UPVOTE_REMOVED_SUCCESS: "Successfully removed makanlist upvote",
  MAKANLIST_UPVOTED_SUCCESS: "Successfully upvoted makanlist",
  MAKANLIST_DELETED_SUCCESS: "Makanlist deleted",
  MAKANLIST_UPDATED_SUCCESS: "Makanlist successfully updated",
  MAKANLIST_CREATED_SUCCESS: "Makanlist created successfully",
  MAKANLIST_RESTAURANT_ADDED_SUCCESS:
    "Restaurant successfully added to makanlist",
  MAKANLIST_RESTAURANT_REMOVED_SUCCESS:
    "Restaurant successfully removed from makanlist",
};
