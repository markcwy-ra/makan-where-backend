"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "cuisines",
      [
        {
          cuisine: "acai_bowls",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "african",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "american",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "australian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "austrian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bakeries",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bagels",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "baguettes",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bangladeshi",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "barbeque",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bavarian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "belgian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bento",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bistros",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "brazilian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "british",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "bubble_tea",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "buffets",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "burgers",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "burritos",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cafes",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cafeteria",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cajun",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cake",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "canadian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "caribbean",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cheese_steaks",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "chicken",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "chilean",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "chinese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "churros",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cantonese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "coffee",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "colombian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "congee",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "crepes",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cuban",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "cupcakes",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "curry",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "danish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "delis",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "dim_sum",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "diners",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "donburi",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "donuts",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "dumplings",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "eastern_european",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "egyptian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "falafel",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "fast_food",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "filipino",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "fish_and_chips",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "fondue",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "french",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "gelato",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "german",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "gluten_free",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "greek",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "halal",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "hawaiian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "hong_kong",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "hot_dogs",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "hot_pot",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "ice_cream",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "indian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "indonesian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "irish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "italian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "japanese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "jewish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "kebabs",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "kopitiam",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "korean",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "kosher",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "lebanese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "malaysian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "meatballs",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "mediterranean",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "mexican",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "middle_eastern",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "noodles",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "nonya",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pakistani",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pancakes",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pasta",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "persian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pita",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pizza",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "pub_food",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "ramen",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "rice",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "salad",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "sandwiches",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "schnitzel",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "scottish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "seafood",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "singaporean",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "soba",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "soul_food",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "soup",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "southern",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "spanish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "sri_lankan",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "steak",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "sushi",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "swedish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "tacos",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "taiwanese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "tapas",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "tempura",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "tex-mex",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "thai",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "tonkatsu",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "turkish",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "udon",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "unagi",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "vegan",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "vegetarian",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "vietnamese",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "waffles",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "wraps",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          cuisine: "yakitori",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("cuisines", null, {});
  },
};
