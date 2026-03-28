// src/js/CheckoutProcess.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function formDataToJSON(formElement) {
  const formData = new FormData(formElement),
    convertedJSON = {};
  formData.forEach(function (value, key) {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    price: item.FinalPrice,
    name: item.Name,
    quantity: 1,
  }));
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
  }

  calculateItemSummary() {
    const summaryElement = document.querySelector(
      `${this.outputSelector} #cartTotal`,
    );
    const numElement = document.querySelector(
      `${this.outputSelector} #num-items`,
    );

    this.itemTotal = this.list.reduce((sum, item) => sum + item.FinalPrice, 0);
    numElement.innerText = this.list.length;
    summaryElement.innerText = `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    // 1. Logic: $10 for first item, $2 for each additional
    this.shipping = 10 + (this.list.length - 1) * 2;

    // 2. Logic: 6% tax
    this.tax = this.itemTotal * 0.06;

    // 3. Logic: Sum everything
    this.orderTotal = this.itemTotal + this.shipping + this.tax;

    // 4. Update the UI
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const shippingEln = document.querySelector(
      `${this.outputSelector} #shipping`,
    );
    const taxEln = document.querySelector(`${this.outputSelector} #tax`);
    const orderTotalEln = document.querySelector(
      `${this.outputSelector} #orderTotal`,
    );

    if (shippingEln && taxEln && orderTotalEln) {
      shippingEln.innerText = `$${this.shipping.toFixed(2)}`;
      taxEln.innerText = `$${this.tax.toFixed(2)}`;
      orderTotalEln.innerText = `$${this.orderTotal.toFixed(2)}`;
    }
  }

  async checkout(form) {
    const json = formDataToJSON(form);
    json.orderDate = new Date();
    json.orderTotal = this.orderTotal.toFixed(2);
    json.tax = this.tax.toFixed(2);
    json.shipping = this.shipping;
    json.items = packageItems(this.list);

    try {
      const res = await services.checkout(json);
      setLocalStorage(this.key, []); // Clear cart
      location.assign("/checkout/success.html");
    } catch (err) {
      // Clear existing alerts so they don't stack
      const existingAlerts = document.querySelectorAll(".alert");
      existingAlerts.forEach((alert) => alert.remove());

      // Loop through the error object from the server
      for (let message in err.message) {
        import("./utils.mjs").then((m) => m.alertMessage(err.message[message]));
      }
      console.table(err.message);
    }
  }
}
