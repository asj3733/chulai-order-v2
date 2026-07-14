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
                    <p>$${item.price}</p>
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

    cart.push({
        name,
        price
    });

    updateCart();

}

function updateCart() {

    let html = "";
    let total = 0;

    cart.forEach(item => {

        html += `<p>${item.name}　$${item.price}</p>`;

        total += item.price;

    });

    if (cart.length === 0) {
        html = "尚未加入商品";
    }

    document.getElementById("cart").innerHTML = html;
    document.getElementById("total").textContent = total;

    // 更新左下角購物車數量
    const cartCount = document.getElementById("cart-count");
    if(cartCount){
        cartCount.textContent = cart.length;
    }

}

renderMenu();
