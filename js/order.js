const menuArea = document.getElementById("menu");
let cart = [];

function renderMenu(category = "麵類") {

    let html = "";

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

    menuArea.innerHTML = html;

}
function changeCategory(category, btn){

    renderMenu(category);

    document.querySelectorAll(".category-btn").forEach(item=>{
        item.classList.remove("active");
    });

    btn.classList.add("active");

}

html += `<h2 id="${categoryId[category]}">${category}</h2>`;

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

    const item = cart.find(p => p.name === name);

    if(item){

        item.qty++;

    }else{

        cart.push({
            name,
            price,
            qty:1
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
        <p>
            ${item.name}
            × ${item.qty}
           　
            $${item.price * item.qty}
        </p>
        `;

        total += item.price * item.qty;
        totalQty += item.qty;

    });

    if(cart.length===0){
        html="尚未加入商品";
    }

    document.getElementById("cart").innerHTML = html;
    document.getElementById("total").textContent = total;

    const cartCount=document.getElementById("cart-count");
    if(cartCount){
        cartCount.textContent=totalQty;
    }

}

renderMenu("麵類");
