import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const myCheckout = new CheckoutProcess("so-cart", "#order-summary");
myCheckout.init();

const zipInput = document.querySelector("input[name=zip]");

if (zipInput) {
  zipInput.addEventListener("blur", () => {
    // This is the line that fills in the Tax and Shipping info
    myCheckout.calculateOrderTotal();
  });
}

// Listen for zip code to calculate totals
document.querySelector("input[name=zip]").addEventListener("blur", () => {
  myCheckout.calculateOrderTotal();
});

// Handle submit
document.forms["checkout"].addEventListener("submit", (e) => {
  e.preventDefault();
  const myForm = e.target;
  const chk_status = myForm.checkValidity();
  myForm.reportValidity();

  if (chk_status) {
    myCheckout.checkout(myForm);
  }
});
