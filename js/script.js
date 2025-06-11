// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
  // Navigation elements
  const header = document.querySelector("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  // Testimonial slider elements
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  // Order buttons
  const orderButtons = document.querySelectorAll(".order-btn");

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter-form");

  // Cart elements
  const cartIcon = document.querySelector(".cart-icon");
  const cartCount = document.querySelector(".cart-count");

  // Initialize cart from localStorage or create a new one
  let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  let cartTotal = 0;

  // Update cart count when page loads
  updateCartCount();

  // Check if we're on the cart page
  const isCartPage = window.location.pathname.includes("cart.html");
  if (isCartPage) {
    renderCartPage();
  }

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");

    if (menuToggle.classList.contains("active")) {
      menuToggle.querySelector(".bar:nth-child(1)").style.transform =
        "rotate(-45deg) translate(-5px, 6px)";
      menuToggle.querySelector(".bar:nth-child(2)").style.opacity = "0";
      menuToggle.querySelector(".bar:nth-child(3)").style.transform =
        "rotate(45deg) translate(-5px, -6px)";
    } else {
      menuToggle.querySelector(".bar:nth-child(1)").style.transform =
        "rotate(0) translate(0)";
      menuToggle.querySelector(".bar:nth-child(2)").style.opacity = "1";
      menuToggle.querySelector(".bar:nth-child(3)").style.transform =
        "rotate(0) translate(0)";
    }
  });

  // Testimonial slider functionality
  let currentTestimonial = 0;

  function showTestimonial(index) {
    // Hide all testimonials
    testimonialCards.forEach((card) => {
      card.classList.remove("active");
    });

    // Deactivate all dots
    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    // Show the selected testimonial and activate corresponding dot
    testimonialCards[index].classList.add("active");
    dots[index].classList.add("active");

    currentTestimonial = index;
  }

  // Next button click
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(currentTestimonial);
    });
  }

  // Previous button click
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentTestimonial =
        (currentTestimonial - 1 + testimonialCards.length) %
        testimonialCards.length;
      showTestimonial(currentTestimonial);
    });
  }

  // Dot clicks
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showTestimonial(index);
    });
  });

  // Automatic slide change every 5 seconds
  if (testimonialCards.length > 0) {
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(currentTestimonial);
    }, 5000);

    // Initialize first testimonial
    showTestimonial(0);
  }

  // Add quick view buttons to product cards
  addQuickViewButtons();

  // Add to order button functionality
  orderButtons.forEach((button) => {
    // Check if this item is already in the cart and update button state
    const productCard = button.closest(".special-card, .product-card");
    if (productCard) {
      const productName = productCard.querySelector("h3").textContent;
      const isInCart = cartItems.some((item) => item.name === productName);

      if (isInCart) {
        button.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        button.classList.add("added");
      }
    }

    button.addEventListener("click", handleOrderButtonClick);
  });

  // Function to handle order button clicks
  function handleOrderButtonClick() {
    const productCard = this.closest(".special-card, .product-card");
    if (!productCard) return;

    const productName = productCard.querySelector("h3").textContent;
    const productDescription = productCard.querySelector(".description")
      ? productCard.querySelector(".description").textContent
      : productCard.querySelector("p").textContent;
    const productPriceElement = productCard.querySelector(".current-price");
    const productPrice = productPriceElement
      ? parseFloat(productPriceElement.textContent.replace("$", ""))
      : 0;
    const productImage = productCard.querySelector("img").src;

    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.name === productName
    );

    if (existingItemIndex > -1) {
      // If item is in cart, remove it
      cartItems.splice(existingItemIndex, 1);
      this.textContent = "Add to Order";
      this.classList.remove("added");
      showNotification(`${productName} removed from cart`, false);
    } else {
      // If item is not in cart, add it
      cartItems.push({
        name: productName,
        price: productPrice,
        description: productDescription,
        image: productImage,
        quantity: 1,
      });

      this.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
      this.classList.add("added");

      // Add animation to cart icon
      cartIcon.classList.add("bump");
      setTimeout(() => {
        cartIcon.classList.remove("bump");
      }, 300);

      showNotification(`${productName} added to cart`, true);
    }

    // Save cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Update cart count
    updateCartCount();
  }

  // Function to update cart count
  function updateCartCount() {
    // Count total items in cart
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Update the count display
    cartCount.textContent = totalItems;

    // Add animation if there are items
    if (totalItems > 0) {
      cartCount.classList.add("update");
      setTimeout(() => {
        cartCount.classList.remove("update");
      }, 500);
    }
  }

  // Create cart dropdown
  function createCartDropdown() {
    // First check if there's already a dropdown
    let dropdown = document.querySelector(".cart-dropdown");

    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "cart-dropdown";
      cartIcon.parentNode.appendChild(dropdown);
    }

    // Clear the dropdown content
    dropdown.innerHTML = "";

    if (cartItems.length === 0) {
      // If cart is empty
      dropdown.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-basket"></i>
          <p>Your cart is empty</p>
        </div>
      `;
    } else {
      // If cart has items
      let cartHTML = "";

      // Calculate total
      cartTotal = 0;

      // Generate HTML for each cart item
      cartItems.forEach((item, index) => {
        cartTotal += item.price * item.quantity;

        cartHTML += `
          <div class="cart-item" data-index="${index}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-quantity">
                <div class="quantity-btn minus"><i class="fas fa-minus"></i></div>
                <div class="cart-quantity">${item.quantity}</div>
                <div class="quantity-btn plus"><i class="fas fa-plus"></i></div>
              </div>
            </div>
          </div>
        `;
      });

      // Add cart total and checkout buttons
      cartHTML += `
        <div class="cart-total">
          <div class="total-text">Total:</div>
          <div class="total-amount">$${cartTotal.toFixed(2)}</div>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
        <button class="view-cart-btn">View Cart</button>
        <button class="empty-cart-btn">Empty Cart</button>
      `;

      dropdown.innerHTML = cartHTML;

      // Add event listeners for quantity buttons
      dropdown.querySelectorAll(".quantity-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const itemIndex = parseInt(this.closest(".cart-item").dataset.index);
          if (this.classList.contains("plus")) {
            // Increase quantity
            cartItems[itemIndex].quantity += 1;
            showNotification(
              `Increased ${cartItems[itemIndex].name} quantity`,
              true
            );
          } else if (this.classList.contains("minus")) {
            // Decrease quantity
            if (cartItems[itemIndex].quantity > 1) {
              cartItems[itemIndex].quantity -= 1;
              showNotification(
                `Decreased ${cartItems[itemIndex].name} quantity`,
                false
              );
            } else {
              // Remove item if quantity becomes 0
              const productName = cartItems[itemIndex].name;
              cartItems.splice(itemIndex, 1);

              // Update button state for this product
              updateButtonState(productName, false);
              showNotification(`${productName} removed from cart`, false);
            }
          }

          // Save updated cart to localStorage
          localStorage.setItem("cartItems", JSON.stringify(cartItems));

          // Update cart count
          updateCartCount();

          // Recreate dropdown with updated information
          createCartDropdown();
        });
      });

      // Add event listener for checkout button
      dropdown
        .querySelector(".checkout-btn")
        .addEventListener("click", function () {
          window.location.href = "order.html";
        });

      // Add event listener for view cart button
      dropdown
        .querySelector(".view-cart-btn")
        .addEventListener("click", function () {
          window.location.href = "cart.html";
        });

      // Add event listener for empty cart button
      dropdown
        .querySelector(".empty-cart-btn")
        .addEventListener("click", function () {
          if (confirm("Are you sure you want to empty your cart?")) {
            cartItems = [];
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            updateCartCount();

            // Update all button states
            document.querySelectorAll(".order-btn").forEach((btn) => {
              btn.textContent = "Add to Order";
              btn.classList.remove("added");
            });

            createCartDropdown();
            showNotification("Your cart has been emptied", false);
          }
        });
    }

    return dropdown;
  }

  // Helper function to update button state
  function updateButtonState(productName, isInCart) {
    document.querySelectorAll(".order-btn").forEach((btn) => {
      const cardElement = btn.closest(".special-card, .product-card");
      if (cardElement) {
        const cardName = cardElement.querySelector("h3")?.textContent;
        if (cardName === productName) {
          if (isInCart) {
            btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
            btn.classList.add("added");
          } else {
            btn.textContent = "Add to Order";
            btn.classList.remove("added");
          }
        }
      }
    });
  }

  // Toggle cart dropdown on cart icon click
  if (cartIcon) {
    cartIcon.addEventListener("click", function (e) {
      e.stopPropagation();

      // If on cart page, navigate there directly
      if (window.location.pathname.includes("cart.html")) {
        return;
      }

      const dropdown = createCartDropdown();
      dropdown.classList.toggle("show");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".cart-dropdown") &&
      !e.target.closest(".cart-icon")
    ) {
      const dropdown = document.querySelector(".cart-dropdown");
      dropdown?.classList.contains("show") && dropdown.classList.remove("show");
    }
  });

  // Function to render the cart page
  function renderCartPage() {
    const cartItemsContainer = document.querySelector(".cart-items-container");
    const cartEmptyState = document.querySelector(".cart-empty-state");
    const cartSubtotal = document.querySelector(".cart-subtotal");
    const cartTotalAmount = document.querySelector(".cart-total-amount");

    if (cartItems.length === 0) {
      // Show empty state
      cartEmptyState.style.display = "block";
      document.querySelector(".cart-page-container").style.display = "none";
      return;
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = 5.0; // Fixed shipping cost
    const total = subtotal + shipping;

    // Update summary
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalAmount.textContent = `$${total.toFixed(2)}`;

    // Generate cart items HTML
    let cartItemsHTML = "";

    cartItems.forEach((item, index) => {
      cartItemsHTML += `
        <div class="cart-page-item" data-index="${index}">
          <div class="cart-page-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-page-item-info">
            <div class="cart-page-item-title">${item.name}</div>
            <div class="cart-page-item-description">${item.description}</div>
            <div class="cart-page-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-page-item-quantity">
              <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
              <span class="cart-page-quantity">${item.quantity}</span>
              <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          <button class="remove-item-btn" title="Remove item"><i class="fas fa-times"></i></button>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = cartItemsHTML;

    // Add event listeners for cart page buttons

    // Quantity buttons
    document
      .querySelectorAll(".cart-page-item .quantity-btn")
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const itemIndex = parseInt(
            this.closest(".cart-page-item").dataset.index
          );

          if (this.classList.contains("plus")) {
            // Increase quantity
            cartItems[itemIndex].quantity += 1;
            showNotification(
              `Increased ${cartItems[itemIndex].name} quantity`,
              true
            );
          } else if (this.classList.contains("minus")) {
            // Decrease quantity if more than 1
            if (cartItems[itemIndex].quantity > 1) {
              cartItems[itemIndex].quantity -= 1;
              showNotification(
                `Decreased ${cartItems[itemIndex].name} quantity`,
                false
              );
            }
          }

          // Save to localStorage
          localStorage.setItem("cartItems", JSON.stringify(cartItems));

          // Update UI
          updateCartCount();
          renderCartPage();
        });
      });

    // Remove item buttons
    document.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemIndex = parseInt(
          this.closest(".cart-page-item").dataset.index
        );
        const productName = cartItems[itemIndex].name;

        // Remove item from cart
        cartItems.splice(itemIndex, 1);

        // Save to localStorage
        localStorage.setItem("cartItems", JSON.stringify(cartItems));

        // Update UI
        updateCartCount();
        renderCartPage();
        showNotification(`${productName} removed from cart`, false);
      });
    });

    // Continue shopping button
    document
      .querySelector(".continue-shopping-btn")
      .addEventListener("click", function () {
        window.location.href = "products.html";
      });

    // Checkout button
    document
      .querySelector(".checkout-btn")
      .addEventListener("click", function () {
        window.location.href = "order.html";
      });
  }

  // Function to add quick view buttons to product cards
  function addQuickViewButtons() {
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card) => {
      // Check if quick view button already exists
      if (!card.querySelector(".quick-view-btn")) {
        const quickViewBtn = document.createElement("div");
        quickViewBtn.className = "quick-view-btn";
        quickViewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        card.appendChild(quickViewBtn);

        quickViewBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          createQuickViewModal(card);
        });
      }
    });
  }

  // Function to create quick view modal
  function createQuickViewModal(productCard) {
    // Get product details
    const productName = productCard.querySelector("h3").textContent;
    const productDescription = productCard.querySelector(".description")
      ? productCard.querySelector(".description").textContent
      : productCard.querySelector("p").textContent;
    const productPrice =
      productCard.querySelector(".current-price").textContent;
    const productImage = productCard.querySelector("img").src;

    // Check if product is in cart
    const isInCart = cartItems.some((item) => item.name === productName);

    // Create modal HTML
    const modal = document.createElement("div");
    modal.className = "quick-view-modal";

    modal.innerHTML = `
      <div class="quick-view-content">
        <div class="quick-view-close"><i class="fas fa-times"></i></div>
        <div class="quick-view-image">
          <img src="${productImage}" alt="${productName}">
        </div>
        <div class="quick-view-details">
          <h3>${productName}</h3>
          <p>${productDescription}</p>
          <div class="quick-view-price">${productPrice}</div>
          <button class="order-btn ${isInCart ? "added" : ""}">
            ${
              isInCart
                ? '<i class="fas fa-check"></i> Added to Cart'
                : "Add to Order"
            }
          </button>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Show modal with slight delay for transition
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);

    // Add event listener to close button
    modal
      .querySelector(".quick-view-close")
      .addEventListener("click", function () {
        modal.classList.remove("show");
        setTimeout(() => {
          modal.remove();
        }, 300);
      });

    // Add event listener to modal background for closing
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("show");
        setTimeout(() => {
          modal.remove();
        }, 300);
      }
    });

    // Add event listener to order button
    modal.querySelector(".order-btn").addEventListener("click", function () {
      // Find the original button in the product card
      const originalButton = productCard.querySelector(".order-btn");

      // Simulate click on the original button
      if (originalButton) {
        originalButton.click();

        // Update this button's state to match
        if (this.classList.contains("added")) {
          this.textContent = "Add to Order";
          this.classList.remove("added");
        } else {
          this.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
          this.classList.add("added");
        }
      }
    });
  }

  // Function to show notification
  function showNotification(message, isAdd = true) {
    // Remove any existing notification
    const existingNotification = document.querySelector(
      ".cart-item-notification"
    );
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = "cart-item-notification";

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas ${isAdd ? "fa-check-circle" : "fa-info-circle"}"></i>
        </div>
        <div class="notification-message">${message}</div>
      </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 400);
    }, 3000);
  }

  // Newsletter form submission
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector("input[type='email']");
      const email = emailInput.value;

      if (email) {
        // Normally you would send this to a server
        alert(`Thank you for subscribing with ${email}!`);
        emailInput.value = "";
      }
    });
  }

  // Product category filter functionality
  const categoryButtons = document.querySelectorAll(".category-btn");
  if (categoryButtons.length > 0) {
    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        categoryButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        const category = this.textContent.trim();
        const productCards = document.querySelectorAll(".product-card");

        if (category === "All") {
          // Show all products
          productCards.forEach((card) => {
            card.style.display = "block";
          });
        } else {
          // Filter products based on category
          // This is a simplified implementation - in a real app, you'd have
          // proper category data for each product
          productCards.forEach((card) => {
            const productName = card
              .querySelector("h3")
              .textContent.toLowerCase();
            const productDesc = card
              .querySelector(".description")
              .textContent.toLowerCase();

            if (
              category === "Cakes" &&
              (productName.includes("cake") || productDesc.includes("cake"))
            ) {
              card.style.display = "block";
            } else if (
              category === "Cookies" &&
              (productName.includes("cookie") || productDesc.includes("cookie"))
            ) {
              card.style.display = "block";
            } else if (
              category === "Pastries" &&
              (productName.includes("tart") ||
                productName.includes("croissant") ||
                productDesc.includes("tart") ||
                productDesc.includes("crust") ||
                productDesc.includes("pastry"))
            ) {
              card.style.display = "block";
            } else if (
              category === "Breads" &&
              (productName.includes("bread") || productDesc.includes("bread"))
            ) {
              card.style.display = "block";
            } else if (
              category === "Cupcakes" &&
              (productName.includes("cupcake") ||
                productDesc.includes("cupcake"))
            ) {
              card.style.display = "block";
            } else {
              card.style.display = "none";
            }
          });

          // // Show message if no products match the category
          // const visibleProducts = document.querySelectorAll(
          //   ".product-card[style='display: block']"
          // );
          // if (visibleProducts.length === 0) {
          //   showNotification(
          //     `No products found in the ${category} category.`,
          //     false
          //   );
          // } else {
          //   showNotification(
          //     `Showing ${visibleProducts.length} products in the ${category} category.`,
          //     true
          //   );
          // }
        }
      });
    });
  }
});
