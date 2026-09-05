const API = "http://localhost:3000/api";
let token = localStorage.getItem("token") || null;
let products = [];
let productPage = 1, customerPage = 1, orderPage = 1;
let productSearchTerm = "", customerSearchTerm = "";

// ---------- helpers ----------
function authHeaders() { return token ? { Authorization: "Bearer " + token } : {}; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Small guaranteed minimum delay so real network calls read as network calls,
// not instant local state changes.
async function api(path, method = "GET", body) {
  const [res] = await Promise.all([
    fetch(API + path, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    }),
    sleep(300),
  ]);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function toast(message, type = "default") {
  const el = document.createElement("div");
  el.className = "toast" + (type !== "default" ? " " + type : "");
  el.textContent = message;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function skeletonRows(tbodyId, cols, rows = 5) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement("tr");
    tr.className = "skeleton-row";
    tr.innerHTML = Array(cols).fill('<td><div class="skeleton-bar" style="width:' + (60 + Math.random() * 30) + '%"></div></td>').join("");
    tbody.appendChild(tr);
  }
}

function staggerReveal(containerEl, delayStep = 55) {
  const items = Array.from(containerEl.children);
  items.forEach((el, i) => {
    el.classList.add("stagger-item");
    el.style.transitionDelay = i * delayStep + "ms";
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    items.forEach(el => el.classList.add("stagger-visible"));
  }));
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
document.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
document.querySelectorAll(".modal-overlay, .drawer-overlay").forEach(ov => {
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.add("hidden"); });
});



// ---------- AUTH SCREEN ----------
document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const form = btn.dataset.form;
    document.getElementById("loginForm").classList.toggle("hidden", form !== "login");
    document.getElementById("registerForm").classList.toggle("hidden", form !== "register");
    document.getElementById("authMsg").textContent = "";
  });
});

function showApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  switchTab("overview");
  loadOverviewStats();
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = null;
  localStorage.removeItem("token");
  location.reload();
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.disabled = true; btn.textContent = "Signing in...";
  try {
    const data = await api("/auth/login", "POST", {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    });
    token = data.token;
    localStorage.setItem("token", token);
    showApp();
  } catch (err) {
    document.getElementById("authMsg").textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = "Sign in";
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.disabled = true; btn.textContent = "Creating...";
  try {
    await api("/auth/register", "POST", {
      name: document.getElementById("regName").value,
      email: document.getElementById("regEmail").value,
      password: document.getElementById("regPassword").value,
      role: document.getElementById("regRole").value,
    });
    document.getElementById("authMsg").style.color = "var(--sage)";
    document.getElementById("authMsg").textContent = "Account created. Sign in above.";
    document.querySelector('.toggle-btn[data-form="login"]').click();
  } catch (err) {
    document.getElementById("authMsg").style.color = "var(--danger)";
    document.getElementById("authMsg").textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = "Create account";
  }
});

// ---------- NAVBAR / MENU ----------
const hamburgerBtn = document.getElementById("hamburgerBtn");
const menuOverlay = document.getElementById("menuOverlay");
function openMenu() { menuOverlay.classList.add("open"); hamburgerBtn.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeMenu() { menuOverlay.classList.remove("open"); hamburgerBtn.classList.remove("open"); document.body.style.overflow = ""; }
hamburgerBtn.addEventListener("click", () => menuOverlay.classList.contains("open") ? closeMenu() : openMenu());
document.getElementById("menuBackdrop").addEventListener("click", closeMenu);
document.getElementById("menuBtn").addEventListener("click", () => menuOverlay.classList.contains("open") ? closeMenu() : openMenu());

document.querySelectorAll(".menu-link").forEach(btn => {
  btn.addEventListener("click", () => { switchTab(btn.dataset.tab); closeMenu(); });
});
document.querySelectorAll(".nav-tile[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});
document.getElementById("viewProductsBtn").addEventListener("click", () => switchTab("products"));

document.getElementById("logoHome").addEventListener("click", () => { switchTab("overview"); closeMenu(); });

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(name + "Tab").classList.remove("hidden");
  document.querySelectorAll(".nav-tile[data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  if (name === "products") loadProducts();
  if (name === "customers") loadCustomers();
  if (name === "orders") loadOrders();
  if (name === "overview") { loadOverviewStats(); }
}

// ---------- OVERVIEW STATS ----------
async function loadOverviewStats() {
  try {
    const [prod, cust, ord] = await Promise.all([
      api("/products?limit=1"),
      api("/customers?limit=1"),
      api("/orders?limit=1"),
    ]);
    const productCount = prod.total ?? prod.data.length;
    const customerCount = cust.total ?? cust.data.length;
    document.getElementById("statProducts").textContent = productCount;
    document.getElementById("statCustomers").textContent = customerCount;
    document.getElementById("statOrders").textContent = ord.total ?? ord.data.length;
    document.getElementById("stockUnitsSub").textContent =
      productCount > 0 ? `${productCount} SKUs on the shelf` : "No products yet — add your first one";
    document.getElementById("directorySub").textContent =
      customerCount > 0 ? `${customerCount} people on file` : "No customers yet — add your first one";
  } catch (err) {
    // overview stats are supplementary; fail quietly
  }
}

document.getElementById("g0Card").addEventListener("click", () => switchTab("products"));
document.getElementById("g2Card").addEventListener("click", () => switchTab("customers"));

// ---------- PRODUCTS ----------
document.getElementById("openProductForm").addEventListener("click", () => openModal("productModal"));

async function loadProducts(search = productSearchTerm, page = productPage) {
  productSearchTerm = search; productPage = page;
  skeletonRows("productsBody", 6);
  document.getElementById("productsEmpty").classList.add("hidden");
  const data = await api(`/products?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
  const tbody = document.getElementById("productsBody");
  tbody.innerHTML = "";
  if (data.data.length === 0) document.getElementById("productsEmpty").classList.remove("hidden");
  data.data.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.productName}</td><td>${p.sku}</td><td>${p.category}</td>
      <td>₹${p.sellingPrice}</td><td>${p.stockQuantity}</td>
      <td><button class="btn-danger-text" data-id="${p._id}">Delete</button></td>`;
    tr.querySelector(".btn-danger-text").addEventListener("click", () => deleteProduct(p._id));
    tbody.appendChild(tr);
  });
  staggerReveal(tbody);
  renderPagination("productsPagination", data.currentPage, data.totalPages, (p) => loadProducts(productSearchTerm, p));
}

async function deleteProduct(id) { await api("/products/" + id, "DELETE"); toast("Product deleted", "success"); loadProducts(); }

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    productName: p_productName.value, sku: p_sku.value, category: p_category.value,
    brand: p_brand.value, supplier: p_supplier.value,
    costPrice: Number(p_costPrice.value), sellingPrice: Number(p_sellingPrice.value),
    stockQuantity: Number(p_stockQuantity.value), minimumStock: Number(p_minimumStock.value),
    unit: p_unit.value,
  };
  try {
    await api("/products", "POST", body);
    e.target.reset();
    closeModal("productModal");
    toast("Product added", "success");
    loadProducts();
  } catch (err) { toast(err.message, "error"); }
});
document.getElementById("productSearch").addEventListener("input", (e) => loadProducts(e.target.value, 1));

// ---------- CUSTOMERS ----------
document.getElementById("openCustomerForm").addEventListener("click", () => openModal("customerModal"));

async function loadCustomers(search = customerSearchTerm, page = customerPage) {
  customerSearchTerm = search; customerPage = page;
  skeletonRows("customersBody", 5);
  document.getElementById("customersEmpty").classList.add("hidden");
  const data = await api(`/customers?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
  const tbody = document.getElementById("customersBody");
  tbody.innerHTML = "";
  if (data.data.length === 0) document.getElementById("customersEmpty").classList.remove("hidden");
  data.data.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.customerId}</td><td>${c.customerName}</td><td>${c.phone}</td><td>${c.city}</td>
      <td><button class="btn-danger-text" data-id="${c._id}">Delete</button></td>`;
    tr.querySelector(".btn-danger-text").addEventListener("click", () => deleteCustomer(c._id));
    tbody.appendChild(tr);
  });
  staggerReveal(tbody);
  renderPagination("customersPagination", data.currentPage, data.totalPages, (p) => loadCustomers(customerSearchTerm, p));
}

async function deleteCustomer(id) { await api("/customers/" + id, "DELETE"); toast("Customer deleted", "success"); loadCustomers(); }

document.getElementById("customerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    customerId: c_customerId.value, customerName: c_customerName.value, age: Number(c_age.value),
    gender: c_gender.value, phone: c_phone.value, email: c_email.value,
    addressLine1: c_addressLine1.value, city: c_city.value, state: c_state.value, pinCode: c_pinCode.value,
  };
  try {
    await api("/customers", "POST", body);
    e.target.reset();
    closeModal("customerModal");
    toast("Customer added", "success");
    loadCustomers();
  } catch (err) { toast(err.message, "error"); }
});
document.getElementById("customerSearch").addEventListener("input", (e) => loadCustomers(e.target.value, 1));

// ---------- ORDERS ----------
document.getElementById("openOrderForm").addEventListener("click", async () => {
  openModal("orderModal");
  await Promise.all([loadCustomerOptions(), loadProductsCache()]);
});

async function loadCustomerOptions() {
  const data = await api("/customers?limit=100");
  const sel = document.getElementById("o_customer");
  sel.innerHTML = data.data.map(c => `<option value="${c._id}">${c.customerName} (${c.customerId})</option>`).join("");
}

async function loadProductsCache() {
  const data = await api("/products?limit=100");
  products = data.data;
  document.getElementById("orderItems").innerHTML = "";
  addItemRow();
}

function addItemRow() {
  const div = document.createElement("div");
  div.className = "item-row";
  const options = products.map(p => `<option value="${p._id}">${p.productName} (₹${p.sellingPrice})</option>`).join("");
  div.innerHTML = `<select class="item-product">${options}</select><input type="number" class="item-qty" placeholder="Qty" value="1" min="1">`;
  document.getElementById("orderItems").appendChild(div);
}
document.getElementById("addItemBtn").addEventListener("click", addItemRow);

document.getElementById("createOrderBtn").addEventListener("click", async (e) => {
  const btn = e.target;
  const items = Array.from(document.querySelectorAll("#orderItems .item-row")).map(row => ({
    productId: row.querySelector(".item-product").value,
    quantity: Number(row.querySelector(".item-qty").value),
  }));
  btn.disabled = true; btn.textContent = "Placing order...";
  try {
    await api("/orders", "POST", {
      customerId: document.getElementById("o_customer").value,
      items,
      paymentMethod: document.getElementById("o_paymentMethod").value,
      discount: Number(document.getElementById("o_discount").value) || 0,
      shippingCharge: Number(document.getElementById("o_shipping").value) || 0,
    });
    closeModal("orderModal");
    toast("Order placed", "success");
    loadOrders();
    loadOverviewStats();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false; btn.textContent = "Place order";
  }
});

function statusBadge(status) { return `<span class="badge badge-${status.toLowerCase()}">${status}</span>`; }

async function loadOrders(page = orderPage) {
  orderPage = page;
  skeletonRows("ordersBody", 4);
  document.getElementById("ordersEmpty").classList.add("hidden");
  const data = await api(`/orders?page=${page}&limit=10`);
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";
  if (data.data.length === 0) document.getElementById("ordersEmpty").classList.remove("hidden");
  data.data.forEach(o => {
    const tr = document.createElement("tr");
    tr.className = "clickable";
    tr.innerHTML = `<td>${o.orderNumber}</td><td>${o.customer?.customerName || "-"}</td>
      <td>₹${o.totalAmount}</td><td>${statusBadge(o.orderStatus)}</td><td></td>`;
    tr.addEventListener("click", () => viewOrder(o._id));
    tbody.appendChild(tr);
  });
  staggerReveal(tbody);
  renderPagination("ordersPagination", data.currentPage, data.totalPages, (p) => loadOrders(p));
}

async function viewOrder(id) {
  const body = document.getElementById("orderDrawerBody");
  body.innerHTML = '<div class="skeleton-bar" style="height:1.2rem;margin-bottom:0.8rem"></div>'.repeat(6);
  document.getElementById("orderDrawer").classList.remove("hidden");
  try {
    const { data: o } = await api("/orders/" + id);
    const itemsHtml = (o.items || []).map(it => `
      <div class="detail-item-row"><span>${it.product?.productName || "Product removed"} × ${it.quantity}</span><span>₹${it.price}</span></div>`).join("");
    body.innerHTML = `
      <div class="detail-line"><span>Order number</span><span>${o.orderNumber}</span></div>
      <div class="detail-line"><span>Customer</span><span>${o.customer?.customerName || "-"}</span></div>
      <div class="detail-line"><span>Status</span><span>${statusBadge(o.orderStatus)}</span></div>
      <div class="detail-line"><span>Payment</span><span>${o.paymentMethod} · ${o.paymentStatus}</span></div>
      <div class="detail-items"><p class="eyebrow">Items</p>${itemsHtml || '<p class="empty-state">No items</p>'}</div>
      <div class="detail-line"><span>Subtotal</span><span>₹${o.subtotal}</span></div>
      <div class="detail-line"><span>GST</span><span>₹${o.gst}</span></div>
      <div class="detail-line"><span>Discount</span><span>-₹${o.discount || 0}</span></div>
      <div class="detail-line"><span>Shipping</span><span>₹${o.shippingCharge || 0}</span></div>
      <div class="detail-total"><span>Total</span><span>₹${o.totalAmount}</span></div>
      ${o.orderStatus !== "Cancelled" ? `<button class="btn-ghost" style="margin-top:1.5rem" id="cancelOrderBtn">Cancel this order</button>` : ""}
    `;
    const cancelBtn = document.getElementById("cancelOrderBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", async () => {
      cancelBtn.disabled = true; cancelBtn.textContent = "Cancelling...";
      try {
        await api("/orders/cancel/" + o._id, "PUT");
        toast("Order cancelled", "success");
        closeModal("orderDrawer");
        loadOrders();
        loadOverviewStats();
      } catch (err) { toast(err.message, "error"); }
    });
  } catch (err) {
    body.innerHTML = `<p class="empty-state">${err.message}</p>`;
  }
}

// ---------- PAGINATION ----------
function renderPagination(containerId, current, totalPages, onClick) {
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  if (totalPages <= 1) return;
  const mk = (label, page, disabled, active) => {
    const b = document.createElement("button");
    b.textContent = label; b.disabled = disabled;
    if (active) b.classList.add("active");
    b.addEventListener("click", () => onClick(page));
    return b;
  };
  el.appendChild(mk("Previous", current - 1, current === 1, false));
  for (let i = 1; i <= totalPages; i++) el.appendChild(mk(String(i), i, false, i === current));
  el.appendChild(mk("Next", current + 1, current === totalPages, false));
}

// ---------- INIT ----------
if (token) showApp();