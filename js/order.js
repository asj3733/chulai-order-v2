/* =========================================
   初萊食麵
   線上點餐系統
   order.js 最終正式版
========================================= */


/* =========================================
   全域變數
========================================= */

const menuArea =
    document.getElementById("menu");

let cart = [];

let currentItem = null;

let modalQty = 1;


/* =========================================
   讀取購物車
========================================= */

try {

    const savedCart =
        localStorage.getItem("cart");


    if (savedCart) {

        cart =
            JSON.parse(savedCart);

    }


    if (!Array.isArray(cart)) {

        cart = [];

    }

} catch (error) {

    console.error(
        "購物車讀取失敗",
        error
    );

    cart = [];

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
   渲染商品
========================================= */

function renderMenu(category = null) {


    if (!menuArea) {

        return;

    }


    let html = "";


    const categories = category
        ? [category]
        : Object.keys(menu);


    categories.forEach(
        categoryName => {


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


            menu[categoryName].forEach(
                item => {


                    const itemId =
                        item.id ||
                        item.name;


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
                                onclick="addCartById('${itemId}')">

                                加入

                            </button>


                        </div>

                    `;

                }
            );


            html += `

                </section>

            `;

        }
    );


    menuArea.innerHTML =
        html;

}


/* =========================================
   找商品
========================================= */

function findMenuItem(itemId) {


    for (
        const category in menu
    ) {


        const found =
            menu[category].find(
                item =>
                    String(
                        item.id ||
                        item.name
                    )
                    ===
                    String(itemId)
            );


        if (found) {

            return found;

        }

    }


    return null;

}


/* =========================================
   點擊加入商品
========================================= */

function addCartById(itemId) {


    const item =
        findMenuItem(itemId);


    if (!item) {

        console.error(
            "找不到商品：",
            itemId
        );

        return;

    }


    /*
        麵類
        米粉
        關東煮

        需要客製化
    */

    if (

        item.type === "noodle"

        ||

        item.type === "riceNoodle"

        ||

        item.type === "oden"

    ) {


        openCustomModal(item);


        return;

    }


    /*
        其他商品
        直接加入
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


    currentItem =
        item;


    modalQty =
        1;


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
    ).textContent =
        "1";


    /*
        麵條預設粗麵
    */

    document.querySelectorAll(

        'input[name="noodle"]'

    ).forEach(
        input => {

            input.checked =
                input.value ===
                "粗麵";

        }
    );


    /*
        辣度預設不辣
    */

    document.querySelectorAll(

        'input[name="spicy"]'

    ).forEach(
        input => {

            input.checked =
                input.value ===
                "不辣";

        }
    );


    /*
        不加菜
        預設不勾
    */

    const noVegetable =
        document.getElementById(
            "noVegetable"
        );


    if (noVegetable) {

        noVegetable.checked =
            false;

    }


    /*
        不加蔥
        預設不勾
    */

    const noOnion =
        document.getElementById(
            "noOnion"
        );


    if (noOnion) {

        noOnion.checked =
            false;

    }


    /*
        關東煮醬料重設
        預設醬油膏
    */

    document.querySelectorAll(

        '#odenOption input[name="sauce"]'

    ).forEach(
        input => {

            input.checked =
                input.value ===
                "醬油膏";

        }
    );


    /*
        麵類
    */

    if (
        item.type ===
        "noodle"
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
        item.type ===
        "riceNoodle"
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
        item.type ===
        "oden"
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
   客製化數量
========================================= */

function changeModalQty(change) {


    modalQty +=
        change;


    if (
        modalQty < 1
    ) {

        modalQty =
            1;

    }


    if (
        modalQty > 99
    ) {

        modalQty =
            99;

    }


    const qtyElement =
        document.getElementById(
            "modalQty"
        );


    if (qtyElement) {

        qtyElement.textContent =
            modalQty;

    }

}


/* =========================================
   確認客製化
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


    /* =========================
       麵類
    ========================= */

    if (
        currentItem.type ===
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


    /* =========================
       米粉
    ========================= */

    else if (
        currentItem.type ===
        "riceNoodle"
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


    /* =========================
       關東煮
    ========================= */

    else if (
        currentItem.type ===
        "oden"
    ) {


        const sauceInputs =
            document.querySelectorAll(

                '#odenOption input[name="sauce"]:checked'

            );


        let sauces =
            Array.from(
                sauceInputs
            ).map(
                input =>
                    input.value
            );


        /*
            都不加
            優先權最高
        */

        if (
            sauces.includes(
                "都不加"
            )
        ) {


            sauces =
                ["都不加"];


        }


        /*
            沒有選擇
            自動恢復醬油膏
        */

        if (
            sauces.length ===
            0
        ) {


            sauces =
                ["醬油膏"];

        }


        options.sauce =
            sauces;

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
        客製化識別碼

        相同商品
        ＋
        相同客製化

        才會合併數量
    */

    const optionKey =
        JSON.stringify(options);


    const productId =
        item.id ||
        item.name;


    const existingItem =
        cart.find(

            cartItem =>

                String(
                    cartItem.productId
                )
                ===
                String(productId)

                &&

                cartItem.optionKey
                ===
                optionKey

        );


    /*
        已存在相同商品
    */

    if (
        existingItem
    ) {


        existingItem.qty +=
            qty;


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
                productId,


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
   顯示客製化內容
========================================= */

function getOptionText(item) {


    const options =
        item.options ||
        {};


    const texts =
        [];


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
        options.vegetable ===
        false
    ) {


        texts.push(
            "不加菜"
        );

    }


    /*
        不加蔥
    */

    if (
        options.onion ===
        false
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


        if (
            Array.isArray(
                options.sauce
            )
        ) {


            texts.push(

                options.sauce.join(
                    "＋"
                )

            );


        }


        else {


            texts.push(
                options.sauce
            );

        }

    }


    /*
        沒有客製化
    */

    if (
        texts.length ===
        0
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


    let html =
        "";


    let total =
        0;


    let totalQty =
        0;


    /*
        購物車空
    */

    if (
        cart.length ===
        0
    ) {


        cartArea.innerHTML =
            "尚未加入商品";


        const totalElement =
            document.getElementById(
                "total"
            );


        const countElement =
            document.getElementById(
                "cart-count"
            );


        if (totalElement) {

            totalElement.textContent =
                "0";

        }


        if (countElement) {

            countElement.textContent =
                "0";

        }


        return;

    }


    /*
        商品
    */

    cart.forEach(

        (item, index) => {


            const subtotal =

                item.price
                *
                item.qty;


            total +=
                subtotal;


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


    const totalElement =
        document.getElementById(
            "total"
        );


    const countElement =
        document.getElementById(
            "cart-count"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (countElement) {

        countElement.textContent =
            totalQty;

    }

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
        cart[index].qty <=
        0
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
   刪除商品
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


    if (modal) {

        modal.style.display =
            "none";

    }


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
   ESC 關閉
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
   關東煮醬料複選控制
========================================= */

function setupSauceControl() {


    const sauceInputs =
        document.querySelectorAll(

            '#odenOption input[name="sauce"]'

        );


    sauceInputs.forEach(

        input => {


            input.addEventListener(

                "change",

                function() {


                    const noSauce =
                        document.getElementById(
                            "noSauce"
                        );


                    /*
                        選「都不加」
                        取消其他醬料
                    */

                    if (

                        this.value ===
                        "都不加"

                        &&

                        this.checked

                    ) {


                        sauceInputs.forEach(

                            otherInput => {


                                if (
                                    otherInput
                                    !==
                                    this
                                ) {


                                    otherInput.checked =
                                        false;

                                }

                            }

                        );

                    }


                    /*
                        選其他醬料
                        取消「都不加」
                    */

                    else if (

                        this.value
                        !==
                        "都不加"

                        &&

                        this.checked

                    ) {


                        if (noSauce) {

                            noSauce.checked =
                                false;

                        }

                    }


                    /*
                        全部取消
                        恢復醬油膏
                    */

                    const checkedSauces =
                        document.querySelectorAll(

                            '#odenOption input[name="sauce"]:checked'

                        );


                    if (

                        checkedSauces.length
                        ===
                        0

                    ) {


                        const soySauce =
                            document.querySelector(

                                '#odenOption input[value="醬油膏"]'

                            );


                        if (soySauce) {

                            soySauce.checked =
                                true;

                        }

                    }

                }

            );

        }

    );

}


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

                    behavior:
                        "smooth"

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
                cart.length ===
                0
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

setupSauceControl();

renderMenu();

updateCart();


console.log(

    "🍜 初萊食麵 order.js 最終正式版已載入"

);