// ChapterVerse Bookstore - Reading Tracker

document.addEventListener('DOMContentLoaded', function() {
    // Initialize reading library
    let readingLibrary = JSON.parse(localStorage.getItem('readingLibrary')) || [];
    let books = [];

    // Sample book data
    const sampleBooks = [
        {
            id: 1,
            title: "The Silent Patient",
            author: "Alex Michaelides",
            pages: 336,
            genre: "mystery",
            rating: 4.5,
            description: "A psychological thriller about a woman who shoots her husband and then stops speaking."
        },
        {
            id: 2,
            title: "Project Hail Mary",
            author: "Andy Weir",
            pages: 476,
            genre: "scifi",
            rating: 4.7,
            description: "A lone astronaut must save humanity from extinction in this high-stakes sci-fi adventure."
        },
        {
            id: 3,
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            pages: 310,
            genre: "fantasy",
            rating: 4.8,
            description: "Bilbo Baggins embarks on an unexpected adventure with a group of dwarves."
        },
        {
            id: 4,
            title: "Educated",
            author: "Tara Westover",
            pages: 334,
            genre: "nonfiction",
            rating: 4.6,
            description: "A memoir about a woman who leaves her survivalist family to pursue education."
        },
        {
            id: 5,
            title: "The Midnight Library",
            author: "Matt Haig",
            pages: 304,
            genre: "fiction",
            rating: 4.3,
            description: "A library between life and death where every book provides a chance to try another life."
        },
        {
            id: 6,
            title: "Dune",
            author: "Frank Herbert",
            pages: 412,
            genre: "scifi",
            rating: 4.7,
            description: "A epic saga set in the desert world of Arrakis where water is power."
        },
        {
            id: 7,
            title: "Atomic Habits",
            author: "James Clear",
            pages: 320,
            genre: "nonfiction",
            rating: 4.8,
            description: "A guide to building good habits and breaking bad ones."
        },
        {
            id: 8,
            title: "The Seven Husbands of Evelyn Hugo",
            author: "Taylor Jenkins Reid",
            pages: 389,
            genre: "fiction",
            rating: 4.5,
            description: "A reclusive Hollywood legend reveals her epic life story to an unknown journalist."
        },
        {
            id: 9,
            title: "Mistborn: The Final Empire",
            author: "Brandon Sanderson",
            pages: 541,
            genre: "fantasy",
            rating: 4.6,
            description: "A young street thief discovers she has magical powers in a world ruled by an immortal emperor."
        },
        {
            id: 10,
            title: "The Girl with the Dragon Tattoo",
            author: "Stieg Larsson",
            pages: 465,
            genre: "mystery",
            rating: 4.4,
            description: "A journalist and a hacker investigate a 40-year-old disappearance."
        }
    ];

    // Initialize
    books = [...sampleBooks];
    updateStats();
    renderBooks();
    renderLibrary();

    // Update reading statistics
    function updateStats() {
        const totalBooks = readingLibrary.length;
        const completedBooks = readingLibrary.filter(book => book.status === 'completed').length;
        const totalPages = readingLibrary.reduce((sum, book) => sum + (book.currentPage || 0), 0);
        const readingDays = new Set(readingLibrary
            .filter(book => book.addedDate)
            .map(book => new Date(book.addedDate).toDateString())
        ).size;

        document.getElementById('total-books').textContent = totalBooks;
        document.getElementById('completed-books').textContent = completedBooks;
        document.getElementById('total-pages').textContent = totalPages;
        document.getElementById('reading-days').textContent = readingDays;
    }

    // Render books to grid
    function renderBooks(filteredBooks = null) {
        const booksToRender = filteredBooks || books;
        const booksGrid = document.getElementById('books-grid');
        
        booksGrid.innerHTML = booksToRender.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover" style="background: ${getBookColor(book.genre)}"></div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-meta">
                        <span class="book-pages">${book.pages} pages</span>
                        <span class="book-genre">${book.genre}</span>
                        <div class="book-rating">
                            ${renderStars(book.rating)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event to book cards
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', function() {
                const bookId = parseInt(this.dataset.id);
                const book = books.find(b => b.id === bookId);
                if (book) {
                    showBookModal(book);
                }
            });
        });
    }

    // Get color based on genre
    function getBookColor(genre) {
        const colors = {
            fiction: 'linear-gradient(45deg, #8B4513, #A0522D)',
            fantasy: 'linear-gradient(45deg, #2C3E50, #34495E)',
            scifi: 'linear-gradient(45deg, #8A9A5B, #9CAF88)',
            mystery: 'linear-gradient(45deg, #D4AF37, #F4D03F)',
            nonfiction: 'linear-gradient(45deg, #8B0000, #B22222)'
        };
        return colors[genre] || 'linear-gradient(45deg, #6A5ACD, #9370DB)';
    }

    // Render star rating
    function renderStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt star"></i>';
            } else {
                stars += '<i class="far fa-star star"></i>';
            }
        }
        return stars;
    }

    // Show book modal
    function showBookModal(book) {
        const modal = document.getElementById('book-modal');
        document.getElementById('modal-title').textContent = book.title;
        document.getElementById('modal-author').textContent = `by ${book.author}`;
        document.getElementById('modal-pages').textContent = `${book.pages} pages`;
        document.getElementById('modal-genre').textContent = book.genre.charAt(0).toUpperCase() + book.genre.slice(1);
        document.getElementById('modal-rating').innerHTML = renderStars(book.rating);
        document.getElementById('modal-description').textContent = book.description;
        
        const cover = document.getElementById('modal-cover');
        cover.style.background = getBookColor(book.genre);
        
        // Update modal buttons
        const addBtn = document.querySelector('.add-to-library');
        const readBtn = document.querySelector('.mark-reading');
        
        addBtn.innerHTML = `<i class="fas fa-plus"></i> Add to Library`;
        readBtn.innerHTML = `<i class="fas fa-book-open"></i> Start Reading`;
        
        addBtn.onclick = () => addBookToLibrary(book, 'want');
        readBtn.onclick = () => addBookToLibrary(book, 'reading');
        
        modal.classList.add('active');
    }

    // Add book to library
    function addBookToLibrary(book, status = 'want') {
        // Check if book already exists in library
        const existingIndex = readingLibrary.findIndex(item => item.id === book.id);
        
        if (existingIndex !== -1) {
            // Update existing book
            readingLibrary[existingIndex].status = status;
            readingLibrary[existingIndex].currentPage = status === 'reading' ? 1 : 0;
            readingLibrary[existingIndex].addedDate = new Date().toISOString();
        } else {
            // Add new book
            readingLibrary.push({
                ...book,
                status: status,
                currentPage: status === 'reading' ? 1 : 0,
                addedDate: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('readingLibrary', JSON.stringify(readingLibrary));
        
        // Update UI
        updateStats();
        renderLibrary();
        
        // Close modal
        document.getElementById('book-modal').classList.remove('active');
        
        // Show success message
        showNotification(`Added "${book.title}" to your library!`);
    }

    // Render library books
    function renderLibrary() {
        const readingList = document.getElementById('reading-list');
        const wantList = document.getElementById('want-list');
        const completedList = document.getElementById('completed-list');
        
        // Get books by status
        const readingBooks = readingLibrary.filter(book => book.status === 'reading');
        const wantBooks = readingLibrary.filter(book => book.status === 'want');
        const completedBooks = readingLibrary.filter(book => book.status === 'completed');
        
        // Render currently reading
        if (readingBooks.length > 0) {
            document.getElementById('empty-reading').style.display = 'none';
            readingList.innerHTML = readingBooks.map(book => createLibraryItem(book)).join('');
        } else {
            document.getElementById('empty-reading').style.display = 'block';
        }
        
        // Render want to read
        if (wantBooks.length > 0) {
            document.getElementById('empty-want').style.display = 'none';
            wantList.innerHTML = wantBooks.map(book => createLibraryItem(book)).join('');
        } else {
            document.getElementById('empty-want').style.display = 'block';
        }
        
        // Render completed
        if (completedBooks.length > 0) {
            document.getElementById('empty-completed').style.display = 'none';
            completedList.innerHTML = completedBooks.map(book => createLibraryItem(book)).join('');
        } else {
            document.getElementById('empty-completed').style.display = 'block';
        }
        
        // Add event listeners to library items
        addLibraryEventListeners();
    }

    // Create library item HTML
    function createLibraryItem(book) {
        const progress = book.currentPage ? (book.currentPage / book.pages * 100).toFixed(0) : 0;
        
        return `
            <div class="library-item" data-id="${book.id}">
                <div class="library-item-cover" style="background: ${getBookColor(book.genre)}"></div>
                <div class="library-item-info">
                    <h4>${book.title}</h4>
                    <p class="library-item-meta">
                        <span>by ${book.author}</span>
                        <span>${book.pages} pages</span>
                        <span>${book.genre}</span>
                    </p>
                    ${book.status === 'reading' ? `
                        <div class="library-item-progress">
                            <div class="progress-text">
                                <span>Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="library-item-actions">
                    ${book.status === 'reading' ? `
                        <button class="btn outline btn-small mark-complete" data-id="${book.id}">
                            <i class="fas fa-check"></i> Mark Complete
                        </button>
                    ` : ''}
                    ${book.status === 'want' ? `
                        <button class="btn primary btn-small start-reading" data-id="${book.id}">
                            <i class="fas fa-book-open"></i> Start Reading
                        </button>
                    ` : ''}
                    <button class="btn outline btn-small remove-book" data-id="${book.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Add event listeners to library items
    function addLibraryEventListeners() {
        // Mark as complete
        document.querySelectorAll('.mark-complete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const bookId = parseInt(this.dataset.id);
                markBookAsComplete(bookId);
            });
        });
        
        // Start reading
        document.querySelectorAll('.start-reading').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const bookId = parseInt(this.dataset.id);
                startReadingBook(bookId);
            });
        });
        
        // Remove book
        document.querySelectorAll('.remove-book').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const bookId = parseInt(this.dataset.id);
                removeBookFromLibrary(bookId);
            });
        });
        
        // Click on library item to view details
        document.querySelectorAll('.library-item').forEach(item => {
            item.addEventListener('click', function() {
                const bookId = parseInt(this.dataset.id);
                const book = readingLibrary.find(b => b.id === bookId);
                if (book) {
                    showBookModal(book);
                }
            });
        });
    }

    // Mark book as complete
    function markBookAsComplete(bookId) {
        const bookIndex = readingLibrary.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            readingLibrary[bookIndex].status = 'completed';
            readingLibrary[bookIndex].currentPage = readingLibrary[bookIndex].pages;
            readingLibrary[bookIndex].completedDate = new Date().toISOString();
            
            localStorage.setItem('readingLibrary', JSON.stringify(readingLibrary));
            updateStats();
            renderLibrary();
            
            showNotification('Book marked as completed! 🎉');
        }
    }

    // Start reading a book
    function startReadingBook(bookId) {
        const bookIndex = readingLibrary.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            readingLibrary[bookIndex].status = 'reading';
            readingLibrary[bookIndex].currentPage = 1;
            readingLibrary[bookIndex].startedDate = new Date().toISOString();
            
            localStorage.setItem('readingLibrary', JSON.stringify(readingLibrary));
            updateStats();
            renderLibrary();
            
            showNotification('Happy reading! 📖');
        }
    }

    // Remove book from library
    function removeBookFromLibrary(bookId) {
        if (confirm('Are you sure you want to remove this book from your library?')) {
            readingLibrary = readingLibrary.filter(book => book.id !== bookId);
            localStorage.setItem('readingLibrary', JSON.stringify(readingLibrary));
            updateStats();
            renderLibrary();
            
            showNotification('Book removed from library');
        }
    }

    // Add book form submission
    document.getElementById('add-book-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const pages = parseInt(document.getElementById('book-pages').value);
        const status = document.getElementById('book-status').value;
        const currentPage = document.getElementById('current-page').value ? 
            parseInt(document.getElementById('current-page').value) : 0;
        
        if (!title || !author || !pages) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newBook = {
            id: Date.now(), // Unique ID
            title,
            author,
            pages,
            genre: 'fiction',
            rating: 4.0,
            description: 'Added by user',
            status,
            currentPage: status === 'reading' ? Math.min(currentPage, pages) : 0,
            addedDate: new Date().toISOString()
        };
        
        readingLibrary.push(newBook);
        localStorage.setItem('readingLibrary', JSON.stringify(readingLibrary));
        
        // Reset form
        this.reset();
        
        // Update UI
        updateStats();
        renderLibrary();
        
        showNotification(`Added "${title}" to your library!`);
    });

    // Book filtering
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            let filteredBooks = [...books];
            
            if (filter !== 'all') {
                filteredBooks = books.filter(book => book.genre === filter);
            }
            
            renderBooks(filteredBooks);
        });
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update active button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.library-list').forEach(list => {
                list.classList.remove('active');
            });
            document.getElementById(`${tab}-list`).classList.add('active');
        });
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

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('book-modal').classList.remove('active');
    });

    // Close modal on overlay click
    document.getElementById('book-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    // Smooth scroll
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

    // Newsletter form
    document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]');
        
        if (email.value) {
            email.value = '';
            showNotification('Thank you for subscribing!');
        }
    });

    // Search functionality
    document.getElementById('search-input').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            renderBooks();
            return;
        }
        
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm)
        );
        
        renderBooks(filteredBooks);
    });

    // Initialize Chart.js for genre breakdown
    function initializeChart() {
        const ctx = document.getElementById('genre-chart').getContext('2d');
        
        // Calculate genre distribution
        const genreCount = {};
        readingLibrary.forEach(book => {
            genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
        });
        
        const genres = Object.keys(genreCount);
        const counts = Object.values(genreCount);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: genres.map(g => g.charAt(0).toUpperCase() + g.slice(1)),
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#8B4513',
                        '#2C3E50',
                        '#8A9A5B',
                        '#D4AF37',
                        '#8B0000'
                    ],
                    borderWidth: 2,
                    borderColor: 'var(--bg-secondary)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-primary)',
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize chart after a short delay
    setTimeout(initializeChart, 1000);

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 1002;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .btn-small {
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        
        .library-item-actions {
            display: flex;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);

    // Update current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});