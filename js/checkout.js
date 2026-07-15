const cart = JSON.parse(localStorage.getItem("cart")) || [];

const orderList = document.getElementById("order-list");

let html = "";
let total = 0;

cart.forEach(item => {

    html += `
        <p>
            ${item.name} × ${item.qty}
           　NT$${item.price * item.qty}
        </p>
    `;

    total += item.price * item.qty;

});

html += `<hr><h3>合計 NT$${total}</h3>`;

orderList.innerHTML = html;

// 取得欄位
const nameInput = document.getElementById("customer-name");
const phoneInput = document.getElementById("customer-phone");

// 載入上次資料
nameInput.value = localStorage.getItem("customerName") || "";
phoneInput.value = localStorage.getItem("customerPhone") || "";

// 即時儲存
nameInput.addEventListener("input", () => {
    localStorage.setItem("customerName", nameInput.value);
});

phoneInput.addEventListener("input", () => {
    localStorage.setItem("customerPhone", phoneInput.value);
});