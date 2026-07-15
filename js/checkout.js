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