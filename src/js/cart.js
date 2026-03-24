import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  // Calculate and display total if there are items in the cart
  if (cartItems.length > 0) {
    displayCartTotal(cartItems);
  }
}

function displayCartTotal(cartItems) {
  // 1. Calculate the total using reduce
  const total = cartItems.reduce((sum, item) => sum + item.FinalPrice, 0);

  // 2. Reveal the cart-footer (ensure this class exists in your cart/index.html)
  const cartFooter = document.querySelector(".cart-footer");
  cartFooter.classList.remove("hide");

  // 3. Insert the total into the HTML
  document.querySelector(".cart-total").innerText =
    `Total: $${total.toFixed(2)}`;
}

function cartItemTemplate(item) {
  const productLink = `../product_pages/index.html?product=${item.Id}`;

  // 1. LOGIC: Check both possible API locations for the image
  // Some items use .Image, others use .Images.PrimaryMedium
  let rawPath = item.Image || (item.Images && item.Images.PrimaryMedium);

  // 2. PATH FIX: Ensure it starts with ../ to get out of the /cart/ folder
  let finalImagePath = rawPath;
  if (rawPath && !rawPath.startsWith("http") && !rawPath.startsWith("../")) {
    finalImagePath = `../${rawPath}`;
  }

  // 3. FALLBACK: If both are missing, use a placeholder
  if (!finalImagePath) {
    finalImagePath = "../images/no-image-found.png";
  }

  return `<li class="cart-card divider">
  <a href="${productLink}" class="cart-card__image">
    <img src="${finalImagePath}" alt="${item.Name}" />
  </a>
  <a href="${productLink}">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors && item.Colors[0] ? item.Colors[0].ColorName : "Default"}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;
}

renderCartContents();
