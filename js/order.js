/* =========================================================
   🍜 初萊食麵 V4
   order.js

   配合：
   - order.html
   - menu.js
   - checkout.js

   功能：
   1. 商品分類
   2. 商品顯示
   3. 麵類客製化
   4. 米粉客製化
   5. 關東煮醬料
   6. 客製化數量
   7. 加入購物車
   8. 購物車增加數量
   9. 購物車減少數量
   10. 刪除購物車商品
   11. localStorage 保存
   12. 前往結帳
   13. 手機號碼查詢上次訂單
   14. 一鍵再次訂購
   15. 自動記住姓名與電話
   16. 手機版按鈕優化
========================================================= */


/* =========================================================
   ① 購物車資料
========================================================= */

let cart = [];

try {

    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    if (!Array.isArray(cart)) {

        cart = [];

    }

} catch (error) {

    console.error(
        "購物車資料讀取失敗",
        error
    );

    cart = [];

}


/* =========================================================
   ② 目前客製化商品
========================================================= */

let currentProduct = null;


/* =========================================================
   ③ 客製化數量
========================================================= */

let modalQuantity = 1;


/* =========================================================
   ④ DOM
========================================================= */

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

const welcomePhone =
    document.getElementById("welcome-phone");

const welcomeSearchBtn =
    document.getElementById("welcome-search-btn");

const welcomeResult =
    document.getElementById("welcome-result");


/* =========================================================
   ⑤ 儲存購物車
========================================================= */

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   ⑥ HTML 安全處理
========================================================= */

function escapeHTML(text) {

    return String(text ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   ⑦ 取得購物車總數量
========================================================= */

function getCartCount() {

    return cart.reduce(

        function(total, item) {

            return total +
                Number(item.qty || 0);

        },

        0

    );

}


/* =========================================================
   ⑧ 取得購物車總金額
========================================================= */

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


/* =========================================================
   ⑨ 更新浮動購物車
========================================================= */

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


    if (!checkoutBtn) {

        return;

    }


    if (cart.length === 0) {

        checkoutBtn.disabled =
            true;

        checkoutBtn.textContent =
            "🛒 購物車是空的";

        checkoutBtn.classList.add(
            "disabled"
        );

    }

    else {

        checkoutBtn.disabled =
            false;

        checkoutBtn.textContent =
            "🛒 前往結帳 →";

        checkoutBtn.classList.remove(
            "disabled"
        );

    }

}


/* =========================================================
   ⑩ 顯示商品
========================================================= */

function renderMenu(category) {

    if (!menuContainer) {

        return;

    }


    if (
        typeof menu === "undefined"
    ) {

        menuContainer.innerHTML = `

            <div class="menu-error">

                ⚠️ 商品資料載入失敗

                <br>

                請確認 menu.js 是否正確載入

            </div>

        `;

        return;

    }


    const products =
        menu[category];


    if (
        !products ||
        products.length === 0
    ) {

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

                            ${escapeHTML(
                                product.name
                            )}

                        </h3>


                        <strong>

                            NT$${Number(
                                product.price
                            )}

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
        .querySelectorAll(
            ".add-product-btn"
        )
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        const productId =
                            this.dataset.productId;

                        const category =
                            this.dataset.category;


                        openProductModal(

                            productId,

                            category

                        );

                    }

                );

            }

        );

}


/* =========================================================
   ⑪ 找商品
========================================================= */

function findProduct(
    productId,
    category
) {

    if (
        typeof menu === "undefined"
    ) {

        return null;

    }


    if (
        !menu[category]
    ) {

        return null;

    }


    return menu[category].find(

        function(product) {

            return String(product.id) ===
                String(productId);

        }

    ) || null;

}


/* =========================================================
   ⑫ 判斷是否需要客製化
========================================================= */

function needsCustomization(product) {

    if (!product) {

        return false;

    }


    return (

        product.type === "noodle" ||

        product.type === "riceNoodle" ||

        product.type === "oden"

    );

}


/* =========================================================
   ⑬ 開啟商品客製化視窗
========================================================= */

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


    /* 麵類 */

    if (
        product.type === "noodle"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "block";

        }


        if (odenOption) {

            odenOption.style.display =
                "none";

        }

    }


    /* 米粉 */

    else if (
        product.type === "riceNoodle"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "none";

        }


        if (odenOption) {

            odenOption.style.display =
                "none";

        }

    }


    /* 關東煮 */

    else if (
        product.type === "oden"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "none";

        }


        if (odenOption) {

            odenOption.style.display =
                "block";

        }

    }


    /* 不需要客製化 */

    else {

        if (noodleOption) {

            noodleOption.style.display =
                "none";

        }


        if (odenOption) {

            odenOption.style.display =
                "none";

        }

    }


    if (
        !needsCustomization(product)
    ) {

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


/* =========================================================
   ⑭ 重置客製化選項
========================================================= */

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

}


/* =========================================================
   ⑮ 客製化數量
========================================================= */

function changeModalQty(change) {

    modalQuantity +=
        Number(change);


    if (
        modalQuantity < 1
    ) {

        modalQuantity =
            1;

    }


    if (
        modalQuantity > 99
    ) {

        modalQuantity =
            99;

    }


    if (modalQty) {

        modalQty.textContent =
            modalQuantity;

    }

}


/* =========================================================
   ⑯ 取得客製化選項
========================================================= */

function getProductOptions() {

    if (!currentProduct) {

        return {};

    }


    const options = {};


    /* 麵類 */

    if (
        currentProduct.type ===
        "noodle"
    ) {

        const noodle =
            document.querySelector(
                'input[name="noodle"]:checked'
            );


        const spicy =
            document.querySelector(
                'input[name="spicy"]:checked'
            );


        if (noodle) {

            options.noodle =
                noodle.value;

        }


        if (spicy) {

            options.spicy =
                spicy.value;

        }


        options.vegetable =
            noVegetable
                ? !noVegetable.checked
                : true;


        options.onion =
            noOnion
                ? !noOnion.checked
                : true;

    }


    /* 米粉 */

    else if (
        currentProduct.type ===
        "riceNoodle"
    ) {

        const spicy =
            document.querySelector(
                'input[name="spicy"]:checked'
            );


        if (spicy) {

            options.spicy =
                spicy.value;

        }


        options.vegetable =
            noVegetable
                ? !noVegetable.checked
                : true;


        options.onion =
            noOnion
                ? !noOnion.checked
                : true;

    }


    /* 關東煮 */

    else if (
        currentProduct.type ===
        "oden"
    ) {

        const sauces = [];


        document
            .querySelectorAll(
                'input[name="sauce"]:checked'
            )
            .forEach(

                function(input) {

                    if (
                        input.value !==
                        "都不加"
                    ) {

                        sauces.push(
                            input.value
                        );

                    }

                }

            );


        if (
            noSauce &&
            noSauce.checked
        ) {

            options.sauce =
                "都不加";

        }

        else if (
            sauces.length > 0
        ) {

            options.sauce =
                sauces;

        }

    }


    return options;

}


/* =========================================================
   ⑰ 確認加入購物車
========================================================= */

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


/* =========================================================
   ⑱ 關閉客製化視窗
========================================================= */

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


/* =========================================================
   ⑲ 客製化唯一識別
========================================================= */

function getOptionsKey(options) {

    if (!options) {

        return "";

    }


    return JSON.stringify(
        options
    );

}


/* =========================================================
   ⑳ 加入購物車
========================================================= */

function addToCart(
    product,
    options,
    quantity
) {

    const qty =
        Math.max(
            1,
            Number(quantity) || 1
        );


    const safeOptions =
        options || {};


    const optionsKey =
        getOptionsKey(
            safeOptions
        );


    const existingItem =
        cart.find(

            function(item) {

                return (

                    String(item.id) ===
                    String(product.id)

                ) && (

                    getOptionsKey(
                        item.options || {}
                    ) ===
                    optionsKey

                );

            }

        );


    if (existingItem) {

        existingItem.qty =
            Math.min(

                99,

                Number(
                    existingItem.qty || 0
                ) + qty

            );

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                Number(product.price) || 0,

            qty:
                qty,

            type:
                product.type || "",

            options:
                safeOptions

        });

    }


    saveCart();

    renderCart();

    updateCartSummary();


    showCartMessage(

        `✅ ${product.name} 已加入購物車`

    );

}


/* =========================================================
   ㉑ 購物車提示
========================================================= */

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


        messageBox.className =
            "cart-message";


        document.body.appendChild(
            messageBox
        );

    }


    messageBox.textContent =
        message;


    messageBox.classList.add(
        "show"
    );


    clearTimeout(
        messageBox.hideTimer
    );


    messageBox.hideTimer =
        setTimeout(

            function() {

                messageBox.classList.remove(
                    "show"
                );

            },

            1800

        );

}


/* =========================================================
   ㉒ 購物車選項文字
========================================================= */

function getOptionsText(options) {

    if (
        !options
    ) {

        return "";

    }


    const list = [];


    if (
        options.noodle
    ) {

        list.push(
            options.noodle
        );

    }


    if (
        options.spicy
    ) {

        list.push(
            options.spicy
        );

    }


    if (
        options.vegetable === false
    ) {

        list.push(
            "不加菜"
        );

    }


    if (
        options.onion === false
    ) {

        list.push(
            "不加蔥"
        );

    }


    if (
        options.sauce
    ) {

        if (
            Array.isArray(
                options.sauce
            )
        ) {

            list.push(
                options.sauce.join(
                    "＋"
                )
            );

        }

        else {

            list.push(
                options.sauce
            );

        }

    }


    return list.join(
        " ・ "
    );

}


/* =========================================================
   ㉓ 顯示購物車
========================================================= */

function renderCart() {

    if (!cartContainer) {

        return;

    }


    if (
        cart.length === 0
    ) {

        cartContainer.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">

                    🛒

                </div>

                <strong>

                    購物車目前沒有商品

                </strong>

                <small>

                    選擇喜歡的餐點加入購物車吧！

                </small>

            </div>

        `;

        updateCartSummary();

        return;

    }


    let html = "";


    cart.forEach(

        function(item, index) {

            const qty =
                Number(item.qty) || 1;


            const price =
                Number(item.price) || 0;


            const subtotal =
                price * qty;


            const optionsText =
                getOptionsText(
                    item.options
                );


            html += `

                <div
                    class="cart-item"
                    data-index="${index}">


                    <div class="cart-item-info">

                        <h3>

                            ${escapeHTML(
                                item.name
                            )}

                        </h3>


                        ${
                            optionsText
                                ? `

                                <div class="cart-options">

                                    ${escapeHTML(
                                        optionsText
                                    )}

                                </div>

                                `
                                : ""

                        }


                        <div class="cart-item-price">

                            NT$${price}

                        </div>

                    </div>


                    <div class="cart-item-actions">


                        <div class="cart-qty">


                            <button
                                type="button"
                                class="cart-minus"
                                data-index="${index}"
                                aria-label="減少數量">

                                −

                            </button>


                            <span class="cart-qty-number">

                                ${qty}

                            </span>


                            <button
                                type="button"
                                class="cart-plus"
                                data-index="${index}"
                                aria-label="增加數量">

                                ＋

                            </button>


                        </div>


                        <strong class="cart-subtotal">

                            NT$${subtotal}

                        </strong>


                        <button
                            type="button"
                            class="cart-delete"
                            data-index="${index}"
                            aria-label="刪除商品">

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


    /* 減少 */

    cartContainer
        .querySelectorAll(
            ".cart-minus"
        )
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        changeCartQty(

                            index,

                            -1

                        );

                    }

                );

            }

        );


    /* 增加 */

    cartContainer
        .querySelectorAll(
            ".cart-plus"
        )
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        changeCartQty(

                            index,

                            1

                        );

                    }

                );

            }

        );


    /* 刪除 */

    cartContainer
        .querySelectorAll(
            ".cart-delete"
        )
        .forEach(

            function(button) {

                button.addEventListener(

                    "click",

                    function() {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        removeCartItem(
                            index
                        );

                    }

                );

            }

        );


    updateCartSummary();

}


/* =========================================================
   ㉔ 修改購物車數量
========================================================= */

function changeCartQty(
    index,
    change
) {

    if (
        !cart[index]
    ) {

        return;

    }


    const oldQty =
        Number(
            cart[index].qty || 1
        );


    const newQty =
        oldQty +
        Number(change);


    /* 最低 1 */

    if (
        newQty <= 0
    ) {

        removeCartItem(
            index
        );

        return;

    }


    /* 最高 99 */

    cart[index].qty =
        Math.min(
            99,
            newQty
        );


    saveCart();

    renderCart();

    updateCartSummary();

}


/* =========================================================
   ㉕ 刪除購物車商品
========================================================= */

function removeCartItem(index) {

    if (
        !cart[index]
    ) {

        return;

    }


    const productName =
        cart[index].name;


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


/* =========================================================
   ㉖ 前往結帳
========================================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(

        "click",

        function() {

            if (
                cart.length === 0
            ) {

                showCartMessage(
                    "🛒 購物車目前沒有商品"
                );

                return;

            }


            window.location.href =
                "checkout.html";

        }

    );

}


/* =========================================================
   ㉗ 商品分類
========================================================= */

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


/* =========================================================
   ㉘ 預設顯示麵類
========================================================= */

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


/* =========================================================
   ㉙ 點擊 Modal 背景關閉
========================================================= */

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


/* =========================================================
   ㉚ ESC 關閉 Modal
========================================================= */

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            customModal &&
            customModal.style.display !==
            "none"
        ) {

            closeModal();

        }

    }

);


/* =========================================================
   ㉛ 關東煮「都不加」
========================================================= */

if (noSauce) {

    noSauce.addEventListener(

        "change",

        function() {

            if (
                !this.checked
            ) {

                return;

            }


            document
                .querySelectorAll(
                    'input[name="sauce"]'
                )
                .forEach(

                    function(input) {

                        if (
                            input !==
                            noSauce
                        ) {

                            input.checked =
                                false;

                        }

                    }

                );

        }

    );

}


/* =========================================================
   ㉜ 選擇其他醬料時取消「都不加」
========================================================= */

document
    .querySelectorAll(
        'input[name="sauce"]'
    )
    .forEach(

        function(input) {

            if (
                input ===
                noSauce
            ) {

                return;

            }


            input.addEventListener(

                "change",

                function() {

                    if (
                        this.checked &&
                        noSauce
                    ) {

                        noSauce.checked =
                            false;

                    }

                }

            );

        }

    );


/* =========================================================
   ㉝ 自動載入之前顧客資料
========================================================= */

function loadSavedCustomer() {

    const savedPhone =
        localStorage.getItem(
            "customerPhone"
        );


    if (
        welcomePhone &&
        savedPhone
    ) {

        welcomePhone.value =
            savedPhone;

    }

}


loadSavedCustomer();


/* =========================================================
   ㉞ 手機號碼限制
========================================================= */

if (welcomePhone) {

    welcomePhone.addEventListener(

        "input",

        function() {

            this.value =

                this.value

                    .replace(
                        /\D/g,
                        ""
                    )

                    .slice(
                        0,
                        10
                    );

        }

    );

}


/* =========================================================
   ㉟ 回頭客查詢
========================================================= */

if (welcomeSearchBtn) {

    welcomeSearchBtn.addEventListener(

        "click",

        searchPreviousOrder

    );

}


/* =========================================================
   ㊱ 查詢最後一筆訂單
========================================================= */

async function searchPreviousOrder() {

    if (!welcomePhone) {

        return;

    }


    const phone =
        welcomePhone.value.trim();


    if (
        !/^09\d{8}$/.test(phone)
    ) {

        if (welcomeResult) {

            welcomeResult.style.display =
                "block";

            welcomeResult.innerHTML = `

                ⚠️ 請輸入正確的手機號碼

            `;

        }


        welcomePhone.focus();

        return;

    }


    const SCRIPT_URL =

        "https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec";


    if (welcomeResult) {

        welcomeResult.style.display =
            "block";

        welcomeResult.innerHTML = `

            🔍 正在查詢您的上次訂單...

        `;

    }


    if (welcomeSearchBtn) {

        welcomeSearchBtn.disabled =
            true;

        welcomeSearchBtn.textContent =
            "查詢中...";

    }


    try {

        const response =
            await fetch(

                SCRIPT_URL,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "findLastOrder",

                            phone:
                                phone

                        })

                }

            );


        if (!response.ok) {

            throw new Error(
                "伺服器回應錯誤"
            );

        }


        const result =
            await response.json();


        console.log(
            "回頭客查詢結果：",
            result
        );


        if (
            !result.success ||
            !result.order
        ) {

            if (welcomeResult) {

                welcomeResult.innerHTML = `

                    <div class="welcome-not-found">

                        😌 找不到之前的訂單

                        <br><br>

                        歡迎第一次來到初萊食麵！

                    </div>

                `;

            }

            return;

        }


        const order =
            result.order;


        /* 儲存姓名 */

        if (
            order.name
        ) {

            localStorage.setItem(

                "customerName",

                order.name

            );

        }


        /* 儲存電話 */

        localStorage.setItem(

            "customerPhone",

            phone

        );


        let itemsHTML =
            "";


        if (
            Array.isArray(
                order.items
            )
        ) {

            itemsHTML =

                order.items

                    .map(

                        function(item) {

                            return `

                                <div class="previous-order-item">

                                    <span>

                                        ${escapeHTML(
                                            item.name ||
                                            "商品"
                                        )}

                                    </span>

                                    <strong>

                                        ×${Number(
                                            item.qty ||
                                            1
                                        )}

                                    </strong>

                                </div>

                            `;

                        }

                    )

                    .join("");

        }


        if (welcomeResult) {

            welcomeResult.innerHTML = `

                <div class="welcome-success">

                    <div class="welcome-customer-name">

                        👋 歡迎回來，

                        <strong>

                            ${escapeHTML(
                                order.name ||
                                "熟客"
                            )}

                        </strong>

                    </div>


                    <div class="previous-order-title">

                        🍜 您上次點了：

                    </div>


                    <div class="previous-order-list">

                        ${itemsHTML}

                    </div>


                    <div class="previous-order-total">

                        上次訂單金額：

                        <strong>

                            NT$${Number(
                                order.total ||
                                0
                            )}

                        </strong>

                    </div>


                    <button
                        type="button"
                        id="use-last-order-btn"
                        class="use-last-order-btn">

                        🛒 一鍵使用上次訂單

                    </button>

                </div>

            `;


            const useLastOrderBtn =
                document.getElementById(
                    "use-last-order-btn"
                );


            if (useLastOrderBtn) {

                useLastOrderBtn.addEventListener(

                    "click",

                    function() {

                        if (
                            !Array.isArray(
                                order.items
                            )
                        ) {

                            return;

                        }


                        let addedCount =
                            0;


                        order.items.forEach(

                            function(item) {

                                const product = {

                                    id:
                                        item.id ||
                                        "OLD-" +
                                        Date.now() +
                                        "-" +
                                        Math.random(),

                                    name:
                                        item.name ||
                                        "商品",

                                    price:
                                        Number(
                                            item.price ||
                                            0
                                        ),

                                    type:
                                        item.type ||
                                        ""

                                };


                                addToCart(

                                    product,

                                    item.options ||
                                    {},

                                    Number(
                                        item.qty ||
                                        1
                                    )

                                );


                                addedCount++;

                            }

                        );


                        if (
                            addedCount > 0
                        ) {

                            showCartMessage(

                                "✅ 上次訂單已加入購物車"

                            );

                        }


                        renderCart();

                        updateCartSummary();


                        /* 自動移動到購物車 */

                        setTimeout(

                            function() {

                                if (cartContainer) {

                                    cartContainer.scrollIntoView({

                                        behavior:
                                            "smooth",

                                        block:
                                            "center"

                                    });

                                }

                            },

                            300

                        );

                    }

                );

            }

        }

    }

    catch (error) {

        console.error(

            "查詢上一筆訂單失敗：",

            error

        );


        if (welcomeResult) {

            welcomeResult.innerHTML = `

                ⚠️ 查詢失敗

                <br><br>

                請稍後再試一次

            `;

        }

    }

    finally {

        if (welcomeSearchBtn) {

            welcomeSearchBtn.disabled =
                false;

            welcomeSearchBtn.textContent =
                "🔍 查詢";

        }

    }

}


/* =========================================================
   ㊲ 初始化
========================================================= */

renderCart();

updateCartSummary();


/* =========================================================
   ㊳ Console
========================================================= */

console.log(
    "🍜 初萊食麵 V4 order.js 已載入"
);

console.log(
    "目前購物車：",
    cart
);