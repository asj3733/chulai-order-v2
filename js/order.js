/* =========================================
   初萊食麵 v2.0
   點餐系統
========================================= */


/* =========================================
   基本設定
========================================= */

const menuArea = document.getElementById("menu");

let cart = [];


/* =========================================
   客製化中的商品
========================================= */

let currentItem = null;

let modalQty = 1;


/* =========================================
   讀取購物車
========================================= */

try {

    const savedCart = localStorage.getItem("cart");

    if (savedCart) {

        cart = JSON.parse(savedCart);

    }

} catch (error) {

    console.error(
        "購物車讀取失敗",
        error
    );

    cart = [];

}


/* =========================================
   渲染商品
========================================= */

function renderMenu(category = null) {

    if (!menuArea) return;


    let html = "";


    const categories = category
        ? [category]
        : Object.keys(menu);


    categories.forEach(categoryName => {


        if (!menu[categoryName]) {
            return;
        }


        html += `

            <section
                class="menu-category"
                data-category="${categoryName}">

                <h2>

                    ${categoryName}

                </h2>

        `;


        menu[categoryName].forEach(item => {


            html += `

                <div
                    class="menu-item">


                    <div
                        class="menu-info">

                        <h3>

                            ${item.name}

                        </h3>


                        <p>

                            NT$${item.price}

                        </p>

                    </div>


                    <button
                        type="button"
                        onclick="addCartById('${item.id || item.name}')">

                        加入

                    </button>


                </div>

            `;

        });


        html += `

            </section>

        `;

    });


    menuArea.innerHTML = html;

}


/* =========================================
   根據 ID 找商品
========================================= */

function findMenuItem(itemId) {


    for (
        const category in menu
    ) {


        const found = menu[category].find(

            item =>
                String(item.id || item.name)
                === String(itemId)

        );


        if (found) {

            return found;

        }

    }


    return null;

}


/* =========================================
   點擊商品
========================================= */

function addCartById(itemId) {


    const item =
        findMenuItem(itemId);


    if (!item) {

        console.error(
            "找不到商品",
            itemId
        );

        return;

    }


    /*
        需要客製化的商品
    */

    if (
        item.type === "noodle" ||
        item.type === "riceNoodle" ||
        item.type === "oden"
    ) {


        openCustomModal(item);


        return;

    }


    /*
        不需要客製化
    */

    addCartDirect(

        item,

        {
            noodle: null,

            spicy: null,

            vegetable: true,

            onion: true,

            sauce: null

        },

        1

    );

}


/* =========================================
   開啟客製化視窗
========================================= */

function openCustomModal(item) {


    currentItem = item;

    modalQty = 1;


    const modal =
        document.getElementById(
            "customModal"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const noodleOption =
        document.getElementById(
            "noodleOption"
        );


    const noodleSelectArea =
        document.getElementById(
            "noodleSelectArea"
        );


    const odenOption =
        document.getElementById(
            "odenOption"
        );


    /*
        商品名稱
    */

    modalTitle.textContent =

        item.name;


    /*
        數量重設
    */

    document.getElementById(
        "modalQty"
    ).textContent = 1;


    /*
        重設客製化
    */

    document.querySelectorAll(

        'input[name="noodle"]'

    ).forEach(input => {

        input.checked =
            input.value === "粗麵";

    });


    document.querySelectorAll(

        'input[name="spicy"]'

    ).forEach(input => {

        input.checked =
            input.value === "不辣";

    });


    document.getElementById(
        "noVegetable"
    ).checked = false;


    document.getElementById(
        "noOnion"
    ).checked = false;


    document.querySelectorAll(

        'input[name="sauce"]'

    ).forEach(input => {

        input.checked =
            input.value === "醬油膏";

    });


    /*
        麵類
    */

    if (
        item.type === "noodle"
    ) {


        noodleOption.style.display =
            "block";


        noodleSelectArea.style.display =
            "block";


        odenOption.style.display =
            "none";


    }


    /*
        米粉
    */

    else if (
        item.type === "riceNoodle"
    ) {


        noodleOption.style.display =
            "block";


        noodleSelectArea.style.display =
            "none";


        odenOption.style.display =
            "none";


    }


    /*
        關東煮
    */

    else if (
        item.type === "oden"
    ) {


        noodleOption.style.display =
            "none";


        odenOption.style.display =
            "block";


    }


    /*
        顯示視窗
    */

    modal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   修改客製化數量
========================================= */

function changeModalQty(change) {


    modalQty += change;


    if (
        modalQty < 1
    ) {

        modalQty = 1;

    }


    if (
        modalQty > 99
    ) {

        modalQty = 99;

    }


    document.getElementById(
        "modalQty"
    ).textContent =
        modalQty;

}


/* =========================================
   確認加入購物車
========================================= */

function confirmCustom() {


    if (!currentItem) {

        return;

    }


    let options = {


        noodle: null,


        spicy: null,


        vegetable: true,


        onion: true,


        sauce: null


    };


    /*
        麵類
    */

    if (
        currentItem.type === "noodle"
    ) {


        const noodle =
            document.querySelector(

                'input[name="noodle"]:checked'

            );


        const spicy =
            document.querySelector(

                'input[name="spicy"]:checked'

            );


        options.noodle =
            noodle
                ? noodle.value
                : "粗麵";


        options.spicy =
            spicy
                ? spicy.value
                : "不辣";


        options.vegetable =
            !document.getElementById(
                "noVegetable"
            ).checked;


        options.onion =
            !document.getElementById(
                "noOnion"
            ).checked;


    }


    /*
        米粉
    */

    else if (
        currentItem.type === "riceNoodle"
    ) {


        const spicy =
            document.querySelector(

                'input[name="spicy"]:checked'

            );


        options.noodle =
            null;


        options.spicy =
            spicy
                ? spicy.value
                : "不辣";


        options.vegetable =
            !document.getElementById(
                "noVegetable"
            ).checked;


        options.onion =
            !document.getElementById(
                "noOnion"
            ).checked;


    }


    /*
        關東煮
    */

    else if (
        currentItem.type === "oden"
    ) {


        const sauce =
            document.querySelector(

                'input[name="sauce"]:checked'

            );


        options.sauce =
            sauce
                ? sauce.value
                : "醬油膏";


    }


    /*
        加入購物車
    */

    addCartDirect(

        currentItem,

        options,

        modalQty

    );


    /*
        關閉視窗
    */

    closeModal();

}


/* =========================================
   加入購物車
========================================= */

function addCartDirect(

    item,

    options,

    qty

) {


    /*
        建立客製化識別碼

        同商品不同客製
        會分開成不同購物車項目
    */

    const optionKey =

        JSON.stringify(options);


    const existingItem =

        cart.find(

            cartItem =>

                cartItem.productId ===
                item.id

                &&

                cartItem.optionKey ===
                optionKey

        );


    /*
        已有相同客製
    */

    if (
        existingItem
    ) {


        existingItem.qty += qty;


    }


    /*
        新商品
    */

    else {


        cart.push({

            id:
                Date.now()
                +
                Math.random(),


            productId:
                item.id ||
                item.name,


            name:
                item.name,


            price:
                item.price,


            qty:
                qty,


            type:
                item.type ||
                null,


            options:
                options,


            optionKey:
                optionKey

        });


    }


    saveCart();


    updateCart();

}


/* =========================================
   儲存購物車
========================================= */

function saveCart() {


    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

}


/* =========================================
   顯示客製內容
========================================= */

function getOptionText(item) {


    const options =
        item.options || {};


    const texts = [];


    /*
        麵條
    */

    if (
        options.noodle
    ) {

        texts.push(
            options.noodle
        );

    }


    /*
        辣度
    */

    if (
        options.spicy
    ) {

        texts.push(
            options.spicy
        );

    }


    /*
        不加菜
    */

    if (
        options.vegetable === false
    ) {

        texts.push(
            "不加菜"
        );

    }


    /*
        不加蔥
    */

    if (
        options.onion === false
    ) {

        texts.push(
            "不加蔥"
        );

    }


    /*
        醬料
    */

    if (
        options.sauce
    ) {

        texts.push(
            options.sauce
        );

    }


    if (
        texts.length === 0
    ) {

        return "";

    }


    return `

        <div class="cart-options">

            ${texts.join(" ・ ")}

        </div>

    `;

}


/* =========================================
   更新購物車
========================================= */

function updateCart() {


    const cartArea =
        document.getElementById(
            "cart"
        );


    if (!cartArea) {

        return;

    }


    let html = "";


    let total = 0;


    let totalQty = 0;


    /*
        購物車空
    */

    if (
        cart.length === 0
    ) {


        cartArea.innerHTML =

            "尚未加入商品";


        document.getElementById(
            "total"
        ).textContent = 0;


        document.getElementById(
            "cart-count"
        ).textContent = 0;


        return;

    }


    /*
        商品
    */

    cart.forEach(

        (item, index) => {


            const subtotal =

                item.price *
                item.qty;


            total += subtotal;


            totalQty +=
                item.qty;


            html += `

                <div
                    class="cart-item">


                    <div
                        class="cart-item-info">


                        <strong>

                            ${item.name}

                        </strong>


                        ${getOptionText(item)}


                        <div>

                            NT$${item.price}
                            ×
                            ${item.qty}

                            =
                            NT$${subtotal}

                        </div>


                    </div>


                    <div
                        class="cart-control">


                        <button
                            type="button"
                            onclick="changeQty(${index}, -1)">

                            －

                        </button>


                        <span>

                            ${item.qty}

                        </span>


                        <button
                            type="button"
                            onclick="changeQty(${index}, 1)">

                            ＋

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="removeItem(${index})">

                            ✕

                        </button>


                    </div>


                </div>

            `;

        }

    );


    /*
        更新畫面
    */

    cartArea.innerHTML =
        html;


    document.getElementById(
        "total"
    ).textContent =
        total;


    document.getElementById(
        "cart-count"
    ).textContent =
        totalQty;

}


/* =========================================
   修改購物車數量
========================================= */

function changeQty(

    index,

    change

) {


    if (
        !cart[index]
    ) {

        return;

    }


    cart[index].qty +=
        change;


    if (
        cart[index].qty <= 0
    ) {


        cart.splice(

            index,

            1

        );

    }


    saveCart();


    updateCart();

}


/* =========================================
   刪除購物車商品
========================================= */

function removeItem(index) {


    if (
        !cart[index]
    ) {

        return;

    }


    cart.splice(

        index,

        1

    );


    saveCart();


    updateCart();

}


/* =========================================
   關閉客製化視窗
========================================= */

function closeModal() {


    const modal =
        document.getElementById(
            "customModal"
        );


    modal.style.display =
        "none";


    document.body.style.overflow =
        "";


    currentItem =
        null;


    modalQty =
        1;

}


/* =========================================
   點擊視窗外關閉
========================================= */

const customModal =
    document.getElementById(
        "customModal"
    );


if (customModal) {


    customModal.addEventListener(

        "click",

        function(event) {


            if (
                event.target ===
                customModal
            ) {


                closeModal();

            }

        }

    );

}


/* =========================================
   ESC 關閉視窗
========================================= */

document.addEventListener(

    "keydown",

    function(event) {


        if (
            event.key ===
            "Escape"
        ) {


            closeModal();

        }

    }

);


/* =========================================
   分類按鈕
========================================= */

document.querySelectorAll(

    ".category-nav button"

).forEach(

    button => {


        button.addEventListener(

            "click",

            function() {


                const category =

                    this.dataset.category;


                renderMenu(

                    category

                );


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }

        );

    }

);


/* =========================================
   前往結帳
========================================= */

const checkoutBtn =
    document.getElementById(
        "checkout-btn"
    );


if (checkoutBtn) {


    checkoutBtn.addEventListener(

        "click",

        function() {


            if (
                cart.length === 0
            ) {


                alert(
                    "購物車目前是空的，請先加入餐點！"
                );


                return;

            }


            saveCart();


            window.location.href =
                "checkout.html";

        }

    );

}


/* =========================================
   初始化
========================================= */

renderMenu();

updateCart();


console.log(

    "🍜 初萊食麵 v2.0 order.js 已載入"

);