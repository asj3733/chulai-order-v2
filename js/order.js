/* =========================================
   🍜 初萊食麵
   order.js｜線上點餐完整版本

   商品客製化：
   🍜 麵類
   🍚 米粉
   🍢 關東煮
   🐷 手工大腸
   🥟 水餃

   醬料：
   🍢 關東煮／🐷 手工大腸
   1. 不加醬
   2. 醬油膏 ⭐ 預設
   3. 辣椒醬
   4. 蕃茄醬
   5. 醬油膏＋辣椒醬
   6. 醬油膏＋蕃茄醬
   7. 辣椒醬＋蕃茄醬
   8. 醬料全加

   🥟 水餃
   1. 清醬油 ⭐ 預設
   2. 醬油膏
   3. 辣椒醬
   4. 辣油
   5. 清醬油＋辣油
   6. 醬油膏＋辣椒醬
========================================= */


/* =========================================
   🛒 讀取購物車
========================================= */

let cart = [];

try {

    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

} catch (error) {

    console.error(
        "購物車讀取失敗：",
        error
    );

    cart = [];

}


/* =========================================
   🛒 目前客製化商品
========================================= */

let currentProduct = null;


/* =========================================
   🔢 客製化數量
========================================= */

let modalQuantity = 1;


/* =========================================
   📌 DOM
========================================= */

const menuContainer =
    document.getElementById("menu");

const cartContainer =
    document.getElementById("cart");

const cartCountElement =
    document.getElementById("cart-count");

const totalElement =
    document.getElementById("total");

const checkoutBtn =
    document.getElementById("checkout-btn");

const customModal =
    document.getElementById("customModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalQty =
    document.getElementById("modalQty");

const noodleOption =
    document.getElementById("noodleOption");

const noodleSelectArea =
    document.getElementById("noodleSelectArea");

const odenOption =
    document.getElementById("odenOption");

const noVegetable =
    document.getElementById("noVegetable");

const noOnion =
    document.getElementById("noOnion");

const noSauce =
    document.getElementById("noSauce");


/* =========================================
   🛡 HTML 防注入
========================================= */

function escapeHTML(text) {

    return String(text ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   💾 儲存購物車
========================================= */

function saveCart() {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "購物車儲存失敗：",
            error
        );

    }

}


/* =========================================
   🔢 購物車數量
========================================= */

function getCartCount() {

    return cart.reduce(

        function(total, item) {

            return total +
                Number(item.qty || 0);

        },

        0

    );

}


/* =========================================
   💰 購物車總金額
========================================= */

function getCartTotal() {

    return cart.reduce(

        function(total, item) {

            return total +
                Number(item.price || 0) *
                Number(item.qty || 0);

        },

        0

    );

}


/* =========================================
   🛒 更新購物車摘要
========================================= */

function updateCartSummary() {

    const count =
        getCartCount();

    const total =
        getCartTotal();


    if (cartCountElement) {

        cartCountElement.textContent =
            count;

    }


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (checkoutBtn) {

        if (cart.length === 0) {

            checkoutBtn.disabled =
                true;

            checkoutBtn.textContent =
                "購物車是空的";

        } else {

            checkoutBtn.disabled =
                false;

            checkoutBtn.textContent =
                "前往結帳 →";

        }

    }

}


/* =========================================
   🍜 顯示商品
========================================= */

function renderMenu(category) {

    if (!menuContainer) {

        console.error(
            "找不到 #menu"
        );

        return;

    }


    if (typeof menu === "undefined") {

        console.error(
            "menu.js 沒有成功載入"
        );

        menuContainer.innerHTML = `

            <div class="menu-error">

                ⚠️ 商品資料載入失敗

                <br><br>

                請確認 menu.js 是否正確載入

            </div>

        `;

        return;

    }


    const products =
        menu[category];


    if (!products || products.length === 0) {

        menuContainer.innerHTML = `

            <div class="menu-empty">

                目前沒有商品

            </div>

        `;

        return;

    }


    let html = "";


    products.forEach(

        function(product) {

            html += `

                <div
                    class="menu-item"
                    data-id="${escapeHTML(product.id)}">

                    <div class="menu-item-info">

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <strong>
                            NT$${Number(product.price)}
                        </strong>

                    </div>


                    <button
                        type="button"
                        class="add-product-btn"
                        data-product-id="${escapeHTML(product.id)}"
                        data-category="${escapeHTML(category)}">

                        ＋ 加入

                    </button>

                </div>

            `;

        }

    );


    menuContainer.innerHTML =
        html;


    menuContainer
        .querySelectorAll(".add-product-btn")
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        openProductModal(

                            this.dataset.productId,

                            this.dataset.category

                        );

                    }

                );

            }

        );

}


/* =========================================
   🔍 找商品
========================================= */

function findProduct(
    productId,
    category
) {

    if (typeof menu === "undefined") {

        return null;

    }


    if (!menu[category]) {

        return null;

    }


    return menu[category].find(

        function(product) {

            return String(product.id) ===
                String(productId);

        }

    ) || null;

}


/* =========================================
   🔍 判斷是否需要客製化
========================================= */

function needsCustomization(product) {

    if (!product) {

        return false;

    }


    return (

        product.type === "noodle" ||

        product.type === "riceNoodle" ||

        product.type === "oden" ||

        product.type === "intestine" ||

        product.type === "dumpling"

    );

}


/* =========================================
   🪟 開啟客製化視窗
========================================= */

function openProductModal(
    productId,
    category
) {

    const product =
        findProduct(
            productId,
            category
        );


    if (!product) {

        alert(
            "找不到商品，請重新整理頁面"
        );

        return;

    }


    currentProduct =
        product;


    modalQuantity =
        1;


    if (modalQty) {

        modalQty.textContent =
            "1";

    }


    if (modalTitle) {

        modalTitle.textContent =
            product.name;

    }


    resetModalOptions();


    /* =====================================
       預設全部隱藏
    ===================================== */

    if (noodleOption) {

        noodleOption.style.display =
            "none";

    }


    if (noodleSelectArea) {

        noodleSelectArea.style.display =
            "none";

    }


    if (odenOption) {

        odenOption.style.display =
            "none";

    }


    /* =====================================
       🍜 麵類
    ===================================== */

    if (product.type === "noodle") {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "block";

        }

    }


    /* =====================================
       🍚 米粉
    ===================================== */

    else if (
        product.type === "riceNoodle"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }

    }


    /* =====================================
       🍢 關東煮
    ===================================== */

    else if (
        product.type === "oden"
    ) {

        setupSauceOptions(
            "關東煮"
        );

    }


    /* =====================================
       🐷 手工大腸
    ===================================== */

    else if (
        product.type === "intestine"
    ) {

        setupSauceOptions(
            "手工大腸"
        );

    }


    /* =====================================
       🥟 水餃
    ===================================== */

    else if (
        product.type === "dumpling"
    ) {

        setupSauceOptions(
            "水餃"
        );

    }


    /* =====================================
       不需要客製化
    ===================================== */

    if (!needsCustomization(product)) {

        addToCart(
            product,
            {},
            1
        );

        return;

    }


    if (customModal) {

        customModal.style.display =
            "flex";

        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================
   🔄 重置客製化選項
========================================= */

function resetModalOptions() {

    document
        .querySelectorAll(
            'input[name="noodle"]'
        )
        .forEach(

            function(input) {

                input.checked =
                    false;

            }

        );


    const defaultNoodle =
        document.querySelector(
            'input[name="noodle"][value="粗麵"]'
        );


    if (defaultNoodle) {

        defaultNoodle.checked =
            true;

    }


    document
        .querySelectorAll(
            'input[name="spicy"]'
        )
        .forEach(

            function(input) {

                input.checked =
                    false;

            }

        );


    const noSpicy =
        document.querySelector(
            'input[name="spicy"][value="不辣"]'
        );


    if (noSpicy) {

        noSpicy.checked =
            true;

    }


    if (noVegetable) {

        noVegetable.checked =
            false;

    }


    if (noOnion) {

        noOnion.checked =
            false;

    }


    document
        .querySelectorAll(
            'input[name="sauce"]'
        )
        .forEach(

            function(input) {

                input.checked =
                    false;

            }

        );


    if (noSauce) {

        noSauce.checked =
            false;

    }

}


/* =========================================
   🥣 設定醬料
   關東煮＋手工大腸共用
========================================= */

function setupSauceOptions(type) {

    const sauceContainer =
        document.getElementById(
            "sauce-options"
        );


    if (!sauceContainer) {

        console.warn(
            "找不到 #sauce-options"
        );

        return;

    }


    let sauces = [];


    /* =====================================
       🍢 關東煮
       🐷 手工大腸
       共用 8 種
    ===================================== */

    if (
        type === "關東煮" ||
        type === "手工大腸"
    ) {

        sauces = [

            {
                value: "不加醬",
                label: "不加醬"
            },

            {
                value: "醬油膏",
                label: "醬油膏",
                default: true
            },

            {
                value: "辣椒醬",
                label: "辣椒醬"
            },

            {
                value: "蕃茄醬",
                label: "蕃茄醬"
            },

            {
                value: "醬油膏+辣椒醬",
                label: "醬油膏＋辣椒醬"
            },

            {
                value: "醬油膏+蕃茄醬",
                label: "醬油膏＋蕃茄醬"
            },

            {
                value: "辣椒醬+蕃茄醬",
                label: "辣椒醬＋蕃茄醬"
            },

            {
                value: "醬料全加",
                label: "醬料全加"
            }

        ];

    }


    /* =====================================
       🥟 水餃
    ===================================== */

    else if (
        type === "水餃"
    ) {

        sauces = [

            {
                value: "清醬油",
                label: "清醬油",
                default: true
            },

            {
                value: "醬油膏",
                label: "醬油膏"
            },

            {
                value: "辣椒醬",
                label: "辣椒醬"
            },

            {
                value: "辣油",
                label: "辣油"
            },

            {
                value: "清醬油+辣油",
                label: "清醬油＋辣油"
            },

            {
                value: "醬油膏+辣椒醬",
                label: "醬油膏＋辣椒醬"
            }

        ];

    }


    sauceContainer.innerHTML = `

        <div class="custom-option-title">

            醬料

        </div>


        <div class="sauce-option-list">

            ${
                sauces.map(

                    function(sauce) {

                        return `

                            <label
                                class="sauce-option-item">

                                <input
                                    type="radio"
                                    name="special-sauce"
                                    value="${escapeHTML(sauce.value)}"
                                    ${
                                        sauce.default
                                            ? "checked"
                                            : ""
                                    }>

                                <span>

                                    ${escapeHTML(sauce.label)}

                                </span>

                            </label>

                        `;

                    }

                ).join("")

            }

        </div>

    `;

}


/* =========================================
   ➕➖ 客製化數量
========================================= */

function changeModalQty(change) {

    modalQuantity +=
        Number(change);


    if (modalQuantity < 1) {

        modalQuantity =
            1;

    }


    if (modalQuantity > 99) {

        modalQuantity =
            99;

    }


    if (modalQty) {

        modalQty.textContent =
            modalQuantity;

    }

}


/* =========================================
   📋 取得客製化選項
========================================= */

function getProductOptions() {

    if (!currentProduct) {

        return {};

    }


    const options = {};


    /* =====================================
       🍜 麵類
    ===================================== */

    if (
        currentProduct.type === "noodle"
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
            noVegetable
                ? !noVegetable.checked
                : true;


        options.onion =
            noOnion
                ? !noOnion.checked
                : true;

    }


    /* =====================================
       🍚 米粉
    ===================================== */

    else if (
        currentProduct.type === "riceNoodle"
    ) {

        const spicy =
            document.querySelector(
                'input[name="spicy"]:checked'
            );


        options.spicy =
            spicy
                ? spicy.value
                : "不辣";


        options.vegetable =
            noVegetable
                ? !noVegetable.checked
                : true;


        options.onion =
            noOnion
                ? !noOnion.checked
                : true;

    }


    /* =====================================
       🍢 關東煮
       🐷 手工大腸
       🥟 水餃
    ===================================== */

    else if (

        currentProduct.type === "oden" ||

        currentProduct.type === "intestine" ||

        currentProduct.type === "dumpling"

    ) {

        const selectedSauce =
            document.querySelector(
                'input[name="special-sauce"]:checked'
            );


        if (selectedSauce) {

            options.sauce =
                selectedSauce.value;

        }


        else {

            if (
                currentProduct.type === "dumpling"
            ) {

                options.sauce =
                    "清醬油";

            }

            else {

                options.sauce =
                    "醬油膏";

            }

        }

    }


    return options;

}


/* =========================================
   ✅ 確認加入購物車
========================================= */

function confirmCustom() {

    if (!currentProduct) {

        return;

    }


    const options =
        getProductOptions();


    addToCart(

        currentProduct,

        options,

        modalQuantity

    );


    closeModal();

}


/* =========================================
   ❌ 關閉 Modal
========================================= */

function closeModal() {

    if (customModal) {

        customModal.style.display =
            "none";

    }


    document.body.style.overflow =
        "";


    currentProduct =
        null;


    modalQuantity =
        1;


    if (modalQty) {

        modalQty.textContent =
            "1";

    }

}


/* =========================================
   🔑 客製化唯一識別
========================================= */

function getOptionsKey(options) {

    if (!options) {

        return "";

    }


    return JSON.stringify(
        options
    );

}


/* =========================================
   🛒 加入購物車
========================================= */

function addToCart(
    product,
    options,
    quantity
) {

    const qty =
        Number(quantity) || 1;


    const optionsKey =
        getOptionsKey(options);


    const existingItem =
        cart.find(

            function(item) {

                return (

                    String(item.id) ===
                    String(product.id)

                ) && (

                    getOptionsKey(
                        item.options
                    ) ===
                    optionsKey

                );

            }

        );


    if (existingItem) {

        existingItem.qty =

            Number(
                existingItem.qty || 0
            ) +

            qty;

    }


    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                Number(
                    product.price || 0
                ),

            qty:
                qty,

            type:
                product.type || "",

            options:
                options || {}

        });

    }


    saveCart();

    renderCart();

    updateCartSummary();


    showCartMessage(

        `✅ ${product.name} 已加入購物車`

    );

}


/* =========================================
   💬 加入購物車提示
========================================= */

function showCartMessage(message) {

    let messageBox =
        document.getElementById(
            "cart-message"
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );


        messageBox.id =
            "cart-message";


        messageBox.style.position =
            "fixed";


        messageBox.style.left =
            "50%";


        messageBox.style.bottom =
            "100px";


        messageBox.style.transform =
            "translateX(-50%)";


        messageBox.style.zIndex =
            "99999";


        messageBox.style.padding =
            "12px 20px";


        messageBox.style.borderRadius =
            "999px";


        messageBox.style.background =
            "#333";


        messageBox.style.color =
            "#fff";


        messageBox.style.fontSize =
            "15px";


        messageBox.style.fontWeight =
            "bold";


        messageBox.style.boxShadow =
            "0 4px 15px rgba(0,0,0,.25)";


        document.body.appendChild(
            messageBox
        );

    }


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    clearTimeout(
        messageBox.hideTimer
    );


    messageBox.hideTimer =

        setTimeout(

            function() {

                messageBox.style.display =
                    "none";

            },

            1800

        );

}


/* =========================================
   🛒 顯示購物車
========================================= */

function renderCart() {

    if (!cartContainer) {

        return;

    }


    if (cart.length === 0) {

        cartContainer.innerHTML = `

            <div class="empty-cart">

                🛒 購物車目前沒有商品

            </div>

        `;

        updateCartSummary();

        return;

    }


    let html = "";


    cart.forEach(

        function(item, index) {

            const price =
                Number(
                    item.price || 0
                );


            const qty =
                Number(
                    item.qty || 1
                );


            const subtotal =
                price * qty;


            const optionList = [];


            if (
                item.options &&
                item.options.noodle
            ) {

                optionList.push(
                    item.options.noodle
                );

            }


            if (
                item.options &&
                item.options.spicy
            ) {

                optionList.push(
                    item.options.spicy
                );

            }


            if (
                item.options &&
                item.options.vegetable === false
            ) {

                optionList.push(
                    "不加菜"
                );

            }


            if (
                item.options &&
                item.options.onion === false
            ) {

                optionList.push(
                    "不加蔥"
                );

            }


            if (
                item.options &&
                item.options.sauce
            ) {

                if (
                    Array.isArray(
                        item.options.sauce
                    )
                ) {

                    optionList.push(

                        item.options.sauce.join(
                            "＋"
                        )

                    );

                }

                else {

                    optionList.push(
                        item.options.sauce
                    );

                }

            }


            let optionsHTML =
                "";


            if (
                optionList.length > 0
            ) {

                optionsHTML = `

                    <div class="cart-options">

                        ${escapeHTML(
                            optionList.join(
                                " ・ "
                            )
                        )}

                    </div>

                `;

            }


            html += `

                <div
                    class="cart-item"
                    data-index="${index}">

                    <div class="cart-item-info">

                        <h3>

                            ${escapeHTML(
                                item.name ||
                                "商品"
                            )}

                        </h3>


                        ${optionsHTML}


                        <div class="cart-item-price">

                            NT$${price}

                        </div>

                    </div>


                    <div class="cart-item-actions">

                        <div class="cart-qty">

                            <button
                                type="button"
                                class="cart-minus"
                                data-index="${index}">

                                −

                            </button>


                            <span>

                                ${qty}

                            </span>


                            <button
                                type="button"
                                class="cart-plus"
                                data-index="${index}">

                                ＋

                            </button>

                        </div>


                        <strong>

                            NT$${subtotal}

                        </strong>


                        <button
                            type="button"
                            class="cart-delete"
                            data-index="${index}">

                            🗑️

                        </button>

                    </div>

                </div>

            `;

        }

    );


    html += `

        <div class="cart-total-box">

            <span>

                購物車合計

            </span>


            <strong>

                NT$${getCartTotal()}

            </strong>

        </div>

    `;


    cartContainer.innerHTML =
        html;


    cartContainer
        .querySelectorAll(".cart-minus")
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        changeCartQty(

                            Number(
                                this.dataset.index
                            ),

                            -1

                        );

                    }

                );

            }

        );


    cartContainer
        .querySelectorAll(".cart-plus")
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        changeCartQty(

                            Number(
                                this.dataset.index
                            ),

                            1

                        );

                    }

                );

            }

        );


    cartContainer
        .querySelectorAll(".cart-delete")
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        removeCartItem(

                            Number(
                                this.dataset.index
                            )

                        );

                    }

                );

            }

        );


    updateCartSummary();

}


/* =========================================
   ➕➖ 修改購物車數量
========================================= */

function changeCartQty(
    index,
    change
) {

    if (!cart[index]) {

        return;

    }


    cart[index].qty =

        Number(
            cart[index].qty || 1
        ) +

        Number(change);


    if (cart[index].qty <= 0) {

        removeCartItem(index);

        return;

    }


    if (cart[index].qty > 99) {

        cart[index].qty =
            99;

    }


    saveCart();

    renderCart();

    updateCartSummary();

}


/* =========================================
   🗑️ 刪除購物車商品
========================================= */

function removeCartItem(index) {

    if (!cart[index]) {

        return;

    }


    const productName =
        cart[index].name ||
        "商品";


    if (
        !confirm(
            `確定要移除「${productName}」嗎？`
        )
    ) {

        return;

    }


    cart.splice(
        index,
        1
    );


    saveCart();

    renderCart();

    updateCartSummary();


    showCartMessage(

        `🗑️ 已移除 ${productName}`

    );

}


/* =========================================
   🛍️ 前往結帳
========================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(

        "click",

        function() {

            if (cart.length === 0) {

                alert(
                    "購物車目前沒有商品"
                );

                return;

            }


            window.location.href =
                "checkout.html";

        }

    );

}


/* =========================================
   📂 商品分類
========================================= */

document
    .querySelectorAll(
        ".category-nav button"
    )
    .forEach(

        function(button) {

            button.addEventListener(

                "click",

                function() {

                    const category =
                        this.dataset.category;


                    document
                        .querySelectorAll(
                            ".category-nav button"
                        )
                        .forEach(

                            function(btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            }

                        );


                    this.classList.add(
                        "active"
                    );


                    renderMenu(
                        category
                    );

                }

            );

        }

    );


/* =========================================
   ⭐ 預設顯示麵類
========================================= */

const firstCategoryButton =
    document.querySelector(
        '.category-nav button[data-category="麵類"]'
    );


if (firstCategoryButton) {

    firstCategoryButton.classList.add(
        "active"
    );

}


renderMenu(
    "麵類"
);


/* =========================================
   🪟 點擊 Modal 外部關閉
========================================= */

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
   ⌨️ ESC 關閉 Modal
========================================= */

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            if (

                customModal &&

                customModal.style.display !==
                "none"

            ) {

                closeModal();

            }

        }

    }

);


/* =========================================
   🚀 初始化
========================================= */

renderCart();

updateCartSummary();


console.log(
    "🍜 初萊食麵 order.js 已成功載入"
);


console.log(
    "商品資料：",
    typeof menu !== "undefined"
        ? menu
        : "menu.js 未載入"
);


console.log(
    "目前購物車：",
    cart
);