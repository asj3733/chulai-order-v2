const menuArea = document.getElementById("menu");
let cart = [];

function renderMenu() {

    let html = "";

    for (const category in menu) {

        html += `<h2>${category}</h2>`;

        menu[category].forEach(item => {

            html += `
            <div class="menu-item">

<div>
    <h3>${item.name}</h3>
    <p>NT$${item.price}</p>
</div>

                <button onclick="addCart('${item.name}',${item.price})">
                    加入
                </button>

            </div>
            `;

        });

    }

    menuArea.innerHTML = html;

}

function addCart(name, price) {

    const item = cart.find(p => p.name === name);

    if(item){

        item.qty++;

    }else{

        cart.push({

    id: Date.now(),

    name,

    price,

    qty:1,

    options:{

        noodle:null,

        onion:true,

        vegetable:true,

        spicy:"",

        sauce:["醬油膏"]

    }

});

    }

    updateCart();

}

function updateCart() {

    let html = "";
    let total = 0;
    let totalQty = 0;

    cart.forEach(item => {

        html += `
        <div class="cart-item">

            <div>
                <strong>${item.name}</strong><br>
                NT$${item.price} × ${item.qty}
            </div>

            <div class="cart-control">

    <button onclick="changeQty('${item.name}',-1)">－</button>

    <span>${item.qty}</span>

    <button onclick="changeQty('${item.name}',1)">＋</button>

    <button class="delete-btn" onclick="removeItem('${item.name}')">🗑️</button>

</div>

        </div>
        `;

        total += item.price * item.qty;
        totalQty += item.qty;

    });

    if(cart.length===0){
        html="尚未加入商品";
    }

    document.getElementById("cart").innerHTML = html;
    document.getElementById("total").textContent = total;

    const cartCount = document.getElementById("cart-count");
    if(cartCount){
        cartCount.textContent = totalQty;
    }

}
function changeQty(name, change){

    const item = cart.find(p => p.name === name);

    if(!item) return;

    item.qty += change;

    if(item.qty <= 0){
        cart = cart.filter(p => p.name !== name);
    }

    updateCart();

}
function removeItem(name){

    cart = cart.filter(item => item.name !== name);

    updateCart();

}
console.log("新版 order.js 已載入");

renderMenu();

const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "checkout.html";
    });
}