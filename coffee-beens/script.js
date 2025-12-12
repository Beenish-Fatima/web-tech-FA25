// Brew & Bloom Café - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
    let currentOrder = {
        base: 'espresso',
        size: 'small',
        temp: 'hot',
        addons: [],
        price: 4.50
    };

    // Update cart count
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
        document.querySelector('.checkout-btn').disabled = count === 0;
        document.querySelector('.checkout-btn-sidebar').disabled = count === 0;
    }

    // Update cart display
    function updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const cartBody = document.querySelector('.cart-body');
        const emptyCart = document.querySelector('.empty-cart');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTax = document.getElementById('cart-tax');
        const cartTotal = document.getElementById('cart-total');
        
        let subtotal = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-coffee"></i>
                    <p>Your cart is empty</p>
                    <p>Add some delicious items!</p>
                </div>
            `;
            
            cartBody.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-coffee"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            
            cartSubtotal.textContent = '$0.00';
            cartTax.textContent = '$0.00';
            cartTotal.textContent = '$0.00';
            document.querySelector('.total-amount').textContent = '$0.00';
            return;
        }
        
        // Update cart items in main cart
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.details || ''}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Update cart items in sidebar
        cartBody.innerHTML = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'sidebar-cart-item';
            cartItem.innerHTML = `
                <div class="sidebar-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.details || ''}</p>
                    <div class="sidebar-item-controls">
                        <button class="sidebar-quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="sidebar-quantity-btn plus" data-id="${item.id}">+</button>
                        <span class="sidebar-item-price">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
            cartBody.appendChild(cartItem);
        });
        
        // Calculate totals
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTax.textContent = `$${tax.toFixed(2)}`;
        cartTotal.textContent = `$${total.toFixed(2)}`;
        document.querySelector('.total-amount').textContent = `$${total.toFixed(2)}`;
        
        // Add event listeners to new buttons
        addCartEventListeners();
    }

    // Add to cart from menu
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = this.closest('.menu-item');
            const name = item.querySelector('h3').textContent;
            const description = item.querySelector('p').textContent;
            const price = parseFloat(item.querySelector('.item-price').textContent.replace('$', ''));
            
            // Check if item already in cart
            const existingItem = cart.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id,
                    name,
                    details: description,
                    price,
                    quantity: 1
                });
            }
            
            // Show success animation
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i> Add to Cart';
            }, 1000);
            
            // Update cart
            saveCart();
            updateCartCount();
            updateCartDisplay();
        });
    });

    // Menu filtering
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            const items = document.querySelectorAll('.menu-item');
            
            items.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Custom order options
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', function() {
            const option = this.getAttribute('data-option');
            const value = this.getAttribute('data-value');
            
            // Update active button
            this.closest('.option-buttons').querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update current order
            currentOrder[option] = value;
            updateOrderSummary();
        });
    });

    // Addons selection
    document.querySelectorAll('.addon-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const addon = this.getAttribute('data-addon');
            
            if (this.checked) {
                if (!currentOrder.addons.includes(addon)) {
                    currentOrder.addons.push(addon);
                }
            } else {
                currentOrder.addons = currentOrder.addons.filter(a => a !== addon);
            }
            
            updateOrderSummary();
        });
    });

    // Update order summary
    function updateOrderSummary() {
        // Update summary display
        document.getElementById('base-summary').textContent = 
            currentOrder.base.charAt(0).toUpperCase() + currentOrder.base.slice(1);
        document.getElementById('size-summary').textContent = 
            currentOrder.size.charAt(0).toUpperCase() + currentOrder.size.slice(1);
        document.getElementById('temp-summary').textContent = 
            currentOrder.temp.charAt(0).toUpperCase() + currentOrder.temp.slice(1);
        
        // Update addons summary
        if (currentOrder.addons.length === 0) {
            document.getElementById('addons-summary').textContent = 'None';
        } else {
            const addonNames = currentOrder.addons.map(addon => {
                return addon.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            });
            document.getElementById('addons-summary').textContent = addonNames.join(', ');
        }
        
        // Calculate price
        let price = 4.50; // Base price
        
        // Size adjustments
        if (currentOrder.size === 'medium') price += 0.75;
        if (currentOrder.size === 'large') price += 1.50;
        
        // Addons
        price += currentOrder.addons.length * 0.50;
        
        // Update price
        currentOrder.price = price;
        document.getElementById('total-price').textContent = `$${price.toFixed(2)}`;
        document.getElementById('display-price').textContent = price.toFixed(2);
    }

    // Add custom order to cart
    document.querySelector('.add-custom-order').addEventListener('click', function() {
        const baseNames = {
            espresso: 'Espresso Equation',
            latte: 'Latte Logic',
            cappuccino: 'Cappuccino Calculus',
            americano: 'Americano Algebra'
        };
        
        const sizeNames = {
            small: 'Small',
            medium: 'Medium',
            large: 'Large'
        };
        
        const tempNames = {
            hot: 'Hot',
            iced: 'Iced'
        };
        
        const addonNames = currentOrder.addons.map(addon => {
            return addon.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        });
        
        const name = `${baseNames[currentOrder.base]} (${sizeNames[currentOrder.size]}, ${tempNames[currentOrder.temp]})`;
        let details = 'Custom order';
        
        if (currentOrder.addons.length > 0) {
            details += ` with ${addonNames.join(', ')}`;
        }
        
        // Add to cart
        const customId = `custom-${Date.now()}`;
        cart.push({
            id: customId,
            name,
            details,
            price: currentOrder.price,
            quantity: 1
        });
        
        // Show success message
        this.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-calculator"></i> Add to Cart - $<span id="display-price">4.50</span>';
        }, 1500);
        
        // Update cart
        saveCart();
        updateCartCount();
        updateCartDisplay();
    });

    // Cart event listeners
    function addCartEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn, .sidebar-quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const isPlus = this.classList.contains('plus');
                const isMinus = this.classList.contains('minus');
                
                const item = cart.find(item => item.id === id);
                
                if (isPlus) {
                    item.quantity += 1;
                } else if (isMinus) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                    } else {
                        // Remove item if quantity becomes 0
                        cart = cart.filter(item => item.id !== id);
                    }
                }
                
                saveCart();
                updateCartCount();
                updateCartDisplay();
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                
                saveCart();
                updateCartCount();
                updateCartDisplay();
            });
        });
    }

    // Clear cart
    document.querySelector('.clear-cart').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart = [];
            saveCart();
            updateCartCount();
            updateCartDisplay();
        }
    });

    // Cart sidebar toggle
    document.querySelector('.cart-btn').addEventListener('click', function() {
        document.querySelector('.cart-sidebar').classList.add('active');
        document.querySelector('.cart-overlay').classList.add('active');
    });

    document.querySelector('.close-cart').addEventListener('click', function() {
        document.querySelector('.cart-sidebar').classList.remove('active');
        document.querySelector('.cart-overlay').classList.remove('active');
    });

    document.querySelector('.cart-overlay').addEventListener('click', function() {
        document.querySelector('.cart-sidebar').classList.remove('active');
        this.classList.remove('active');
    });

    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            this.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            this.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Mobile menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('.nav-menu').classList.toggle('active');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Close mobile menu if open
                if (window.innerWidth <= 992) {
                    document.querySelector('.nav-menu').classList.remove('active');
                }
            }
        });
    });

    // Form submission
    document.getElementById('message-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show success message
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });

    // Newsletter form
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]');
        
        if (email.value) {
            email.value = '';
            alert('Thank you for subscribing!');
        }
    });

    // Update current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('coffeeCart', JSON.stringify(cart));
    }

    // Initialize
    updateCartCount();
    updateCartDisplay();
    updateOrderSummary();

    // Coffee cup animation
    const coffeeCup = document.querySelector('.coffee-cup');
    let angle = 0;
    
    function animateCoffee() {
        angle += 0.5;
        coffeeCup.style.transform = `translate(-50%, -50%) rotate(${Math.sin(angle * Math.PI / 180) * 5}deg)`;
        requestAnimationFrame(animateCoffee);
    }
    
    animateCoffee();
});