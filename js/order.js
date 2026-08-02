/* =========================================
   🍜 初萊食麵
   order.js｜線上點餐完整版本
   =========================================
   功能：
   1. 顯示商品
   2. 商品分類
   3. 麵類客製化
   4. 米粉客製化
   5. 辣度
   6. 不加菜
   7. 不加蔥
   8. 關東煮醬料
   9. 手工大腸醬料
   10. 水餃醬料
   11. 商品數量
   12. 加入購物車
   13. 購物車增加數量
   14. 購物車減少數量
   15. 購物車刪除
   16. localStorage
   17. 前往結帳
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
   🛒 目前正在客製化的商品
========================================= */
let currentProduct = null;
/* =========================================
   🔢 客製化視窗數量
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
   🔢 購物車總數量
========================================= */
function getCartCount() {
    return cart.reduce(
        function(
            total,
            item
        ) {
            return total +
                Number(
                    item.qty || 0
                );
        },
        0
    );
}
/* =========================================
   💰 購物車總金額
========================================= */
function getCartTotal() {
    return cart.reduce(
        function(
            total,
            item
        ) {
            return total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.qty || 0
                );
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
        if (
            cart.length === 0
        ) {
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
    if (
        typeof menu === "undefined"
    ) {
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
                    data-id="${escapeHTML(
                        product.id
                    )}">
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
                        data-product-id="${escapeHTML(
                            product.id
                        )}"
                        data-category="${escapeHTML(
                            category
                        )}">
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
/* =========================================
   🔍 找商品
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
            return String(
                product.id
            ) === String(
                productId
            );
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
        product.type === "sauce" ||
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
       🍜 麵類
    ===================================== */
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
        if (noodleSelectArea) {
            noodleSelectArea.style.display =
                "none";
        }
        if (odenOption) {
            odenOption.style.display =
                "none";
        }
    }
    /* =====================================
       🍢 關東煮
    ===================================== */
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
    /* =====================================
       🐷 手工大腸
    ===================================== */
    else if (
        product.type === "sauce"
    ) {
        if (noodleOption) {
            noodleOption.style.display =
                "none";
        }
        if (odenOption) {
            odenOption.style.display =
                "none";
        }
        setupSauceOptions(
            "大腸"
        );
    }
    /* =====================================
       🥟 水餃
    ===================================== */
    else if (
        product.type === "dumpling"
    ) {
        if (noodleOption) {
            noodleOption.style.display =
                "none";
        }
        if (odenOption) {
            odenOption.style.display =
                "none";
        }
        setupSauceOptions(
            "水餃"
        );
    }
    /* =====================================
       其他商品
    ===================================== */
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
    /* =====================================
       不需要客製化
    ===================================== */
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
/* =========================================
   🔄 重置客製化選項
========================================= */
function resetModalOptions() {
    /* 麵條 */
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
    /* 辣度 */
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
    /* 不加菜 */
    if (noVegetable) {
        noVegetable.checked =
            false;
    }
    /* 不加蔥 */
    if (noOnion) {
        noOnion.checked =
            false;
    }
    /* 關東煮 */
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
   🥣 設定大腸 / 水餃醬料
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
       🐷 大腸醬料
    ===================================== */
    if (
        type === "大腸"
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
       🥟 水餃醬料
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
                    function(sauce, index) {
                        return `
                            <label
                                class="sauce-option-item">
                                <input
                                    type="radio"
                                    name="special-sauce"
                                    value="${escapeHTML(
                                        sauce.value
                                    )}"
                                    ${
                                        sauce.default
                                            ? "checked"
                                            : ""
                                    }>
                                <span>
                                    ${escapeHTML(
                                        sauce.label
                                    )}
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
    ===================================== */
    else if (
        currentProduct.type === "oden"
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
        else {
            options.sauce =
                "都不加";
        }
    }
    /* =====================================
       🐷 手工大腸
    ===================================== */
    else if (
        currentProduct.type === "sauce"
    ) {
        const selectedSauce =
            document.querySelector(
                'input[name="special-sauce"]:checked'
            );
        options.sauce =
            selectedSauce
                ? selectedSauce.value
                : "醬油膏";
    }
    /* =====================================
       🥟 水餃
    ===================================== */
    else if (
        currentProduct.type === "dumpling"
    ) {
        const selectedSauce =
            document.querySelector(
                'input[name="special-sauce"]:checked'
            );
        options.sauce =
            selectedSauce
                ? selectedSauce.value
                : "清醬油";
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
   ❌ 關閉客製化視窗
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
        getOptionsKey(
            options
        );
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
                product.type ||
                "",
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
        function(
            item,
            index
        ) {
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
            /* 麵條 */
            if (
                item.options &&
                item.options.noodle
            ) {
                optionList.push(
                    item.options.noodle
                );
            }
            /* 辣度 */
            if (
                item.options &&
                item.options.spicy
            ) {
                optionList.push(
                    item.options.spicy
                );
            }
            /* 青菜 */
            if (
                item.options &&
                item.options.vegetable === false
            ) {
                optionList.push(
                    "不加菜"
                );
            }
            /* 蔥 */
            if (
                item.options &&
                item.options.onion === false
            ) {
                optionList.push(
                    "不加蔥"
                );
            }
            /* 醬料 */
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
    /* 減少數量 */
    cartContainer
        .querySelectorAll(
            ".cart-minus"
        )
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
    /* 增加數量 */
    cartContainer
        .querySelectorAll(
            ".cart-plus"
        )
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
    /* 刪除商品 */
    cartContainer
        .querySelectorAll(
            ".cart-delete"
        )
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
    if (
        !cart[index]
    ) {
        return;
    }
    cart[index].qty =
        Number(
            cart[index].qty || 1
        ) +
        Number(change);
    if (
        cart[index].qty <= 0
    ) {
        removeCartItem(
            index
        );
        return;
    }
    if (
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
   🗑️ 刪除購物車商品
========================================= */
function removeCartItem(index) {
    if (
        !cart[index]
    ) {
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
   🍢 關東煮「都不加」
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
   🍢 關東煮其他醬料
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

⚠️ 但是你的 menu.js 也一定要改水餃的 type。

你目前水餃是：

{
    id: "O103",
    name: "水餃",
    price: 50
}

要改成：

{
    id: "O103",
    name: "水餃",
    price: 50,
    type: "dumpling"
}

另外，你的 checkout.html 裡面必須有一個 id="sauce-options" 的區塊，因為上面這版 order.js 會動態把「手工大腸」和「水餃」的醬料選項放進去。

如果你目前的 Modal 沒有這個區塊，加入：

<div id="sauce-options"></div>

這樣流程就會是：

點手工大腸 → 彈出醬料選單 → 預設醬油膏

點水餃 → 彈出醬料選單 → 預設清醬油

點關東煮 → 使用原本關東煮醬料選單

而且三種醬料資料會分開儲存，不會互相干擾。