const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
    return +new Date();
}

function generatedBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    };
}

function saveDataToLocalStorage() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Your browser does not support local storage.");
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = document.getElementById("bookFormYear").value;
    const isCompleted = document.getElementById("bookFormIsComplete").checked;

    try {
        if (!title || !author || isNaN(year) || year <= 0) {
            throw new Error("Please fill in all fields correctly! Make sure the year is a valid number.");
        }

        const generatedID = generateId();
        const bookObject = generatedBookObject(generatedID, title, author, year, isCompleted);

        showToast("Book successfully added to the shelf!");

        const formAddBook = document.querySelector(".bookForm-container");
        formAddBook.classList.remove('active');

        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveDataToLocalStorage();
    } catch (e) {
        showToast(e.message, "danger");
    } finally {
        document.getElementById("bookForm").reset();
    }
}

function makeBook(bookObject) {
    const {
        id,
        title,
        author,
        year,
        isCompleted
    } = bookObject;

    const bookItemContainer = document.createElement("div");
    bookItemContainer.setAttribute("data-bookid", id);
    bookItemContainer.setAttribute("data-testid", "book-item");
    bookItemContainer.classList.add("book-item");

    const imgBook = document.createElement("img");
    imgBook.src = "./assets/images/book.png";
    imgBook.alt = "book-image";
    imgBook.classList.add("book-cover");

    const bookAuthor = document.createElement("p");
    bookAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookAuthor.classList.add("book-author");
    bookAuthor.textContent = `Author : ${author}`;

    const bookisEditing = document.createElement("p");
    bookisEditing.setAttribute("id", "isEditing");
    bookisEditing.classList.add("isEditing");
    bookisEditing.textContent = "Book in edit";

    const headerBook = document.createElement("div");
    headerBook.classList.add("header-book");

    const bookTitle = document.createElement("h3");
    bookTitle.setAttribute("data-testid", "bookItemTitle");
    bookTitle.classList.add("book-title");
    bookTitle.textContent = title;

    const bookYear = document.createElement("p");
    bookYear.setAttribute("data-testid", "bookItemYear");
    bookYear.classList.add("book-year");
    bookYear.textContent = `Publication year: ${year}`;

    const editButton = document.createElement("button");
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.classList.add("btn-edit");
    editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.classList.add("btn-delete");
    deleteButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';

    const bookContent = document.createElement("div");
    bookContent.classList.add("book-content");

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("container-button");

    headerBook.append(bookAuthor, bookisEditing);
    bookContent.append(headerBook, bookTitle, bookYear);
    btnContainer.append(editButton, deleteButton);
    bookItemContainer.append(imgBook, bookContent, btnContainer);

    if (!isCompleted) {
        const inCompletedButton = document.createElement("button");
        inCompletedButton.setAttribute("data-testid", "bookItemIsCompleteButton");
        inCompletedButton.classList.add("btn-finished");
        inCompletedButton.innerHTML = '<i class="fa-regular fa-circle-check"></i>Mark as Read';
        inCompletedButton.addEventListener("click", () => {
            addBookToCompleted(id);
        });

        editButton.addEventListener("click", function () {
            editBook(id);
        });

        deleteButton.addEventListener("click", () => {
            deleteBook(id);
        });

        btnContainer.append(editButton, deleteButton, inCompletedButton);
    } else {
        const completedButton = document.createElement("button");
        completedButton.setAttribute("data-testid", "bookItemIsCompleteButton");
        completedButton.classList.add("btn-unfinished");
        completedButton.innerHTML = '<i class="fa-regular fa-circle-xmark"></i>Mark as Unread';
        completedButton.addEventListener("click", () => {
            addBookToinCompleted(id);
        });

        editButton.addEventListener("click", function () {
            editBook(id);
        });

        deleteButton.addEventListener("click", () => {
            deleteBook(id);
        });

        btnContainer.append(editButton, deleteButton, completedButton);
    }

    return bookItemContainer;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

function addBookToinCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function deleteBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    if (confirm("Are you sure you want to delete this book?")) {
        showToast("Book successfully deleted!");
        const index = books.indexOf(bookTarget);
        books.splice(index, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveDataToLocalStorage();
    }
}

let isEditing = false;
let editingBookId = null;
function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    document.getElementById("bookFormTitle").value = bookTarget.title;
    document.getElementById("bookFormAuthor").value = bookTarget.author;
    document.getElementById("bookFormYear").value = bookTarget.year;
    document.getElementById("bookFormIsComplete").checked = bookTarget.isCompleted;

    const header = document.getElementById("header-bookForm");
    header.innerHTML = `Edit <span>Book</span>`;

    isEditing = true;
    editingBookId = bookId;

    document.querySelectorAll(".isEditing.active").forEach((label) => {
        label.classList.remove("active");
    });

    const bookElement = document.querySelector(`[data-bookid='${bookId}']`);
    if (bookElement) {
        const labelEditing = bookElement.querySelector(".isEditing");
        if (labelEditing) labelEditing.classList.add("active");
    }

    const formAddBook = document.querySelector(".bookForm-container");
    if (!formAddBook.classList.contains("active")) {
        formAddBook.classList.add("active");
    }

    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.textContent = "Update Book";
}

function searchBook() {
    let isBookFound = false;
    const searchInput = document.getElementById("searchBookTitle").value.toLowerCase();
    const filteredBooks = books.filter((book) => {
        return book.title.toLowerCase().includes(searchInput);
    });

    if (filteredBooks.length > 0) {
        isBookFound = true;
    } else {
        showToast("No books found with the given title!", "danger");
    }

    clearBookLists();

    for (const book of filteredBooks) {
        const bookElement = makeBook(book);

        if (book.isCompleted) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }

    if (completeBookList.children.length === 0) {
        completeBookList.innerHTML = `<p class="not-found empty">The finished reading bookshelf is empty!</p>`;
    }

    if (incompleteBookList.children.length === 0) {
        incompleteBookList.innerHTML = `<p class="not-found empty">The currently reading bookshelf is empty!</p>`;
    }

}

function clearBookLists() {
    document.getElementById("incompleteBookList").innerHTML = "";
    document.getElementById("completeBookList").innerHTML = "";
}

function resetEditState() {
    isEditing = false;
    editingBookId = null;

    const formAddBook = document.querySelector(".bookForm-container");
    formAddBook.classList.remove("active");

    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.textContent = "Add Book to Bookshelf";

    document.getElementById("bookForm").reset();
}

document.addEventListener("DOMContentLoaded", () => {
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const submitForm = document.getElementById("bookForm");

    submitForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.getElementById("bookFormTitle").value;
        const author = document.getElementById("bookFormAuthor").value;
        const year = document.getElementById("bookFormYear").value;
        const isCompleted = document.getElementById("bookFormIsComplete").checked;

        try {
            if (!title || !author || isNaN(year) || year <= 0) {
                throw new Error("Please fill in all fields correctly! Make sure the year is a valid number.");
            }

            if (isEditing && editingBookId !== null) {
                const bookTarget = findBook(editingBookId);

                if (bookTarget) {
                    bookTarget.title = title;
                    bookTarget.author = author;
                    bookTarget.year = year;
                    bookTarget.isCompleted = isCompleted;

                    showToast("Book successfully updated!");

                    const labelEditing = document.getElementById("isEditing");
                    labelEditing.classList.remove("active")

                    const header = document.getElementById("header-bookForm");
                    header.innerHTML = `Add New <span>Book</span>`;

                    resetEditState();
                    document.dispatchEvent(new Event(RENDER_EVENT));
                    saveDataToLocalStorage();
                }
            } else {
                addBook();
            }
        } catch (e) {
            showToast(e.message, "danger");

        }
    })
})

document.addEventListener(RENDER_EVENT, () => {
    clearBookLists();

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }

    if (completeBookList.children.length === 0) {
        completeBookList.innerHTML = `<p class="not-found empty">The finished reading bookshelf is empty!</p>`;
    }

    if (incompleteBookList.children.length === 0) {
        incompleteBookList.innerHTML = `<p class="not-found empty">The currently reading bookshelf is empty!</p>`;
    }
});

document.getElementById("searchBook").addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
});

const showBookForm = document.getElementById("showBookForm");
const formAddBook = document.querySelector(".bookForm-container");
const showBookFormNavbar = document.getElementById("btn-addNavbar")

document.addEventListener('DOMContentLoaded', () => {
    formAddBook.classList.remove('active');

    showBookForm.addEventListener('click', () => {
        formAddBook.classList.toggle('active');

        setTimeout(() => {
            focusInput("bookFormTitle");
        }, 1000);
    });

    showBookFormNavbar.addEventListener('click', () => {
        if (!formAddBook.classList.contains('active')) {
            formAddBook.classList.add('active');
        }

        setTimeout(() => {
            focusInput("bookFormTitle");
        }, 1000);
    });

});

function showToast(message, type = "success") {
    const colors = {
        success: "var(--success-color)",
        danger: "var(--danger-color)",
        warning: "var(--warning-color)",
        info: "var(--info-color)",
    }

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        className: "custom-toast",
        style: {
            display: "flex",
            background: colors[type],
        },
    }).showToast();
}

function focusInput(inputId) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) inputElement.focus();
}

document.getElementById("btn-search").addEventListener('click', () => focusInput("searchBookTitle"));