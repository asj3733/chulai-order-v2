/* =========================================
   🍜 初萊食麵 V3
   order.js
   線上點餐／購物車完整版本

   配合：
   - order.html
   - menu.js
   - checkout.js

   功能：
   1. 顯示商品
   2. 商品分類切換
   3. 麵類客製化
   4. 米粉客製化
   5. 關東煮醬料
   6. 數量調整
   7. 加入購物車
   8. 購物車增加數量
   9. 購物車減少數量
   10. 購物車刪除
   11. localStorage 儲存
   12. 前往結帳
   13. 手機號碼查詢上次訂單
========================================= */


/* =========================================
   購物車
========================================= */

let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


/* =========================================
   客製化目前商品
========================================= */

let currentProduct = null;


/* =========================================
   客製化目前數量
========================================= */

let modalQuantity = 1;


/* =========================================
   DOM
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

const welcomePhone =
    document.getElementById("welcome-phone");

const welcomeSearchBtn =
    document.getElementById("welcome-search-btn");

const welcomeResult =
    document.getElementById("welcome-result");


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
   HTML 防注入
========================================= */

function escapeHTML(text) {

    return String(text || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   取得購物車總數量
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
   取得購物車總金額
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
   更新浮動購物車
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


    /*
        購物車沒有商品
    */

    if (checkoutBtn) {

        if (cart.length === 0) {

            checkoutBtn.disabled =
                true;

            checkoutBtn.textContent =
                "購物車是空的";

        }

        else {

            checkoutBtn.disabled =
                false;

            checkoutBtn.textContent =
                "前往結帳 →";

        }

    }

}


/* =========================================
   顯示商品
========================================= */

function renderMenu(
    category
) {

    if (!menuContainer) {

        return;

    }


    /*
        確認 menu 是否存在
    */

    if (
        typeof menu === "undefined"
    ) {

        console.error(
            "找不到 menu 商品資料，請確認 menu.js 是否正確載入"
        );

        menuContainer.innerHTML = `

            <div class="menu-error">

                ⚠️ 商品資料載入失敗

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


    /*
        綁定加入按鈕
    */

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

                        const productCategory =
                            this.dataset.category;


                        openProductModal(

                            productId,

                            productCategory

                        );

                    }

                );

            }

        );

}


/* =========================================
   找商品
========================================= */

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

            return product.id ===
                productId;

        }

    ) || null;

}


/* =========================================
   判斷是否需要客製化
========================================= */

function needsCustomization(
    product
) {

    if (!product) {

        return false;

    }


    /*
        麵類
    */

    if (
        product.type === "noodle"
    ) {

        return true;

    }


    /*
        米粉
    */

    if (
        product.type === "riceNoodle"
    ) {

        return true;

    }


    /*
        關東煮
    */

    if (
        product.type === "oden"
    ) {

        return true;

    }


    /*
        其他商品如果有指定 type
    */

    if (
        product.type === "sauce"
    ) {

        return true;

    }


    return false;

}


/* =========================================
   開啟客製化視窗
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
            modalQuantity;

    }


    if (modalTitle) {

        modalTitle.textContent =
            product.name;

    }


    /*
        先重置所有選項
    */

    resetModalOptions();


    /*
        麵類
    */

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


    /*
        米粉
    */

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


    /*
        關東煮
    */

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


    /*
        其他客製化商品
    */

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


    /*
        不需要客製化
        直接加入
    */

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


    /*
        顯示視窗
    */

    if (customModal) {

        customModal.style.display =
            "flex";

        document.body.style.overflow =
            "hidden";

    }

}


/* =========================================
   重置客製化
========================================= */

function resetModalOptions() {


    /*
        麵條
    */

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


    /*
        辣度
    */

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


    /*
        預設不辣
    */

    const noSpicy =
        document.querySelector(
            'input[name="spicy"][value="不辣"]'
        );


    if (noSpicy) {

        noSpicy.checked =
            true;

    }


    /*
        不加菜
    */

    if (noVegetable) {

        noVegetable.checked =
            false;

    }


    /*
        不加蔥
    */

    if (noOnion) {

        noOnion.checked =
            false;

    }


    /*
        醬料
    */

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


/* =========================================
   修改客製化數量
========================================= */

function changeModalQty(
    change
) {

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


/* =========================================
   取得客製化選項
========================================= */

function getProductOptions() {

    if (!currentProduct) {

        return {};

    }


    const options = {};


    /*
        麵類
    */

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


    /*
        米粉
    */

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


    /*
        關東煮
    */

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


/* =========================================
   客製化確認
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
   關閉客製化視窗
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
   建立選項唯一識別
========================================= */

function getOptionsKey(
    options
) {

    if (!options) {

        return "";

    }


    return JSON.stringify(
        options
    );

}


/* =========================================
   加入購物車
========================================= */

function addToCart(
    product,
    options,
    quantity
) {

    const qty =
        Number(quantity) || 1;


    const optionsKey =
        getOptionsKey(
            options
        );


    /*
        找相同商品＋相同客製化
    */

    const existingItem =
        cart.find(

            function(item) {

                return (

                    item.id ===
                    product.id

                ) && (

                    getOptionsKey(
                        item.options
                    ) ===
                    optionsKey

                );

            }

        );


    if (existingItem) {

        existingItem.qty +=
            qty;

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                Number(product.price),

            qty:
                qty,

            type:
                product.type ||
                "",

            options:
                options || {}

        });

    }


    saveCart();

    renderCart();

    updateCartSummary();


    /*
        顯示加入成功
    */

    showCartMessage(

        `✅ ${product.name} 已加入購物車`

    );

}


/* =========================================
   顯示加入購物車提示
========================================= */

function showCartMessage(
    message
) {

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
            "90px";

        messageBox.style.transform =
            "translateX(-50%)";

        messageBox.style.zIndex =
            "9999";

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
   顯示購物車
========================================= */

function renderCart() {

    if (!cartContainer) {

        return;

    }


    /*
        空購物車
    */

    if (
        cart.length === 0
    ) {

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

            const subtotal =
                Number(item.price) *
                Number(item.qty);


            let optionsText =
                "";


            if (
                item.options
            ) {

                const optionList =
                    [];


                if (
                    item.options.noodle
                ) {

                    optionList.push(
                        item.options.noodle
                    );

                }


                if (
                    item.options.spicy
                ) {

                    optionList.push(
                        item.options.spicy
                    );

                }


                if (
                    item.options.vegetable ===
                    false
                ) {

                    optionList.push(
                        "不加菜"
                    );

                }


                if (
                    item.options.onion ===
                    false
                ) {

                    optionList.push(
                        "不加蔥"
                    );

                }


                if (
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


                if (
                    optionList.length > 0
                ) {

                    optionsText = `

                        <div class="cart-options">

                            ${escapeHTML(
                                optionList.join(
                                    " ・ "
                                )
                            )}

                        </div>

                    `;

                }

            }


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


                        ${optionsText}


                        <div class="cart-item-price">

                            NT$${Number(
                                item.price
                            )}

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

                                ${item.qty}

                            </span>


                            <button
                                type="button"
                                class="cart-plus"
                                data-index="${index}">

                                ＋

                            </button>


                        </div>


                        <strong class="cart-subtotal">

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


    /*
        減少數量
    */

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


    /*
        增加數量
    */

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


    /*
        刪除商品
    */

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


/* =========================================
   修改購物車數量
========================================= */

function changeCartQty(
    index,
    change
) {

    if (
        !cart[index]
    ) {

        return;

    }


    cart[index].qty +=
        Number(change);


    /*
        數量最低為1
    */

    if (
        cart[index].qty <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }


    /*
        數量最高99
    */

    if (
        cart[index] &&
        cart[index].qty > 99
    ) {

        cart[index].qty =
            99;

    }


    saveCart();

    renderCart();

    updateCartSummary();

}


/* =========================================
   刪除購物車商品
========================================= */

function removeCartItem(
    index
) {

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


/* =========================================
   點擊購物車浮動按鈕
========================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(

        "click",

        function() {

            if (
                cart.length === 0
            ) {

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
   點擊分類
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


                    /*
                        移除目前分類
                    */

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


                    /*
                        設定目前分類
                    */

                    this.classList.add(
                        "active"
                    );


                    /*
                        顯示商品
                    */

                    renderMenu(
                        category
                    );

                }

            );

        }

    );


/* =========================================
   預設顯示麵類
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
   點擊 Modal 背景關閉
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
   ESC 關閉客製化視窗
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
   關東煮「都不加」
   與其他醬料互斥
========================================= */

if (noSauce) {

    noSauce.addEventListener(

        "change",

        function() {

            if (
                this.checked
            ) {

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

        }

    );

}


/* =========================================
   關東煮其他醬料
   選擇後取消「都不加」
========================================= */

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


/* =========================================
   歡迎回來
   自動帶入之前資料
========================================= */

function loadSavedCustomer() {

    const savedName =
        localStorage.getItem(
            "customerName"
        );


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


    console.log(
        "已載入顧客資料：",
        savedName,
        savedPhone
    );

}


loadSavedCustomer();


/* =========================================
   手機號碼只允許數字
========================================= */

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


/* =========================================
   回頭客查詢
   查詢最後一次訂單
========================================= */

if (welcomeSearchBtn) {

    welcomeSearchBtn.addEventListener(

        "click",

        searchPreviousOrder

    );

}


/* =========================================
   查詢上一筆訂單
========================================= */

async function searchPreviousOrder() {

    if (!welcomePhone) {

        return;

    }


    const phone =
        welcomePhone.value.trim();


    if (
        !/^09\d{8}$/.test(phone)
    ) {

        alert(
            "請輸入正確的手機號碼"
        );

        welcomePhone.focus();

        return;

    }


    /*
        這裡使用你的 V3 GAS
    */

    const SCRIPT_URL =

        "https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec";


    if (welcomeResult) {

        welcomeResult.style.display =
            "block";

        welcomeResult.innerHTML = `

            🔍 正在查詢您的訂單...

        `;

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


        const result =
            await response.json();


        console.log(
            "查詢結果：",
            result
        );


        if (
            !result.success ||
            !result.order
        ) {

            if (welcomeResult) {

                welcomeResult.innerHTML = `

                    😌 找不到之前的訂單

                    <br>

                    歡迎第一次來到初萊食麵！

                `;

            }

            return;

        }


        const order =
            result.order;


        /*
            儲存顧客資料
        */

        if (
            order.name
        ) {

            localStorage.setItem(

                "customerName",

                order.name

            );

        }


        localStorage.setItem(

            "customerPhone",

            phone

        );


        /*
            顯示查詢結果
        */

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

                                <div>

                                    ${escapeHTML(
                                        item.name
                                    )}

                                    ×

                                    ${item.qty}

                                </div>

                            `;

                        }

                    )

                    .join("");

        }


        if (welcomeResult) {

            welcomeResult.innerHTML = `

                <div>

                    👋 歡迎回來，

                    <strong>

                        ${escapeHTML(
                            order.name ||
                            ""
                        )}

                    </strong>

                </div>


                <div>

                    您上次點了：

                </div>


                <div>

                    ${itemsHTML}

                </div>


                <div>

                    上次訂單：

                    NT$${Number(
                        order.total || 0
                    )}

                </div>


                <button
                    type="button"
                    id="use-last-order-btn">

                    🛒 使用上次訂單

                </button>

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
                            Array.isArray(
                                order.items
                            )
                        ) {

                            order.items.forEach(

                                function(item) {

                                    const product = {

                                        id:
                                            item.id ||
                                            "OLD-" +
                                            Date.now() +
                                            Math.random(),

                                        name:
                                            item.name,

                                        price:
                                            Number(
                                                item.price ||
                                                0
                                            ),

                                        type:
                                            item.type ||
                                            "",

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

                                }

                            );

                        }


                        alert(
                            "✅ 已將上次訂單加入購物車"
                        );


                        renderCart();

                        updateCartSummary();

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

                <br>

                請稍後再試一次

            `;

        }

    }

}


/* =========================================
   初始化購物車
========================================= */

renderCart();

updateCartSummary();


/* =========================================
   Console
========================================= */

console.log(
    "🍜 初萊食麵 V3 order.js 已載入"
);

console.log(
    "目前購物車：",
    cart
);