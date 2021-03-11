$(function () {
  // Same as document.addEventListener("DOMContentLoaded"...

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").on("blur", function (event) {
    let screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });

  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  $("#navbarToggle").on("click", function (event) {
    $(event.target).trigger("focus");
  });
});

(function (global) {
  let dc = {};
  let allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
  let categoriesTitleHtml = "snippets/categories-title-snippet.html";
  let categoryHtml = "snippets/category-snippet.html";
  let menuItemsUrl =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  let menuItemsTitleHtml = "snippets/menu-items-title.html";
  let menuItemHtml = "snippets/menu-item.html";

  /**
   * Convenience function for inserting innerHTML for 'select'
   * @param {String} selector
   * @param {String} sampleHTML
   */
  let insertHTML = function (selector, sampleHTML) {
    /** @type HTMLElement */
    let targetElem = document.querySelector(selector);
    targetElem.innerHTML = sampleHTML;
  };

  /**
   * @param {String} string
   * @param {String} keyword
   * @param {String} replacement
   */
  let insertProperty = function (string, keyword, replacement) {
    string = string.replace(
      new RegExp("{{" + keyword + "}}", "g"),
      replacement
    );
    return string;
  };

  /**
   * Show loading icon inside element identified by 'selector'.
   * @param {String} selector
   */
  let showLoading = function (selector) {
    let html =
      '<div class="text-center"><img src="images/ajax-loader.gif"></div>';
    insertHTML(selector, html);
  };

  // Remove the class 'active' from home and switch to Menu button
  let switchMenuToActive = function () {
    // Remove 'active' from home button
    let classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
    // On first load, show home view
    showLoading("#main-content");
    $ajaxUtils.sendRequest(
      "snippets/home-snippet.html",
      function (responseText) {
        insertHTML("#main-content", responseText);
      },
      false
    );
  });

  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  /**
   *
   * @param {String} categoryShort
   */
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  /**
   *
   * @param {JSON} categories
   */
  function buildAndShowCategoriesHTML(categories) {
    // Load title snippet of categories page
    $ajaxUtils.sendRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        // Retrieve single category snippet
        $ajaxUtils.sendRequest(
          categoryHtml,
          function (categoryHtml) {
            let categoriesViewHtml = buildCategoriesViewHtml(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            insertHTML("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  /**
   *
   * @param {JSON} categories
   * @param {String} categoriesTitleHtml
   * @param {String} categoryHtml
   * @returns String
   */
  function buildCategoriesViewHtml(
    categories,
    categoriesTitleHtml,
    categoryHtml
  ) {
    let finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    for (let i = 0; i < categories.length; i++) {
      let html = categoryHtml;
      let name = "" + categories[i].name;
      let short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  /**
   *
   * @param {String} categoryMenuItems
   */
  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Load title snippet of menu items page
    $ajaxUtils.sendRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Retrieve single menu item snippet
        $ajaxUtils.sendRequest(
          menuItemHtml,
          function (menuItemHtml) {
            let menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            insertHTML("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Using category and menu items data and snippets html
  // build menu items view HTML to be inserted into page
  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    let finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over menu items
    let menuItems = categoryMenuItems.menu_items;
    let catShortName = categoryMenuItems.category.short_name;
    for (let i = 0; i < menuItems.length; i++) {
      // Insert menu item values
      let html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      // Add clearfix after every second menu item
      if (i % 2 != 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  // Appends price with '$' if price exists
  function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Appends portion name in parens if it exists
  function insertItemPortionName(html, portionPropName, portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  global.$dc = dc;
})(window);
